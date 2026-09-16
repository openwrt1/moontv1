#!/usr/bin/env node
/* eslint-disable */
// AUTO-GENERATED SCRIPT: Converts config.json to TypeScript definition.
// Usage: node scripts/convert-config.js
// 构建时从 LunaTV-config 远程拉取最新源列表，替换本地 api_site。

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const configPath = path.join(projectRoot, 'config.json');
const libDir = path.join(projectRoot, 'src', 'lib');
const runtimePath = path.join(libDir, 'runtime.ts');

const REMOTE_CONFIG_URL =
  'https://raw.githubusercontent.com/hafrey1/LunaTV-config/main/LunaTV-config.json';

async function fetchRemoteConfig() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(REMOTE_CONFIG_URL, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) {
      console.warn(
        `远程配置拉取失败: HTTP ${res.status}，使用本地 config.json`
      );
      return null;
    }
    const remote = await res.json();
    if (!remote.api_site || typeof remote.api_site !== 'object') {
      console.warn('远程配置格式异常: 缺少 api_site，使用本地 config.json');
      return null;
    }
    const count = Object.keys(remote.api_site).length;
    console.log(`已从远程拉取 ${count} 个源`);
    return remote;
  } catch (err) {
    console.warn('远程配置拉取失败，使用本地 config.json:', err.message);
    return null;
  }
}

async function main() {
  let rawConfig;
  try {
    rawConfig = fs.readFileSync(configPath, 'utf8');
  } catch (err) {
    console.error(`无法读取 ${configPath}:`, err);
    process.exit(1);
  }

  let config;
  try {
    config = JSON.parse(rawConfig);
  } catch (err) {
    console.error('config.json 不是有效的 JSON:', err);
    process.exit(1);
  }

  const remote = await fetchRemoteConfig();
  if (remote) {
    config.api_site = remote.api_site;
    if (remote.cache_time) {
      config.cache_time = remote.cache_time;
    }
  }

  const tsContent =
    `// 该文件由 scripts/convert-config.js 自动生成，请勿手动修改\n` +
    `/* eslint-disable */\n\n` +
    `export const config = ${JSON.stringify(config, null, 2)} as const;\n\n` +
    `export type RuntimeConfig = typeof config;\n\n` +
    `export default config;\n`;

  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }

  try {
    fs.writeFileSync(runtimePath, tsContent, 'utf8');
    console.log('已生成 src/lib/runtime.ts');
  } catch (err) {
    console.error('写入 runtime.ts 失败:', err);
    process.exit(1);
  }
}

main();
