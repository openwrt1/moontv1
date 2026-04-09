/* eslint-disable no-console */

import { NextResponse } from 'next/server';

export const runtime = 'edge';

async function fetchImageWithHeaders(targetUrl: string): Promise<Response> {
  let referer = 'https://movie.douban.com/';
  try {
    const parsed = new URL(targetUrl);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      referer = `${parsed.origin}/`;
    }
  } catch {
    // ignore invalid url here; actual fetch will handle it
  }

  return fetch(targetUrl, {
    headers: {
      Referer: referer,
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    },
  });
}

// OrionTV 兼容接口
export async function GET(request: Request) {
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  const logPrefix = `[ImageProxy][${requestId}]`;

  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    console.warn(`${logPrefix} missing url query param`);
    return NextResponse.json({ error: 'Missing image URL' }, { status: 400 });
  }

  let targetUrl = imageUrl;
  let sourceHost = 'unknown';
  try {
    const parsed = new URL(imageUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      console.warn(
        `${logPrefix} unsupported protocol`,
        parsed.protocol,
        imageUrl
      );
      return NextResponse.json(
        { error: 'Only http/https image URL is supported' },
        { status: 400 }
      );
    }
    sourceHost = parsed.hostname;
    targetUrl = parsed.toString();
  } catch {
    console.warn(`${logPrefix} invalid image url`, imageUrl);
    return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 });
  }

  try {
    const fetchWithDiagnostics = async (
      url: string,
      stage: 'primary' | 'fallback'
    ): Promise<Response | null> => {
      try {
        const res = await fetchImageWithHeaders(url);
        if (!res.ok) {
          console.warn(
            `${logPrefix} ${stage} fetch failed`,
            `host=${sourceHost}`,
            `status=${res.status}`,
            `url=${url}`
          );
          return null;
        }
        return res;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(
          `${logPrefix} ${stage} fetch exception`,
          `host=${sourceHost}`,
          `url=${url}`,
          message
        );
        return null;
      }
    };

    let imageResponse = await fetchWithDiagnostics(targetUrl, 'primary');
    let finalUrl = targetUrl;

    if (!imageResponse && targetUrl.startsWith('https://')) {
      const fallbackUrl = `http://${targetUrl.slice('https://'.length)}`;
      console.warn(
        `${logPrefix} https unavailable, trying http fallback`,
        `host=${sourceHost}`,
        `https=${targetUrl}`,
        `http=${fallbackUrl}`
      );
      imageResponse = await fetchWithDiagnostics(fallbackUrl, 'fallback');
      if (imageResponse) {
        finalUrl = fallbackUrl;
        console.warn(
          `${logPrefix} fallback recovered`,
          `host=${sourceHost}`,
          `using=${finalUrl}`
        );
      }
    }

    if (!imageResponse) {
      console.error(
        `${logPrefix} image fetch failed after retries`,
        `host=${sourceHost}`,
        `url=${targetUrl}`
      );
      return NextResponse.json(
        { error: 'Image fetch failed' },
        { status: 502 }
      );
    }

    const contentType = imageResponse.headers.get('content-type');
    if (!contentType) {
      console.warn(`${logPrefix} missing content-type`, `host=${sourceHost}`);
    } else if (!contentType.startsWith('image/')) {
      console.warn(
        `${logPrefix} non-image content-type`,
        `host=${sourceHost}`,
        contentType,
        `url=${finalUrl}`
      );
    }

    if (!imageResponse.body) {
      console.error(
        `${logPrefix} response has no body`,
        `host=${sourceHost}`,
        `url=${finalUrl}`
      );
      return NextResponse.json(
        { error: 'Image response has no body' },
        { status: 500 }
      );
    }

    const headers = new Headers();
    if (contentType) {
      headers.set('Content-Type', contentType);
    }

    headers.set('Cache-Control', 'public, max-age=15720000, s-maxage=15720000');
    headers.set('CDN-Cache-Control', 'public, s-maxage=15720000');
    headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=15720000');

    return new Response(imageResponse.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      `${logPrefix} unexpected error`,
      `host=${sourceHost}`,
      message
    );
    return NextResponse.json(
      { error: 'Error fetching image' },
      { status: 500 }
    );
  }
}
