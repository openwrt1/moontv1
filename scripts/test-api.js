// scripts/test-api.js
// 使用方法: node scripts/test-api.js <API_URL>

const fetch = global.fetch || require('node-fetch');

const apiUrl = process.argv[2];

if (!apiUrl) {
  console.error('❌ 请提供 API 地址作为参数');
  console.log(
    '示例: node scripts/test-api.js https://jszyapi.com/api.php/provide/vod/'
  );
  process.exit(1);
}

console.log(`🔍 正在测试 API: ${apiUrl}`);

async function test() {
  try {
    // 构造请求 URL，模拟 MoonTV 的搜索请求
    const targetUrl = apiUrl.includes('?')
      ? `${apiUrl}&ac=videolist&pg=1`
      : `${apiUrl}?ac=videolist&pg=1`;

    const start = Date.now();
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });
    const duration = Date.now() - start;

    if (!res.ok) {
      throw new Error(`HTTP 状态码错误: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    if (data.list && Array.isArray(data.list)) {
      console.log(`✅ 测试成功! (耗时 ${duration}ms)`);
      console.log(`📚 资源总数: ${data.total}`);
      console.log(`📄 本页数量: ${data.list.length}`);

      if (data.list.length > 0) {
        const item = data.list[0];
        console.log('\n--- 最新资源示例 ---');
        console.log(`ID: ${item.vod_id}`);
        console.log(`名称: ${item.vod_name}`);
        console.log(`更新: ${item.vod_time}`);
        // 提取播放链接域名查看是否已变更
        const firstUrl =
          item.vod_play_url?.split('#')[0]?.split('$').pop() || '无';
        console.log(`播放链接: ${firstUrl}`);
      }
    } else {
      console.error('❌ API 返回格式不符合预期 (缺少 list 字段)');
    }
  } catch (error) {
    console.error(`❌ 测试失败: ${error.message}`);
  }
}

test();
