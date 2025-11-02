// Nome do cache
const CACHE_NAME = 'sudoku-master-v1.0.0';

// Arquivos para cache
const urlsToCache = [
  '/JogodaForca/',
  '/JogodaForca/index.html',
  '/JogodaForca/manifest.json',
  '/JogodaForca/icons/icon-72x72.png',
  '/JogodaForca/icons/icon-96x96.png',
  '/JogodaForca/icons/icon-128x128.png',
  '/JogodaForca/icons/icon-144x144.png',
  '/JogodaForca/icons/icon-152x152.png',
  '/JogodaForca/icons/icon-192x192.png',
  '/JogodaForca/icons/icon-384x384.png',
  '/JogodaForca/icons/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// Instalação do Service Worker
self.addEventListener('install', function(event) {
  console.log('Service Worker instalando...');
  
  // Realiza a instalação
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        console.log('Todos os recursos foram cacheados');
        return self.skipWaiting();
      })
      .catch(function(error) {
        console.log('Falha ao cachear recursos:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', function(event) {
  console.log('Service Worker ativando...');
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('Service Worker ativado');
      return self.clients.claim();
    })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Retorna o recurso do cache se encontrado
        if (response) {
          return response;
        }

        // Clona a requisição
        const fetchRequest = event.request.clone();

        // Faz a requisição para a rede
        return fetch(fetchRequest).then(
          function(response) {
            // Verifica se a resposta é válida
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona a resposta
            const responseToCache = response.clone();

            // Adiciona a resposta ao cache
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(function() {
          // Fallback para página offline se a requisição falhar
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/JogodaForca/index.html');
          }
        });
      })
    );
});

// Mensagens do Service Worker
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
