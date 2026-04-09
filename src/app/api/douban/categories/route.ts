/* eslint-disable no-console */

import { NextResponse } from 'next/server';

import { getCacheTime } from '@/lib/config';
import { DoubanItem, DoubanResult } from '@/lib/types';

interface DoubanCategoryApiResponse {
  total: number;
  items: Array<{
    id: string;
    title: string;
    card_subtitle: string;
    pic: {
      large: string;
      normal: string;
    };
    rating: {
      value: number;
    };
  }>;
}

interface DoubanSearchSubjectsResponse {
  subjects: Array<{
    id: string;
    title: string;
    cover: string;
    rate: string;
  }>;
}

function getBaseHeaders(includeOrigin = true): HeadersInit {
  const headers: HeadersInit = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    Referer: 'https://movie.douban.com/',
    Accept: 'application/json, text/plain, */*',
  };

  if (includeOrigin) {
    headers['Origin'] = 'https://movie.douban.com';
  }

  return headers;
}

async function fetchWithTimeout(
  url: string,
  headers: HeadersInit
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function mapRexxarItems(doubanData: DoubanCategoryApiResponse): DoubanItem[] {
  return doubanData.items.map((item) => ({
    id: item.id,
    title: item.title,
    poster: item.pic?.normal || item.pic?.large || '',
    rate: item.rating?.value ? item.rating.value.toFixed(1) : '',
    year: item.card_subtitle?.match(/(\d{4})/)?.[1] || '',
  }));
}

function mapSearchSubjectsItems(
  doubanData: DoubanSearchSubjectsResponse
): DoubanItem[] {
  return (doubanData.subjects || []).map((item) => ({
    id: item.id,
    title: item.title,
    poster: item.cover || '',
    rate: item.rate || '',
    year: '',
  }));
}

function getFallbackTag(
  kind: 'tv' | 'movie',
  category: string,
  type: string
): string {
  if (kind === 'movie') {
    return category || '\u70ed\u95e8';
  }

  if (type === 'show' || category === 'show') {
    return '\u7efc\u827a';
  }

  return '\u7535\u89c6\u5267';
}

async function fetchDoubanData(
  kind: 'tv' | 'movie',
  category: string,
  type: string,
  pageStart: number,
  pageLimit: number,
  requestId: string
): Promise<DoubanItem[]> {
  const rexxarUrl = `https://m.douban.com/rexxar/api/v2/subject/recent_hot/${kind}?start=${pageStart}&limit=${pageLimit}&category=${encodeURIComponent(
    category
  )}&type=${encodeURIComponent(type)}`;

  const attempts: Array<{
    name: string;
    url: string;
    headers: HeadersInit;
    parser: (payload: unknown) => DoubanItem[];
  }> = [
    {
      name: 'rexxar_with_origin',
      url: rexxarUrl,
      headers: getBaseHeaders(true),
      parser: (payload) => mapRexxarItems(payload as DoubanCategoryApiResponse),
    },
    {
      name: 'rexxar_without_origin',
      url: rexxarUrl,
      headers: getBaseHeaders(false),
      parser: (payload) => mapRexxarItems(payload as DoubanCategoryApiResponse),
    },
    {
      name: 'search_subjects_fallback',
      url: `https://movie.douban.com/j/search_subjects?type=${kind}&tag=${encodeURIComponent(
        getFallbackTag(kind, category, type)
      )}&sort=recommend&page_limit=${pageLimit}&page_start=${pageStart}`,
      headers: getBaseHeaders(false),
      parser: (payload) =>
        mapSearchSubjectsItems(payload as DoubanSearchSubjectsResponse),
    },
  ];

  let lastError: Error | null = null;

  for (const attempt of attempts) {
    try {
      console.log(
        `[DoubanCategories][${requestId}] attempt=${attempt.name} start url=${attempt.url}`
      );

      const response = await fetchWithTimeout(attempt.url, attempt.headers);
      if (!response.ok) {
        const body = await response.text().catch(() => '');
        console.warn(
          `[DoubanCategories][${requestId}] attempt=${attempt.name} status=${
            response.status
          } body=${body.slice(0, 200)}`
        );
        lastError = new Error(`HTTP ${response.status}`);
        continue;
      }

      const payload = await response.json();
      const list = attempt.parser(payload);
      if (!Array.isArray(list) || list.length === 0) {
        console.warn(
          `[DoubanCategories][${requestId}] attempt=${attempt.name} returned empty list`
        );
      }

      console.log(
        `[DoubanCategories][${requestId}] attempt=${attempt.name} success count=${list.length}`
      );
      return list;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(
        `[DoubanCategories][${requestId}] attempt=${attempt.name} exception=${message}`
      );
      lastError = error instanceof Error ? error : new Error(message);
    }
  }

  throw lastError || new Error('All douban attempts failed');
}

export const runtime = 'edge';

export async function GET(request: Request) {
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  const { searchParams } = new URL(request.url);

  const kind = (searchParams.get('kind') || 'movie') as 'tv' | 'movie';
  const category = searchParams.get('category');
  const type = searchParams.get('type');
  const pageLimit = parseInt(searchParams.get('limit') || '20');
  const pageStart = parseInt(searchParams.get('start') || '0');

  if (!kind || !category || !type) {
    return NextResponse.json(
      { error: 'Missing required params: kind/category/type' },
      { status: 400 }
    );
  }

  if (!['tv', 'movie'].includes(kind)) {
    return NextResponse.json(
      { error: 'kind must be tv or movie' },
      { status: 400 }
    );
  }

  if (pageLimit < 1 || pageLimit > 100) {
    return NextResponse.json(
      { error: 'limit must be within 1-100' },
      { status: 400 }
    );
  }

  if (pageStart < 0) {
    return NextResponse.json({ error: 'start must be >= 0' }, { status: 400 });
  }

  try {
    console.log(
      `[DoubanCategories][${requestId}] request kind=${kind} category=${category} type=${type} start=${pageStart} limit=${pageLimit}`
    );

    const list = await fetchDoubanData(
      kind,
      category,
      type,
      pageStart,
      pageLimit,
      requestId
    );

    const response: DoubanResult = {
      code: 200,
      message: 'ok',
      list,
    };

    const cacheTime = await getCacheTime();
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': `public, max-age=${cacheTime}, s-maxage=${cacheTime}`,
        'CDN-Cache-Control': `public, s-maxage=${cacheTime}`,
        'Vercel-CDN-Cache-Control': `public, s-maxage=${cacheTime}`,
      },
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    console.error(`[DoubanCategories][${requestId}] failed details=${details}`);

    return NextResponse.json(
      { error: 'Failed to fetch douban categories', details },
      { status: 500 }
    );
  }
}
