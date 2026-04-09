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
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing image URL' }, { status: 400 });
  }

  let targetUrl = imageUrl;
  try {
    const parsed = new URL(imageUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return NextResponse.json(
        { error: 'Only http/https image URL is supported' },
        { status: 400 }
      );
    }
    targetUrl = parsed.toString();
  } catch {
    return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 });
  }

  try {
    let imageResponse: Response;

    try {
      imageResponse = await fetchImageWithHeaders(targetUrl);
    } catch {
      // 某些站点 https 证书异常时，回退尝试 http
      if (targetUrl.startsWith('https://')) {
        const fallbackUrl = `http://${targetUrl.slice('https://'.length)}`;
        imageResponse = await fetchImageWithHeaders(fallbackUrl);
      } else {
        throw new Error('Error fetching image');
      }
    }

    if (!imageResponse.ok) {
      if (targetUrl.startsWith('https://')) {
        const fallbackUrl = `http://${targetUrl.slice('https://'.length)}`;
        const fallbackResponse = await fetchImageWithHeaders(fallbackUrl);
        if (fallbackResponse.ok) {
          imageResponse = fallbackResponse;
        } else {
          return NextResponse.json(
            { error: imageResponse.statusText || 'Image fetch failed' },
            { status: imageResponse.status }
          );
        }
      } else {
        return NextResponse.json(
          { error: imageResponse.statusText || 'Image fetch failed' },
          { status: imageResponse.status }
        );
      }
    }

    const contentType = imageResponse.headers.get('content-type');

    if (!imageResponse.body) {
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
  } catch {
    return NextResponse.json(
      { error: 'Error fetching image' },
      { status: 500 }
    );
  }
}
