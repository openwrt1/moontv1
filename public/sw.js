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
    const c =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (s[c]) return;
    let t = {};
    const r = (e) => n(e, c),
      o = { module: { uri: c }, exports: t, require: r };
    s[c] = Promise.all(a.map((e) => o[e] || r(e))).then((e) => (i(...e), t));
  };
}
define(['./workbox-e9849328'], function (e) {
  'use strict';
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: '/VERSION.txt', revision: '823c43511c9b5a2708af12506a524d1a' },
        {
          url: '/_next/app-build-manifest.json',
          revision: '7568909192a911de1ec14e70a3f4942c',
        },
        {
          url: '/_next/static/chunks/03ab7e39-f9aa929d820f85ca.js',
          revision: 'fQR3vWWpVSRHKHK1xMAgh',
        },
        {
          url: '/_next/static/chunks/239-7d3d21925d079691.js',
          revision: 'fQR3vWWpVSRHKHK1xMAgh',
        },
        {
          url: '/_next/static/chunks/600-0cc6dd3addd277d7.js',
          revision: 'fQR3vWWpVSRHKHK1xMAgh',
        },
        {
          url: '/_next/static/chunks/603-c0a844f2b90f2799.js',
          revision: 'fQR3vWWpVSRHKHK1xMAgh',
        },
        {
          url: '/_next/static/chunks/72-87327d7413786de1.js',
          revision: 'fQR3vWWpVSRHKHK1xMAgh',
        },
        {
          url: '/_next/static/chunks/812-b637b4a07a06118a.js',
          revision: 'fQR3vWWpVSRHKHK1xMAgh',
        },
        {
          url: '/_next/static/chunks/884-c6ace7d4538a1037.js',
          revision: 'fQR3vWWpVSRHKHK1xMAgh',
        },
        {
          url: '/_next/static/chunks/9-9705f772ceebb741.js',
          revision: 'fQR3vWWpVSRHKHK1xMAgh',
        },
        {
          url: '/_next/static/chunks/953-7d8a58e8c0008f46.js',
          revision: 'fQR3vWWpVSRHKHK1xMAgh',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-29686f945ea78dd5.js',
          revision: 'fQR3vWWpVSRHKHK1xMAgh',
        },
        {
          url: '/_next/static/chunks/app/admin/page-c23439d3bde0bbd4.js',
          revision: 'fQR3vWWpVSRHKHK1xMAgh',
        },
        {
          url: '/_next/static/chunks/app/douban/page-ad1a8dc8c8a008a8.js',
          revision: 'fQR3vWWpVSRHKHK1xMAgh',
        },
        {
          url: '/_next/static/chunks/app/layout-e6bf567d6e540d37.js',
          revision: 'fQR3vWWpVSRHKHK1xMAgh',
        },
        {
          url: '/_next/static/chunks/app/login/page-f7508f4e602ec5c4.js',
          revision: 'fQR3vWWpVSRHKHK1xMAgh',
        },
        {
          url: '/_next/static/chunks/app/page-53f5d21047206bd9.js',
          revision: 'fQR3vWWpVSRHKHK1xMAgh',
        },
        {
          url: '/_next/static/chunks/app/play/page-da755d3cad5dbaf7.js',
          revision: 'fQR3vWWpVSRHKHK1xMAgh',
        },
        {
          url: '/_next/static/chunks/app/search/page-a87e912da78ae42c.js',
          revision: 'fQR3vWWpVSRHKHK1xMAgh',
        },
        {
          url: '/_next/static/chunks/app/warning/page-297043772c9a95e3.js',
          revision: 'fQR3vWWpVSRHKHK1xMAgh',
        },
        {
          url: '/_next/static/chunks/c7ee6235-5076711e04906793.js',
          revision: 'fQR3vWWpVSRHKHK1xMAgh',
        },
        {
          url: '/_next/static/chunks/fac77a46-5ce00c72047507ed.js',
          revision: 'fQR3vWWpVSRHKHK1xMAgh',
        },
        {
          url: '/_next/static/chunks/framework-6e06c675866dc992.js',
          revision: 'fQR3vWWpVSRHKHK1xMAgh',
        },
        {
          url: '/_next/static/chunks/main-app-fd449bf65be96140.js',
          revision: 'fQR3vWWpVSRHKHK1xMAgh',
        },
        {
          url: '/_next/static/chunks/main-b4298d1da7ba9473.js',
          revision: 'fQR3vWWpVSRHKHK1xMAgh',
        },
        {
          url: '/_next/static/chunks/pages/_app-b9f5891c201e0914.js',
          revision: 'fQR3vWWpVSRHKHK1xMAgh',
        },
        {
          url: '/_next/static/chunks/pages/_error-c09f509a1fb9d1de.js',
          revision: 'fQR3vWWpVSRHKHK1xMAgh',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-c948cebe12c1a3c3.js',
          revision: 'fQR3vWWpVSRHKHK1xMAgh',
        },
        {
          url: '/_next/static/css/9b14463066a67e32.css',
          revision: '9b14463066a67e32',
        },
        {
          url: '/_next/static/css/a0a6bca80b5b48a3.css',
          revision: 'a0a6bca80b5b48a3',
        },
        {
          url: '/_next/static/fQR3vWWpVSRHKHK1xMAgh/_buildManifest.js',
          revision: '9efab47ee5c65517d3900c8ee3250d6c',
        },
        {
          url: '/_next/static/fQR3vWWpVSRHKHK1xMAgh/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/media/19cfc7226ec3afaa-s.woff2',
          revision: '9dda5cfc9a46f256d0e131bb535e46f8',
        },
        {
          url: '/_next/static/media/21350d82a1f187e9-s.woff2',
          revision: '4e2553027f1d60eff32898367dd4d541',
        },
        {
          url: '/_next/static/media/8e9860b6e62d6359-s.woff2',
          revision: '01ba6c2a184b8cba08b0d57167664d75',
        },
        {
          url: '/_next/static/media/ba9851c3c22cd980-s.woff2',
          revision: '9e494903d6b0ffec1a1e14d34427d44d',
        },
        {
          url: '/_next/static/media/c5fe6dc8356a8c31-s.woff2',
          revision: '027a89e9ab733a145db70f09b8a18b42',
        },
        {
          url: '/_next/static/media/df0a9ae256c0569c-s.woff2',
          revision: 'd54db44de5ccb18886ece2fda72bdfe0',
        },
        {
          url: '/_next/static/media/e4af272ccee01ff0-s.p.woff2',
          revision: '65850a373e258f1c897a2b3d75eb74de',
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
