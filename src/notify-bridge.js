// Entry point bundled by esbuild into www/notify-bridge.js
// Exposes a tiny global API (window.CooldownNotify) so plain <script> code
// in www/index.html can schedule real native Android notifications/alarms
// via the @capacitor/local-notifications plugin, without needing a bundler
// inside index.html itself.
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

function isNative() {
  try {
    return Capacitor.isNativePlatform();
  } catch (e) {
    return false;
  }
}

const CHANNEL_ID = 'cooldown_alerts';

async function ensureChannel() {
  if (!isNative()) return;
  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: 'Cooldown Selesai',
      description: 'Notifikasi keras saat cooldown akun selesai',
      importance: 5, // IMPORTANCE_MAX — heads-up, full sound + vibration
      visibility: 1, // public
      vibration: true,
      lights: true,
      lightColor: '#D97757',
      // sound: temporarily back to system default while we confirm delivery is reliable again.
      // (will reintroduce the custom alarm sound once this baseline is confirmed working)
    });
  } catch (e) {
    // ignore — channel may already exist, or running on a platform without channel support
  }
}

async function requestPermission() {
  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch (e) {
    return false;
  }
}

async function checkPermission() {
  try {
    const result = await LocalNotifications.checkPermissions();
    return result.display === 'granted';
  } catch (e) {
    return false;
  }
}

// items: array of { id, title, body, at } — schedules them all in one call
async function scheduleMany(items) {
  try {
    await LocalNotifications.schedule({
      notifications: items.map((it) => ({
        id: it.id,
        title: it.title,
        body: it.body,
        channelId: CHANNEL_ID,
        ongoing: false,
        autoCancel: true,
        vibrate: true,
        schedule: { at: it.at, allowWhileIdle: true },
      })),
    });
    return true;
  } catch (e) {
    return false;
  }
}

// ids: array of integers to cancel in one call
async function cancelMany(ids) {
  try {
    await LocalNotifications.cancel({ notifications: ids.map((id) => ({ id })) });
    return true;
  } catch (e) {
    return false;
  }
}


window.CooldownNotify = {
  isNative,
  ensureChannel,
  requestPermission,
  checkPermission,
  scheduleMany,
  cancelMany,
};
