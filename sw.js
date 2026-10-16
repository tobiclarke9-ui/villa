/* Villa notifications helper: wakes up when Villa pokes this phone, asks Villa what to say, shows it. */
var EXEC = 'https://script.google.com/macros/s/AKfycbwtf8zbnaFRm1clsb1AYrc0yvfuWB70TKn4iVZ0Y_nJ033oE7E58PYoD9AEC8u__V2bEw/exec';

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

function deviceId() {
  return self.registration.pushManager.getSubscription().then(function (sub) {
    if (!sub) return '';
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(sub.endpoint)).then(function (h) {
      return Array.prototype.map.call(new Uint8Array(h), function (b) { return (b + 256).toString(16).slice(1); }).join('').slice(0, 32);
    });
  });
}

self.addEventListener('push', function (e) {
  e.waitUntil(deviceId().then(function (id) {
    if (!id) return null;
    return fetch(EXEC + '?push=' + id, { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) { return j && j.items && j.items[0]; });
  }).catch(function () { return null; }).then(function (item) {
    var title = item && item.title ? item.title : 'Villa 💕';
    var body = item && item.body ? item.body : 'Something new is waiting for you in Villa.';
    return self.registration.showNotification(title, { body: body, icon: 'apple-touch-icon.png', badge: 'apple-touch-icon.png', data: { url: './' } });
  }));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) if ('focus' in list[i]) return list[i].focus();
    return self.clients.openWindow('./');
  }));
});
