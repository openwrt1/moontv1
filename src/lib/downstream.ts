/* eslint-disable no-console */
import { API_CONFIG, ApiSite, getConfig } from '@/lib/config';
import { SearchResult } from '@/lib/types';
import { cleanHtmlTags } from '@/lib/utils';

interface ApiSearchItem {
  vod_id: string;
  vod_name: string;
  vod_pic: string;
  vod_remarks?: string;
  vod_play_url?: string;
  vod_class?: string;
  vod_year?: string;
  vod_content?: string;
  vod_douban_id?: number;
  type_name?: string;
}

interface SearchLogContext {
  requestId?: string;
  originalQuery?: string;
}

function getResponsePreview(text: string, maxLength = 300): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength)}...`;
}

export async function searchFromApi(
  apiSite: ApiSite,
  query: string,
  context?: SearchLogContext
): Promise<SearchResult[]> {
  try {
    const prefix = context?.requestId
      ? `[Downstream][${context.requestId}]`
      : '[Downstream]';
    console.log(`${prefix} 🔍 正在搜索源 [${apiSite.name}] 关键字: ${query}`);
    const apiBaseUrl = apiSite.api;
    const apiUrl =
      apiBaseUrl + API_CONFIG.search.path + encodeURIComponent(query);
    const apiName = apiSite.name;

    // 添加超时处理
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(apiUrl, {
      headers: API_CONFIG.search.headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const bodyText = await response.text().catch(() => '');
      const contentType = response.headers.get('content-type') || 'unknown';
      console.warn(
        `${prefix} ❌ 源 [${apiSite.name}] 请求失败: ${response.status}`
      );
      if (bodyText) {
        console.warn(
          `${prefix} 📄 源 [${apiSite.name}] 错误响应片段:`,
          getResponsePreview(bodyText)
        );
      }
      console.warn(
        `${prefix} ℹ️ 源 [${apiSite.name}] 状态详情:`,
        JSON.stringify({
          status: response.status,
          contentType,
          url: apiUrl,
          query,
          originalQuery: context?.originalQuery || query,
        })
      );
      return [];
    }

    // 先获取文本，防止非 JSON 响应导致崩溃
    const text = await response.text();

    // 检查是否是"暂不支持搜索"等非 JSON 提示
    if (
      text.includes('暂不支持') ||
      text.trim().startsWith('Search not supported')
    ) {
      console.log(`${prefix} ⚠️ 源 [${apiSite.name}] 提示: 不支持搜索`);
      return [];
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      const contentType = response.headers.get('content-type') || 'unknown';
      console.warn(
        `${prefix} 🚫 源 [${apiSite.name}] 返回数据格式错误 (非JSON)`
      );
      console.warn(
        `${prefix} 📄 源 [${apiSite.name}] 非JSON响应片段:`,
        getResponsePreview(text)
      );
      console.warn(
        `${prefix} ℹ️ 源 [${apiSite.name}] 响应详情:`,
        JSON.stringify({
          status: response.status,
          contentType,
          url: apiUrl,
          query,
          originalQuery: context?.originalQuery || query,
        })
      );
      return [];
    }

    if (
      !data ||
      !data.list ||
      !Array.isArray(data.list) ||
      data.list.length === 0
    ) {
      console.log(`${prefix} ⚠️ 源 [${apiSite.name}] 未找到结果`);
      return [];
    }
    // 处理第一页结果
    const results = data.list.map((item: ApiSearchItem) => {
      let episodes: string[] = [];

      // 使用正则表达式从 vod_play_url 提取 m3u8 链接
      if (item.vod_play_url) {
        const m3u8Regex = /\$(https?:\/\/[^"'\s]+?\.m3u8)/g;
        // 先用 $$$ 分割
        const vod_play_url_array = item.vod_play_url.split('$$$');
        // 对每个分片做匹配，取匹配到最多的作为结果
        vod_play_url_array.forEach((url: string) => {
          const matches = url.match(m3u8Regex) || [];
          if (matches.length > episodes.length) {
            episodes = matches;
          }
        });
      }

      episodes = Array.from(new Set(episodes)).map((link: string) => {
        link = link.substring(1); // 去掉开头的 $
        const parenIndex = link.indexOf('(');
        return parenIndex > 0 ? link.substring(0, parenIndex) : link;
      });

      return {
        id: item.vod_id.toString(),
        title: item.vod_name.trim().replace(/\s+/g, ' '),
        poster: item.vod_pic,
        episodes,
        source: apiSite.key,
        source_name: apiName,
        class: item.vod_class,
        year: item.vod_year
          ? item.vod_year.match(/\d{4}/)?.[0] || ''
          : 'unknown',
        desc: cleanHtmlTags(item.vod_content || ''),
        type_name: item.type_name,
        douban_id: item.vod_douban_id,
      };
    });

    const config = await getConfig();
    const MAX_SEARCH_PAGES: number = config.SiteConfig.SearchDownstreamMaxPage;

    // 获取总页数
    const pageCount = data.pagecount || 1;
    // 确定需要获取的额外页数
    const pagesToFetch = Math.min(pageCount - 1, MAX_SEARCH_PAGES - 1);

    // 如果有额外页数，获取更多页的结果
    if (pagesToFetch > 0) {
      const additionalPagePromises = [];

      for (let page = 2; page <= pagesToFetch + 1; page++) {
        const pageUrl =
          apiBaseUrl +
          API_CONFIG.search.pagePath
            .replace('{query}', encodeURIComponent(query))
            .replace('{page}', page.toString());

        const pagePromise = (async () => {
          try {
            const pageController = new AbortController();
            const pageTimeoutId = setTimeout(
              () => pageController.abort(),
              15000
            );

            const pageResponse = await fetch(pageUrl, {
              headers: API_CONFIG.search.headers,
              signal: pageController.signal,
            });

            clearTimeout(pageTimeoutId);

            if (!pageResponse.ok) return [];

            const pageText = await pageResponse.text();
            let pageData;
            try {
              pageData = JSON.parse(pageText);
            } catch {
              const contentType =
                pageResponse.headers.get('content-type') || 'unknown';
              console.warn(
                `${prefix} 📄 源 [${apiSite.name}] 第 ${page} 页非JSON，已跳过:`,
                getResponsePreview(pageText)
              );
              console.warn(
                `${prefix} ℹ️ 源 [${apiSite.name}] 第 ${page} 页详情:`,
                JSON.stringify({
                  status: pageResponse.status,
                  contentType,
                  url: pageUrl,
                })
              );
              return [];
            }

            if (!pageData || !pageData.list || !Array.isArray(pageData.list))
              return [];

            return pageData.list.map((item: ApiSearchItem) => {
              let episodes: string[] = [];

              // 使用正则表达式从 vod_play_url 提取 m3u8 链接
              if (item.vod_play_url) {
                const m3u8Regex = /\$(https?:\/\/[^"'\s]+?\.m3u8)/g;
                episodes = item.vod_play_url.match(m3u8Regex) || [];
              }

              episodes = Array.from(new Set(episodes)).map((link: string) => {
                link = link.substring(1); // 去掉开头的 $
                const parenIndex = link.indexOf('(');
                return parenIndex > 0 ? link.substring(0, parenIndex) : link;
              });

              return {
                id: item.vod_id.toString(),
                title: item.vod_name.trim().replace(/\s+/g, ' '),
                poster: item.vod_pic,
                episodes,
                source: apiSite.key,
                source_name: apiName,
                class: item.vod_class,
                year: item.vod_year
                  ? item.vod_year.match(/\d{4}/)?.[0] || ''
                  : 'unknown',
                desc: cleanHtmlTags(item.vod_content || ''),
                type_name: item.type_name,
                douban_id: item.vod_douban_id,
              };
            });
          } catch (error) {
            return [];
          }
        })();

        additionalPagePromises.push(pagePromise);
      }

      // 等待所有额外页的结果
      const additionalResults = await Promise.all(additionalPagePromises);

      // 合并所有页的结果
      additionalResults.forEach((pageResults) => {
        if (pageResults.length > 0) {
          results.push(...pageResults);
        }
      });
    }

    console.log(
      `${prefix} ✅ 源 [${apiSite.name}] 搜索完成，共找到 ${results.length} 个结果`
    );
    return results;
  } catch (error) {
    const prefix = context?.requestId
      ? `[Downstream][${context.requestId}]`
      : '[Downstream]';
    console.error(`${prefix} 🚫 源 [${apiSite.name}] 发生错误:`, error);
    return [];
  }
}

// 匹配 m3u8 链接的正则
const M3U8_PATTERN = /(https?:\/\/[^"'\s]+?\.m3u8)/g;

export async function getDetailFromApi(
  apiSite: ApiSite,
  id: string
): Promise<SearchResult> {
  if (apiSite.detail) {
    return handleSpecialSourceDetail(id, apiSite);
  }

  const detailUrl = `${apiSite.api}${API_CONFIG.detail.path}${id}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  let response;
  try {
    response = await fetch(detailUrl, {
      headers: API_CONFIG.detail.headers,
      signal: controller.signal,
    });
  } catch (error) {
    throw new Error(`源站连接失败或超时: ${(error as Error).message}`);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`源站返回错误状态码: ${response.status}`);
  }

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    console.error(
      `[Downstream] 🚫 源 [${apiSite.name}] 详情解析失败，内容片段:`,
      text.substring(0, 100)
    );
    throw new Error('源站返回了非标准数据格式(可能被防盗链拦截或已失效)');
  }

  if (
    !data ||
    !data.list ||
    !Array.isArray(data.list) ||
    data.list.length === 0
  ) {
    throw new Error('源站未返回有效的视频详情');
  }

  const videoDetail = data.list[0];
  let episodes: string[] = [];

  // 处理播放源拆分
  if (videoDetail.vod_play_url) {
    const playSources = videoDetail.vod_play_url.split('$$$');
    if (playSources.length > 0) {
      const mainSource = playSources[0];
      const episodeList = mainSource.split('#');
      episodes = episodeList
        .map((ep: string) => {
          const parts = ep.split('$');
          return parts.length > 1 ? parts[1] : '';
        })
        .filter(
          (url: string) =>
            url && (url.startsWith('http://') || url.startsWith('https://'))
        );
    }
  }

  // 如果播放源为空，则尝试从内容中解析 m3u8
  if (episodes.length === 0 && videoDetail.vod_content) {
    const matches = videoDetail.vod_content.match(M3U8_PATTERN) || [];
    episodes = matches.map((link: string) => link.replace(/^\$/, ''));
  }

  return {
    id: id.toString(),
    title: videoDetail.vod_name,
    poster: videoDetail.vod_pic,
    episodes,
    source: apiSite.key,
    source_name: apiSite.name,
    class: videoDetail.vod_class,
    year: videoDetail.vod_year
      ? videoDetail.vod_year.match(/\d{4}/)?.[0] || ''
      : 'unknown',
    desc: cleanHtmlTags(videoDetail.vod_content),
    type_name: videoDetail.type_name,
    douban_id: videoDetail.vod_douban_id,
  };
}

