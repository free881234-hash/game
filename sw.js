// Offline cache for the web version (cache-first; a new VERSION replaces the old cache)
const VERSION = 'dw-20261106220735';
const FILES = ["./", "./cheat.js", "./data/runner/boss-intro/310.jpg", "./data/runner/boss-intro/317.jpg", "./data/runner/boss-intro/318.jpg", "./data/runner/boss-intro/319.jpg", "./data/runner/boss-intro/325.jpg", "./data/runner/catalog.tsv", "./data/runner/neodgm.ttf", "./data/runner/skin424/clr-button.png", "./data/runner/skin424/control-shell.png", "./data/runner/skin424/direction-spaced-pad.png", "./data/runner/skin424/map-button.png", "./data/runner/skin424/pressed-0.png", "./data/runner/skin424/pressed-1.png", "./data/runner/skin424/pressed-2.png", "./data/runner/skin424/pressed-3.png", "./data/runner/skin424/save-button.png", "./data/runner/sounds.tsv", "./data/runner/title-hd.png", "./data/sound/bgm_boss.mp3", "./data/sound/bgm_castle.mp3", "./data/sound/bgm_dungeon.mp3", "./data/sound/bgm_event.mp3", "./data/sound/bgm_forest.mp3", "./data/sound/bgm_gloomy.mp3", "./data/sound/bgm_ice.mp3", "./data/sound/bgm_title.mp3", "./data/sound/bgm_village.mp3", "./data/sound/bgm_worldair.mp3", "./data/sound/bgm_worldnormal.mp3", "./data/sound/bgm_worldship.mp3", "./data/sound/snd_attack1.wav", "./data/sound/snd_attack2.wav", "./data/sound/snd_attack3.wav", "./data/sound/snd_attack4.wav", "./data/sound/snd_attack5.wav", "./data/sound/snd_attack_punch.wav", "./data/sound/snd_attack_punch2.wav", "./data/sound/snd_attack_slash.wav", "./data/sound/snd_levelup.wav", "./data/sound/snd_skill_buff.wav", "./data/sound/snd_skill_downblow.wav", "./data/sound/snd_skill_framewave.wav", "./data/sound/snd_skill_hellfire.wav", "./data/sound/snd_skill_howl.wav", "./data/sound/snd_skill_ice.wav", "./data/sound/snd_skill_metor.wav", "./data/sound/snd_skill_powerwave.wav", "./data/sound/snd_skill_soul.wav", "./data/sound/snd_skill_thunder.wav", "./data/sound/snd_skill_translycan.wav", "./data/sound/snd_skill_upblow.wav", "./data/sound/snd_skill_wind.wav", "./dw.js", "./dw.pack", "./dwcore.js", "./dwcore.wasm", "./icon-192.png", "./icon-512.png", "./index.html", "./input.js", "./manifest.json"];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// program files: network first (so an update is used right away), cache when offline; data files: cache first
const FRESH = /\.(html|js|wasm|json)$|\/$/;
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin === location.origin && FRESH.test(url.pathname)) {
    e.respondWith(fetch(e.request, { cache: 'no-store' }).then((r) => {
      if (r.ok) { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true })));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((r) => r || fetch(e.request)));
});
