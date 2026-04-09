if (!self.define) {
  let e,
    s = {};
  const n = (n, a) => (
    (n = new URL(n + '.js', a).href),
    s[n] ||
      new Promise((s) => {
        if ('document' in self) {
          const e = document.createElement('script');
          (e.src = n), (e.onload = s), document.head.appendChild(e);
        } else (e = n), importScripts(n), s();
      }).then(() => {
        let e = s[n];
        if (!e) throw new Error(`Module ${n} didn’t register its module`);
        return e;
      })
  );
  self.define = (a, i) => {
    const t =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (s[t]) return;
    let c = {};
    const r = (e) => n(e, t),
      o = { module: { uri: t }, exports: c, require: r };
    s[t] = Promise.all(a.map((e) => o[e] || r(e))).then((e) => (i(...e), c));
  };
}
define(['./workbox-e9849328'], function (e) {
  'use strict';
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: '/VERSION.txt', revision: 'b96dbdcbc3e4415c95b0bf66af883a76' },
        {
          url: '/_next/app-build-manifest.json',
          revision: 'd320f9ef9c7d01d2a700d1208a8d3f10',
        },
        {
          url: '/_next/static/NIvuByAEmvvCYL0zUZdFx/_buildManifest.js',
          revision: '93815b7dd41299cdd11ad3f405f50be4',
        },
        {
          url: '/_next/static/NIvuByAEmvvCYL0zUZdFx/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/chunks/03ab7e39-a68099d7461f3e1c.js',
          revision: 'NIvuByAEmvvCYL0zUZdFx',
        },
        {
          url: '/_next/static/chunks/18610eb7-2a5e2cf34b71095f.js',
          revision: 'NIvuByAEmvvCYL0zUZdFx',
        },
        {
          url: '/_next/static/chunks/190-dc47cd2b4363a083.js',
          revision: 'NIvuByAEmvvCYL0zUZdFx',
        },
        {
          url: '/_next/static/chunks/265-58c92389e27f4869.js',
          revision: 'NIvuByAEmvvCYL0zUZdFx',
        },
        {
          url: '/_next/static/chunks/312-960848d6e345da6d.js',
          revision: 'NIvuByAEmvvCYL0zUZdFx',
        },
        {
          url: '/_next/static/chunks/362-5cb27533790c2801.js',
          revision: 'NIvuByAEmvvCYL0zUZdFx',
        },
        {
          url: '/_next/static/chunks/464-d55ed11f5ef59266.js',
          revision: 'NIvuByAEmvvCYL0zUZdFx',
        },
        {
          url: '/_next/static/chunks/635-8163a8f784371da5.js',
          revision: 'NIvuByAEmvvCYL0zUZdFx',
        },
        {
          url: '/_next/static/chunks/735-d8449a0453033685.js',
          revision: 'NIvuByAEmvvCYL0zUZdFx',
        },
        {
          url: '/_next/static/chunks/862-ba200dbab7c2f92f.js',
          revision: 'NIvuByAEmvvCYL0zUZdFx',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-40b9af14614e004b.js',
          revision: 'NIvuByAEmvvCYL0zUZdFx',
        },
        {
          url: '/_next/static/chunks/app/admin/page-66662d89db0c7f21.js',
          revision: 'NIvuByAEmvvCYL0zUZdFx',
        },
        {
          url: '/_next/static/chunks/app/douban/page-f1f8d5a1719ee3b5.js',
          revision: 'NIvuByAEmvvCYL0zUZdFx',
        },
        {
          url: '/_next/static/chunks/app/layout-08f6fc9b05967c25.js',
          revision: 'NIvuByAEmvvCYL0zUZdFx',
        },
        {
          url: '/_next/static/chunks/app/login/page-8c663ddd47bb32cf.js',
          revision: 'NIvuByAEmvvCYL0zUZdFx',
        },
        {
          url: '/_next/static/chunks/app/page-a8b6872c440b1f83.js',
          revision: 'NIvuByAEmvvCYL0zUZdFx',
        },
        {
          url: '/_next/static/chunks/app/play/page-c689d87c50a48ca6.js',
          revision: 'NIvuByAEmvvCYL0zUZdFx',
        },
        {
          url: '/_next/static/chunks/app/search/page-997c7c7f03e870a8.js',
          revision: 'NIvuByAEmvvCYL0zUZdFx',
        },
        {
          url: '/_next/static/chunks/app/warning/page-27adb028f1e83031.js',
          revision: 'NIvuByAEmvvCYL0zUZdFx',
        },
        {
          url: '/_next/static/chunks/fac77a46-b1883fa126e93b18.js',
          revision: 'NIvuByAEmvvCYL0zUZdFx',
        },
        {
          url: '/_next/static/chunks/framework-6e06c675866dc992.js',
          revision: 'NIvuByAEmvvCYL0zUZdFx',
        },
        {
          url: '/_next/static/chunks/main-1abde1b280b2e62b.js',
          revision: 'NIvuByAEmvvCYL0zUZdFx',
        },
        {
          url: '/_next/static/chunks/main-app-f05f894a9b26de4c.js',
          revision: 'NIvuByAEmvvCYL0zUZdFx',
        },
        {
          url: '/_next/static/chunks/pages/_app-6204a6d24ea04179.js',
          revision: 'NIvuByAEmvvCYL0zUZdFx',
        },
        {
          url: '/_next/static/chunks/pages/_error-8935c5cb63cd5615.js',
          revision: 'NIvuByAEmvvCYL0zUZdFx',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-74597ddde058d1e6.js',
          revision: 'NIvuByAEmvvCYL0zUZdFx',
        },
        {
          url: '/_next/static/css/a0a6bca80b5b48a3.css',
          revision: 'a0a6bca80b5b48a3',
        },
        {
          url: '/_next/static/css/d103e0c782ad9caa.css',
          revision: 'd103e0c782ad9caa',
        },
        { url: '/favicon.ico', revision: '2a440afb7f13a0c990049fc7c383bdd4' },
        {
          url: '/icons/icon-192x192.png',
          revision: 'e214d3db80d2eb6ef7a911b3f9433b81',
        },
        {
          url: '/icons/icon-256x256.png',
          revision: 'a5cd7490191373b684033f1b33c9d9da',
        },
        {
          url: '/icons/icon-384x384.png',
          revision: '8540e29a41812989d2d5bf8f61e1e755',
        },
        {
          url: '/icons/icon-512x512.png',
          revision: '3e5597604f2c5d99d7ab62b02f6863d3',
        },
        { url: '/logo.png', revision: '5c1047adbe59b9a91cc7f8d3d2f95ef4' },
        { url: '/manifest.json', revision: 'f8a4f2b082d6396d3b1a84ce0e267dfe' },
        { url: '/robots.txt', revision: 'e2b2cd8514443456bc6fb9d77b3b1f3e' },
        {
          url: '/screenshot1.png',
          revision: 'd7de3a25686c5b9c9d8c8675bc6109fc',
        },
        {
          url: '/screenshot2.png',
          revision: 'b0b715a3018d2f02aba5d94762473bb6',
        },
        {
          url: '/screenshot3.png',
          revision: '7e454c28e110e291ee12f494fb3cf40c',
        },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: s,
              event: n,
              state: a,
            }) =>
              s && 'opaqueredirect' === s.type
                ? new Response(s.body, {
                    status: 200,
                    statusText: 'OK',
                    headers: s.headers,
                  })
                : s,
          },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: 'static-audio-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: 'static-video-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const s = e.pathname;
        return !s.startsWith('/api/auth/') && !!s.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'others',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
        ],
      }),
      'GET'
    );
});
