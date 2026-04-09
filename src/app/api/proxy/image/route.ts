import http from 'http';
import https from 'https';
import { NextRequest, NextResponse } from 'next/server';

// 必须使用 Node 运行时，Edge 运行时不支持直接调用 https 模块
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  return new Promise<NextResponse>((resolve) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;

    // 这里的核心：rejectUnauthorized: false 忽略后端请求时的证书错误
    const options = isHttps ? { rejectUnauthorized: false } : {};

    client
      .get(url, options, (res) => {
        // 处理源站重定向
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          return resolve(NextResponse.redirect(res.headers.location));
        }

        if (res.statusCode !== 200) {
          return resolve(
            new NextResponse('Failed to fetch image', {
              status: res.statusCode,
            })
          );
        }

        const headers = new Headers();
        if (res.headers['content-type']) {
          headers.set('Content-Type', res.headers['content-type']);
        }
        headers.set('Cache-Control', 'public, max-age=86400'); // 缓存一天

        // 将 Node.js 的流转换为 Web Stream 以便 Next.js 响应
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { Readable } = require('stream');
        const webStream = Readable.toWeb(res);

        resolve(new NextResponse(webStream as any, { headers }));
      })
      .on('error', (err) => {
        console.error('[Image Proxy] Error fetching image:', err);
        resolve(new NextResponse('Error fetching image', { status: 500 }));
      });
  });
}
