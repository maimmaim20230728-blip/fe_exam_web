/*
 * 基本情報技術者 過去問トレーニング - Service Worker
 * cache-first。中身を更新したら CACHE の数字を上げてください（例 v1 -> v2）。
 * figs/ は総量が大きいので precache には入れず、表示された図だけ runtime cache に貯める。
 */
var CACHE = "feexam-v5";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./data/q_a_h27s.js",
  "./data/q_a_h27a.js",
  "./data/q_a_h28s.js",
  "./data/q_a_h28a.js",
  "./data/q_a_h29s.js",
  "./data/q_a_h29a.js",
  "./data/q_a_h30s.js",
  "./data/q_a_h30a.js",
  "./data/q_a_h31s.js",
  "./data/q_a_r01a.js",
  "./data/q_b_bsmp.js",
  "./data/q_b_bset.js",
  "./data/q_b_r05.js",
  "./data/q_b_r06.js",
  "./data/q_b_r07.js",
  "./data/q_b_r08.js"
];

self.addEventListener("install", function(e){
  self.skipWaiting();
  // 1つでも欠けると addAll ごと失敗するので、1件ずつ入れて欠品を許容する
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.all(ASSETS.map(function(url){ return c.add(url).catch(function(){}); }));
  }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if(k !== CACHE) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

// cache-first: あればキャッシュ、無ければ取得してキャッシュ（figs/ はここで貯まる）
self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function(hit){
      if(hit) return hit;
      return fetch(e.request).then(function(res){
        if(res && res.ok && res.type !== "opaque"){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
        }
        return res;
      }).catch(function(){ return caches.match("./index.html"); });
    })
  );
});
