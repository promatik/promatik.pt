const VERSION = 'promatik-0.0.2';

const fetchAndCache = async request => {
  const result = await fetch(request);
  caches.open(VERSION).then(cache => cache.put(request.url, result));
  return result.clone();
};

self.onfetch = e => {
  if (e.request.url.match(/\/data|\/pdf|google-analytics.com|googletagmanager.com|chrome-extension/)) return;

  e.respondWith(navigator.onLine && (e.request.destination === 'document' || !e.request.url.match(/https?:\/\/promatik.pt/))
    ? fetchAndCache(e.request)
    : caches.open(VERSION).then(cache => cache
      .match(e.request.url, { ignoreSearch: false })
      .then(response => response || fetchAndCache(e.request))));
};
