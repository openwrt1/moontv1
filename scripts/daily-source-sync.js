#!/usr/bin/env node
/* eslint-disable */
// 每日源列表同步与检测脚本
// 用法 (pm2):
//   pm2 start scripts/daily-source-sync.js --cron "0 6 * * *" --no-autorestart --name moontv-source-sync
// 用法 (crontab):
//   0 6 * * * cd /path/to/moontv1 && node scripts/daily-source-sync.js >> source-sync.log 2>&1
// 环境变量:
//   VERCEL_TOKEN     (可选) 设置后自动触发 Vercel 重新部署
//   VERCEL_TEAM_SLUG (可选) 默认 openwrt1s-projects
//   VERCEL_PROJECT   (可选) 默认 moontvl-xuni

const fs = require('fs');
const path = require('path');

const REMOTE_CONFIG_URL =
  'https://raw.githubusercontent.com/hafrey1/LunaTV-config/main/LunaTV-config.json';

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_TEAM_SLUG = process.env.VERCEL_TEAM_SLUG || 'openwrt1s-projects';
const VERCEL_PROJECT = process.env.VERCEL_PROJECT || 'moontvl-xuni';

async function fetchRemoteConfig() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(REMOTE_CONFIG_URL, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) {
      return {
        success: false,
        error: `HTTP ${res.status}`,
        count: 0,
        sources: [],
      };
    }
    const data = await res.json();
    if (!data.api_site || typeof data.api_site !== 'object') {
      return {
        success: false,
        error: '缺少 api_site 字段',
        count: 0,
        sources: [],
      };
    }
    const entries = Object.entries(data.api_site);
    return {
      success: true,
      count: entries.length,
      sources: entries.map(([key, site]) => ({
        key,
        name: site.name,
        api: site.api,
      })),
      cache_time: data.cache_time,
    };
  } catch (err) {
    clearTimeout(timeout);
    return { success: false, error: err.message, count: 0, sources: [] };
  }
}

async function triggerVercelDeploy() {
  if (!VERCEL_TOKEN) {
    console.log('未设置 VERCEL_TOKEN，跳过 Vercel 部署触发');
    return { skipped: true };
  }
  try {
    const url = `https://api.vercel.com/v13/deployments?teamSlug=${VERCEL_TEAM_SLUG}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: VERCEL_PROJECT,
        target: 'production',
        gitSource: {
          type: 'github',
          org: 'openwrt1',
          repo: 'moontv1',
          ref: 'main',
        },
      }),
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`🚀 Vercel 部署已触发: ${data.url || data.id}`);
      return { success: true, deployId: data.id, deployUrl: data.url };
    }
    console.error(
      `❌ Vercel 部署触发失败: HTTP ${res.status}`,
      data.error?.message || ''
    );
    return {
      success: false,
      error: `HTTP ${res.status}: ${data.error?.message || ''}`,
    };
  } catch (err) {
    console.error('❌ Vercel 部署触发异常:', err.message);
    return { success: false, error: err.message };
  }
}

async function main() {
  const now = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  console.log(`\n========== 源列表同步 ${now} ==========`);

  const result = await fetchRemoteConfig();

  if (result.success) {
    console.log(`✅ 拉取成功，共 ${result.count} 个源`);
    const preview = result.sources
      .slice(0, 5)
      .map((s) => s.name)
      .join('、');
    console.log(`   前5个: ${preview} ...`);
  } else {
    console.error(`❌ 拉取失败: ${result.error}`);
  }

  const report = {
    timestamp: new Date().toISOString(),
    success: result.success,
    count: result.count,
    error: result.success ? undefined : result.error,
    sources: result.success ? result.sources : undefined,
  };

  if (result.success && VERCEL_TOKEN) {
    console.log('\n触发 Vercel 重新部署...');
    const deploy = await triggerVercelDeploy();
    report.deploy = deploy;
  } else if (result.success && !VERCEL_TOKEN) {
    console.log('（设置 VERCEL_TOKEN 环境变量可自动触发 Vercel 部署）');
  }

  const reportPath = path.join(__dirname, '..', 'source-sync-report.json');
  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`\n报告已写入: ${reportPath}`);
  } catch (err) {
    console.error('写入报告失败:', err.message);
  }

  if (!result.success) {
    process.exit(1);
  }
}

main();
