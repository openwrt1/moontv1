/* eslint-disable @typescript-eslint/no-explicit-any,no-console */

import Hls from 'hls.js';

export function getImageProxyUrl(): string | null {
  if (typeof window === 'undefined') return null;

  const enableImageProxy = localStorage.getItem('enableImageProxy');
  if (enableImageProxy !== null) {
    if (!(JSON.parse(enableImageProxy) as boolean)) {
      return null;
    }
  }

  const localImageProxy = localStorage.getItem('imageProxyUrl');
  if (localImageProxy != null) {
    return localImageProxy.trim() ? localImageProxy.trim() : null;
  }

  const serverImageProxy = (window as any).RUNTIME_CONFIG?.IMAGE_PROXY;
  if (serverImageProxy && serverImageProxy.trim()) {
    return serverImageProxy.trim();
  }

  return '/api/image-proxy?url=';
}

export function processImageUrl(originalUrl: string): string {
  if (!originalUrl) return originalUrl;

  const proxyUrl = getImageProxyUrl();
  if (!proxyUrl) return originalUrl;

  return `${proxyUrl}${encodeURIComponent(originalUrl)}`;
}

export function getDoubanProxyUrl(): string | null {
  if (typeof window === 'undefined') return null;

  const enableDoubanProxy = localStorage.getItem('enableDoubanProxy');
  if (enableDoubanProxy !== null) {
    if (!(JSON.parse(enableDoubanProxy) as boolean)) {
      return null;
    }
  }

  const localDoubanProxy = localStorage.getItem('doubanProxyUrl');
  if (localDoubanProxy != null) {
    console.log('[Debug] 豆瓣代理来自 LocalStorage:', localDoubanProxy);
    return localDoubanProxy.trim() ? localDoubanProxy.trim() : null;
  }

  const serverDoubanProxy = (window as any).RUNTIME_CONFIG?.DOUBAN_PROXY;
  console.log(
    '[Debug] 豆瓣代理来自 RUNTIME_CONFIG (数据库/环境变量):',
    serverDoubanProxy
  );
  return serverDoubanProxy && serverDoubanProxy.trim()
    ? serverDoubanProxy.trim()
    : null;
}

export function processDoubanUrl(originalUrl: string): string {
  if (!originalUrl) return originalUrl;

  const proxyUrl = getDoubanProxyUrl();
  if (!proxyUrl) return originalUrl;

  if (proxyUrl.includes('?url=')) {
    return `${proxyUrl}${encodeURIComponent(originalUrl)}`;
  } else {
    try {
      const cleanProxy = proxyUrl.endsWith('/')
        ? proxyUrl.slice(0, -1)
        : proxyUrl;
      const urlObj = new URL(originalUrl);
      return `${cleanProxy}${urlObj.pathname}${urlObj.search}`;
    } catch (e) {
      return originalUrl;
    }
  }
}

export function getHlsProxyUrl(originalUrl: string): string {
  if (!originalUrl) return originalUrl;
  return `/api/hls-proxy?url=${encodeURIComponent(originalUrl)}`;
}

export function shouldFallbackToProxy(data?: {
  fatal?: boolean;
  type?: string;
  details?: string;
  response?: { code?: number };
}): boolean {
  if (!data) return false;
  if (data.response?.code === 403) return true;

  return (
    data.fatal === true &&
    data.type === Hls.ErrorTypes.NETWORK_ERROR &&
    [
      'manifestLoadError',
      'manifestLoadTimeOut',
      'levelLoadError',
      'fragLoadError',
    ].includes(data.details || '')
  );
}

