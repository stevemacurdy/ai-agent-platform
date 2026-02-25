// public/sw.js — WoulfAI Service Worker
// Provides offline caching for static assets and app shell

const CACHE_NAME = 'woulfai-v1';
const OFFLINE_URL = '/';

// Static assets to pre-cache on install
const PRE_CACHE = [
  '/',
  '/login',
  '/portal',
  '/manifest.json',
  '/images/icon-192.png',
  '/images/icon-512.png',
];

// Install: pre-cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRE_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for static
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API routes — always go to network
  if (url.pathname.startsWith('/api/')) return;

  // Skip auth-related routes
  if (url.pathname.startsWith('/auth/')) return;

  // For navigation requests: network first, fall back to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request).then((cached) => {
          return cached || caches.match(OFFLINE_URL);
        });
      })
    );
    return;
  }

  // For static assets: cache first, fall back to network
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }
});
