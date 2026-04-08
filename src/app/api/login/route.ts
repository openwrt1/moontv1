/* eslint-disable no-console,@typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

import { getConfig } from '@/lib/config';
import { db } from '@/lib/db';

export const runtime = 'edge';

// 读取存储类型环境变量，默认 localstorage
const STORAGE_TYPE =
  (process.env.NEXT_PUBLIC_STORAGE_TYPE as
    | 'localstorage'
    | 'redis'
    | 'd1'
    | 'upstash'
    | undefined) || 'localstorage';

// 生成签名
async function generateSignature(
  data: string,
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  // 导入密钥
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // 生成签名
  const signature = await crypto.subtle.sign('HMAC', key, messageData);

  // 转换为十六进制字符串
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// 生成认证Cookie（带签名）
async function generateAuthCookie(
  username?: string,
  password?: string,
  role?: 'owner' | 'admin' | 'user',
  includePassword = false
): Promise<string> {
  const authData: any = { role: role || 'user' };

  // 只在需要时包含 password
  if (includePassword && password) {
    authData.password = password;
  }

  // 获取环境变量密码，如果没有则使用默认值 admin
  const secret = process.env.ADMIN_PASSWORD || process.env.PASSWORD || 'admin';

  if (username) {
    authData.username = username;
    // 使用密码作为密钥对用户名进行签名
    const signature = await generateSignature(username, secret);
    authData.signature = signature;
    authData.timestamp = Date.now(); // 添加时间戳防重放攻击
  }

  return encodeURIComponent(JSON.stringify(authData));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = body.username;
    const password = body.password;

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: '用户名不能为空' }, { status: 400 });
    }
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: '密码不能为空' }, { status: 400 });
    }

    // 1. 自动检测环境
    const isVercel = !!process.env.VERCEL;
    const isLocal = process.env.NODE_ENV === 'development';
    // Cloudflare 通常有 CF_PAGES 变量，或者 DB 绑定
    const isCloudflare =
      !!process.env.CF_PAGES || process.env.STORAGE_TYPE === 'd1';

    // 设置默认的站长账号密码（优先读环境变量，否则默认 admin/admin，方便本地和 Vercel 调试）
    const envUser =
      process.env.ADMIN_USERNAME || process.env.USERNAME || 'admin';
    const envPass =
      process.env.ADMIN_PASSWORD || process.env.PASSWORD || 'admin';

    if (isLocal) {
      console.log(
        `[Debug] 当前期望账号: ${envUser}, 期望密码: ${envPass} | 你输入的账号: ${username}`
      );
    }

    // 2. 优先校验站长账号密码（环境变量匹配）
    if (username === envUser && password === envPass) {
      const response = NextResponse.json({ ok: true });
      // 如果不是 Cloudflare D1 环境，建议把密码包含进 Cookie 方便纯前端(localstorage)模式校验
      const includePass = !isCloudflare && STORAGE_TYPE === 'localstorage';

      const cookieValue = await generateAuthCookie(
        username,
        password,
        'owner',
        includePass
      );
      const expires = new Date();
      expires.setDate(expires.getDate() + 7); // 7天过期

      response.cookies.set('auth', cookieValue, {
        path: '/',
        expires,
        sameSite: 'lax',
        httpOnly: false,
        secure: false,
      });

      return response;
    }

    // 3. 拦截 Vercel 和本地开发环境的无效数据库查询
    // 如果环境变量没匹配上，且处于 Vercel 或本地（且没有配置 Redis/Upstash 等外部数据库），直接返回账号密码错误，防止触发 D1 的 prepare 崩溃
    if ((isVercel || isLocal) && STORAGE_TYPE === 'd1') {
      return NextResponse.json(
        { error: '账号或密码错误（本地/Vercel环境未绑定D1数据库）' },
        { status: 401 }
      );
    }

    if (STORAGE_TYPE === 'localstorage') {
      return NextResponse.json({ error: '账号或密码错误' }, { status: 401 });
    }

    // 4. Cloudflare D1 或外部 Redis/Upstash 数据库模式：继续走数据库用户校验
    try {
      const config = await getConfig();
      const user = config.UserConfig.Users.find((u) => u.username === username);

      if (user && user.banned) {
        return NextResponse.json({ error: '用户被封禁' }, { status: 401 });
      }

      // 尝试去数据库校验普通用户
      const pass = await db.verifyUser(username, password);
      if (!pass) {
        return NextResponse.json(
          { error: '用户名或密码错误' },
          { status: 401 }
        );
      }

      // 验证成功
      const response = NextResponse.json({ ok: true });
      const cookieValue = await generateAuthCookie(
        username,
        password,
        user?.role || 'user',
        false
      );
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);

      response.cookies.set('auth', cookieValue, {
        path: '/',
        expires,
        sameSite: 'lax',
        httpOnly: false,
        secure: false,
      });

      return response;
    } catch (err) {
      console.error('数据库验证失败', err);
      return NextResponse.json(
        { error: '系统环境异常，请使用环境变量管理员账号登录' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('登录接口异常', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