export function cleanHtmlTags(text: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]+>/g, '\n')
    .replace(/\n+/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/^\n+|\n+$/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

export async function getVideoResolutionFromM3u8(m3u8Url: string): Promise<{
  quality: string;
  loadSpeed: string;
  pingTime: number;
}> {
  const runProbe = (
    targetUrl: string,
    mode: 'direct' | 'proxy'
  ): Promise<{ quality: string; loadSpeed: string; pingTime: number }> =>
    new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.muted = true;
      video.preload = 'metadata';
      video.crossOrigin = 'anonymous';

      const hls = new Hls();
      const pingStart = performance.now();
      let pingTime = 0;
      let actualLoadSpeed = '未知';
      let hasSpeedCalculated = false;
      let hasMetadataLoaded = false;
      let fragmentStartTime = 0;
      let settled = false;

      const finish = (
        outcome: 'resolve' | 'reject',
        payload:
          | { quality: string; loadSpeed: string; pingTime: number }
          | Error
      ) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        hls.destroy();
        video.remove();
        if (outcome === 'resolve') {
          resolve(
            payload as { quality: string; loadSpeed: string; pingTime: number }
          );
        } else {
          reject(payload);
        }
      };

      console.log(`[SpeedTest:${mode}] start`, { url: targetUrl });

      const timeout = setTimeout(() => {
        console.warn(`[SpeedTest:${mode}] timeout`, { url: targetUrl });
        finish('reject', new Error('Timeout loading video metadata'));
      }, 4000);

      fetch(targetUrl, {
        method: 'GET',
        mode: mode === 'direct' ? 'no-cors' : 'cors',
      })
        .then(() => {
          pingTime = performance.now() - pingStart;
          console.log(`[SpeedTest:${mode}] ping ok`, {
            url: targetUrl,
            pingTime: Math.round(pingTime),
          });
        })
        .catch((err) => {
          pingTime = performance.now() - pingStart;
          console.warn(`[SpeedTest:${mode}] ping failed`, {
            url: targetUrl,
            message: err instanceof Error ? err.message : String(err),
          });
        });

      const checkAndResolve = () => {
        if (
          !hasMetadataLoaded ||
          (!hasSpeedCalculated && actualLoadSpeed === '未知')
        ) {
          return;
        }

        const width = video.videoWidth;
        const quality =
          width >= 3840
            ? '4K'
            : width >= 2560
            ? '2K'
            : width >= 1920
            ? '1080p'
            : width >= 1280
            ? '720p'
            : width >= 854
            ? '480p'
            : 'SD';

        console.log(`[SpeedTest:${mode}] success`, {
          url: targetUrl,
          quality: width > 0 ? quality : '未知',
          loadSpeed: actualLoadSpeed,
          pingTime: Math.round(pingTime),
        });

        finish('resolve', {
          quality: width > 0 ? quality : '未知',
          loadSpeed: actualLoadSpeed,
          pingTime: Math.round(pingTime),
        });
      };

      video.onerror = (event) => {
        console.error(`[SpeedTest:${mode}] video error`, {
          url: targetUrl,
          event,
        });
        finish('reject', new Error('Failed to load video metadata'));
      };

      hls.on(Hls.Events.FRAG_LOADING, () => {
        fragmentStartTime = performance.now();
      });

      hls.on(Hls.Events.FRAG_LOADED, (_event: any, data: any) => {
        if (fragmentStartTime > 0 && data?.payload && !hasSpeedCalculated) {
          const loadTime = performance.now() - fragmentStartTime;
          const size = data.payload.byteLength || 0;
          if (loadTime > 0 && size > 0) {
            const speedKBps = size / 1024 / (loadTime / 1000);
            actualLoadSpeed =
              speedKBps >= 1024
                ? `${(speedKBps / 1024).toFixed(1)} MB/s`
                : `${speedKBps.toFixed(1)} KB/s`;
            hasSpeedCalculated = true;
            console.log(`[SpeedTest:${mode}] frag loaded`, {
              url: targetUrl,
              size,
              loadSpeed: actualLoadSpeed,
            });
            checkAndResolve();
          }
        }
      });

      hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
        console.error(`[SpeedTest:${mode}] hls error`, {
          url: targetUrl,
          type: data?.type,
          details: data?.details,
          fatal: data?.fatal,
          responseCode: data?.response?.code,
          data,
        });
        if (data?.fatal) {
          finish('reject', new Error(`HLS播放失败: ${data.type}`));
        }
      });

      video.onloadedmetadata = () => {
        hasMetadataLoaded = true;
        console.log(`[SpeedTest:${mode}] metadata loaded`, {
          url: targetUrl,
          width: video.videoWidth,
          height: video.videoHeight,
        });
        checkAndResolve();
      };

      hls.loadSource(targetUrl);
      hls.attachMedia(video);
    });

  console.log('[SpeedTest] direct first', { url: m3u8Url });

  try {
    return await runProbe(m3u8Url, 'direct');
  } catch (directError) {
    console.warn('[SpeedTest] direct failed', {
      url: m3u8Url,
      message:
        directError instanceof Error
          ? directError.message
          : String(directError),
    });
  }

  const proxyUrl = getHlsProxyUrl(m3u8Url);
  console.warn('[SpeedTest] fallback to proxy', {
    directUrl: m3u8Url,
    proxyUrl,
  });
  return runProbe(proxyUrl, 'proxy');
}