async function handleSpecialSourceDetail(
  id: string,
  apiSite: ApiSite
): Promise<SearchResult> {
  const detailUrl = `${apiSite.detail}/index.php/vod/detail/id/${id}.html`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  let response;
  try {
    response = await fetch(detailUrl, {
      headers: API_CONFIG.detail.headers,
      signal: controller.signal,
    });
  } catch (error) {
    throw new Error(`源站连接失败或超时: ${(error as Error).message}`);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`源站页面请求失败: ${response.status}`);
  }

  const html = await response.text();
  let matches: string[] = [];

  if (apiSite.key === 'ffzy') {
    const ffzyPattern =
      /\$(https?:\/\/[^"'\s]+?\/\d{8}\/\d+_[a-f0-9]+\/index\.m3u8)/g;
    matches = html.match(ffzyPattern) || [];
  }

  if (matches.length === 0) {
    const generalPattern = /\$(https?:\/\/[^"'\s]+?\.m3u8)/g;
    matches = html.match(generalPattern) || [];
  }

  // 去重并清理链接前缀
  matches = Array.from(new Set(matches)).map((link: string) => {
    link = link.substring(1); // 去掉开头的 $
    const parenIndex = link.indexOf('(');
    return parenIndex > 0 ? link.substring(0, parenIndex) : link;
  });

  // 提取标题
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const titleText = titleMatch ? titleMatch[1].trim() : '';

  // 提取描述
  const descMatch = html.match(
    /<div[^>]*class=["']sketch["'][^>]*>([\s\S]*?)<\/div>/
  );
  const descText = descMatch ? cleanHtmlTags(descMatch[1]) : '';

  // 提取封面
  const coverMatch = html.match(/(https?:\/\/[^"'\s]+?\.jpg)/g);
  const coverUrl = coverMatch ? coverMatch[0].trim() : '';

  // 提取年份
  const yearMatch = html.match(/>(\d{4})</);
  const yearText = yearMatch ? yearMatch[1] : 'unknown';

  return {
    id,
    title: titleText,
    poster: coverUrl,
    episodes: matches,
    source: apiSite.key,
    source_name: apiSite.name,
    class: '',
    year: yearText,
    desc: descText,
    type_name: '',
    douban_id: 0,
  };
}
