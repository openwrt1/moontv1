import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

function toAbsoluteUrl(value: string, baseUrl: string): string {
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return value;
  }
}

function toProxyUrl(value: string, baseUrl: string): string {
  const absoluteUrl = toAbsoluteUrl(value, baseUrl);
  return `/api/hls-proxy?url=${encodeURIComponent(absoluteUrl)}`;
}

function rewritePlaylist(content: string, playlistUrl: string): string {
  return content
    .split('\n')
    .map((rawLine) => {
      const line = rawLine.trim();
      if (!line) return rawLine;

      if (line.startsWith('#')) {
        return rawLine.replace(/URI="([^"]+)"/g, (_, uri: string) => {
          return `URI="${toProxyUrl(uri, playlistUrl)}"`;
        });
      }

      return toProxyUrl(line, playlistUrl);
    })
    .join('\n');
}

function buildUpstreamHeaders(targetUrl: URL, request: NextRequest): Headers {
  const headers = new Headers();
  headers.set('User-Agent', USER_AGENT);
  headers.set('Accept', '*/*');
  headers.set('Referer', `${targetUrl.origin}/`);
  headers.set('Origin', targetUrl.origin);

  const range = request.headers.get('range');
  if (range) {
    headers.set('Range', range);
  }

  return headers;
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get('url');
  if (!rawUrl) {
    return NextResponse.json(
      { error: 'Missing url query param' },
      { status: 400 }
    );
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(rawUrl);
  } catch {
    return NextResponse.json(
      { error: 'Invalid url query param' },
      { status: 400 }
    );
  }

  if (!['http:', 'https:'].includes(targetUrl.protocol)) {
    return NextResponse.json(
      { error: 'Unsupported protocol' },
      { status: 400 }
    );
  }

  try {
    const upstreamResponse = await fetch(targetUrl.toString(), {
      headers: buildUpstreamHeaders(targetUrl, request),
      redirect: 'follow',
    });

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        {
          error: 'Upstream request failed',
          status: upstreamResponse.status,
          statusText: upstreamResponse.statusText,
          url: targetUrl.toString(),
        },
        { status: upstreamResponse.status }
      );
    }

    const contentType = upstreamResponse.headers.get('content-type') || '';
    const responseHeaders = new Headers();
    responseHeaders.set(
      'Cache-Control',
      'public, max-age=60, s-maxage=60, stale-while-revalidate=300'
    );
    responseHeaders.set('Access-Control-Allow-Origin', '*');

    if (contentType) {
      responseHeaders.set('Content-Type', contentType);
    }

    const isPlaylist =
      targetUrl.pathname.endsWith('.m3u8') ||
      contentType.includes('application/vnd.apple.mpegurl') ||
      contentType.includes('application/x-mpegurl');

    if (isPlaylist) {
      const playlistText = await upstreamResponse.text();
      const rewrittenPlaylist = rewritePlaylist(
        playlistText,
        targetUrl.toString()
      );
      responseHeaders.set(
        'Content-Type',
        'application/vnd.apple.mpegurl; charset=utf-8'
      );
      return new Response(rewrittenPlaylist, {
        status: 200,
        headers: responseHeaders,
      });
    }

    const acceptRanges = upstreamResponse.headers.get('accept-ranges');
    const contentLength = upstreamResponse.headers.get('content-length');
    const contentRange = upstreamResponse.headers.get('content-range');

    if (acceptRanges) responseHeaders.set('Accept-Ranges', acceptRanges);
    if (contentLength) responseHeaders.set('Content-Length', contentLength);
    if (contentRange) responseHeaders.set('Content-Range', contentRange);

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch HLS resource',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 502 }
    );
  }
}
