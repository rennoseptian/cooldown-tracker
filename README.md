# Cooldown — Claude Token Tracker

Web app (PWA) untuk memantau cooldown/limit token Claude di banyak akun sekaligus.
File ini siap dipakai langsung sebagai web app, dan siap dibungkus jadi APK Android pakai Capacitor.

## Fitur

- **Banyak akun/cooldown** — tambah, edit, hapus, "mulai lagi" cooldown per akun.
- **Customizable**:
  - Label/nama akun bebas
  - Durasi cooldown: preset (5 jam, 8 jam, 24 jam) atau jam+menit kustom
  - Preset durasi bisa ditambah/dihapus sendiri (Pengaturan → Preset durasi)
  - Warna tag per akun (8 pilihan warna)
  - Catatan bebas per akun
  - Tema gelap/terang
  - Notifikasi & suara/getar bisa di on/off-kan
- **Notifikasi ganda**: visual di kartu (ring countdown berubah hijau + label "Siap") dan notifikasi HP (Web Notification API) + getar saat cooldown selesai.
- **Data lokal** — semua tersimpan di `localStorage` HP/browser, tidak ada server/cloud. Ada tombol ekspor/impor `.json` untuk backup manual.
- **PWA** — bisa di-"Add to Home Screen" dari Chrome Android, jalan seperti app biasa (fullscreen, ikon sendiri).

## Cara coba sekarang

1. Buka `www/index.html` di Chrome Android (atau HP mana pun).
2. Tap menu Chrome → **"Add to Home screen" / "Install app"**.
3. App akan muncul sebagai ikon sendiri di home screen.

> Catatan: karena ini masih web app biasa, notifikasi hanya akan terkirim selagi tab/app **terbuka di background** (browser/PWA masih hidup di memori). Untuk notifikasi yang benar-benar jalan walau app ditutup total, lanjutkan ke langkah Capacitor di bawah — nanti tinggal ganti bagian notifikasi pakai plugin `@capacitor/local-notifications` yang punya akses alarm OS asli.

## Struktur file

```
cooldown-tracker/
├── www/                        ← semua aset web (ini yang dibungkus Capacitor)
│   ├── index.html              ← seluruh UI + logic (CSS & JS inline, 1 file)
│   ├── manifest.json           ← metadata PWA (nama, ikon, warna tema)
│   ├── sw.js                   ← service worker sederhana (cache offline)
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
├── package.json                ← dependency Capacitor
├── capacitor.config.json       ← config: appId, nama app, webDir
├── .gitignore                  ← node_modules & folder android/ tidak ikut di-commit
├── .github/workflows/build-apk.yml  ← auto-build APK tiap push ke GitHub
└── README.md
```

## Setup sekali saja: keystore tetap (wajib, biar bisa update APK)

**Kenapa perlu ini:** setiap kali GitHub Actions jalan, ia mulai dari komputer baru/bersih. Tanpa langkah ini, setiap build APK ditandatangani dengan keystore debug **yang berbeda-beda**, sehingga Android menolak menimpa/update app yang sebelumnya sudah terpasang ("Aplikasi tidak terinstal"). Solusinya: pakai satu keystore tetap yang sama di setiap build.

**Langkah (sekali saja):**
1. Buka repo di GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
2. Name: `DEBUG_KEYSTORE_BASE64`
3. Value: paste string base64 keystore (diberikan terpisah di chat — jangan dimasukkan ke repo/commit, cukup ke secret ini)
4. **Add secret**

Setelah secret ini diset, semua build APK selanjutnya akan pakai signature yang sama → install APK baru di atas yang lama akan dianggap **update**, bukan app baru.

> Kalau secret ini belum diisi, build tetap jalan tapi tiap APK akan punya signature acak → kamu harus uninstall app lama dulu sebelum install yang baru, setiap kali.

## Ganti nama paket (appId)

appId sekarang: `com.rennoseptian.cooldowntracker` (sebelumnya `com.cooldowntracker.app`).

> **Penting:** karena appId berubah, APK lama yang sudah terpasang ("Cooldown" dengan icon biru X default) harus **di-uninstall manual dulu** sebelum install APK baru — Android menganggapnya app yang berbeda total.

## Icon app sekarang benar

Sebelumnya icon yang muncul di HP adalah icon default Capacitor (logo biru "X"), bukan icon yang sudah saya buat — itu karena manifest PWA (`www/manifest.json`) cuma dipakai kalau app dibuka lewat browser, sedangkan APK native butuh resource icon Android sendiri (`mipmap` di berbagai ukuran + adaptive icon).

Sudah ditambahkan folder `assets/` (`icon.png`, `icon-foreground.png`, `icon-background.png`) dan workflow sekarang menjalankan `npx @capacitor/assets generate --android` setiap build, yang otomatis generate semua ukuran icon Android dari source itu. Hasilnya: icon di home screen & app drawer sekarang sama dengan desain ring jam yang sudah dipakai di app.

## Build APK otomatis lewat GitHub Actions (tanpa Android Studio)

Sudah disiapkan workflow `.github/workflows/build-apk.yml`. Setiap kali kamu **push ke branch `main`**, GitHub otomatis:
1. Install Node + Java
2. `npm install` dependency Capacitor
3. `npx cap add android` — generate project Android dari folder `www/`
4. Build APK debug dengan Gradle
5. Upload hasilnya sebagai **artifact** yang bisa di-download

### Cara ambil APK-nya

1. Push project ini ke GitHub (lihat langkah Termux sebelumnya — kali ini ada file baru: `package.json`, `capacitor.config.json`, `.gitignore`, folder `.github/`, dan folder `www/`).
2. Buka repo di GitHub → tab **Actions**.
3. Tunggu sampai workflow "Build Android APK" selesai (centang hijau, biasanya 3–5 menit).
4. Klik run yang selesai itu → scroll ke bawah ke bagian **Artifacts** → download `cooldown-tracker-debug-apk.zip`.
5. Ekstrak zip itu di HP → dapat file `app-debug.apk` → install langsung (Chrome/file manager akan minta izin "Install dari sumber tidak dikenal", izinkan).

> APK ini **debug/unsigned** — cukup untuk dipakai sendiri di HP kamu. Tidak perlu keystore/signing untuk ini. Kalau nanti mau publish ke Play Store baru perlu signing key terpisah.

### Ganti nama paket app (opsional)

Default `appId` saya set `com.cooldowntracker.app` di `capacitor.config.json`. Boleh diganti ke `com.namakamu.cooldowntracker` sebelum push pertama kali — setelah APK pernah di-install dengan satu appId, ganti appId nanti berarti harus uninstall versi lama dulu.

## Notifikasi native (sudah aktif)

APK ini sudah pakai `@capacitor/local-notifications` — bukan lagi Web Notification API. Artinya begitu kamu nyalakan toggle "Notifikasi saat siap" di Pengaturan dan izinkan permission yang muncul, notifikasi akan **dijadwalkan langsung lewat alarm OS Android** saat sebuah cooldown dibuat/restart. Notifikasi tetap muncul walau app sudah ditutup total, karena bukan timer JavaScript — ini alarm asli di level sistem.

**Notifikasi berulang (seperti alarm):** ada toggle tambahan "Notifikasi berulang" di Pengaturan (default ON). Kalau aktif, begitu cooldown selesai, HP akan bunyi+getar **3 kali setiap 10 menit** sampai kamu buka app atau restart cooldown-nya.

> **Kenapa 10 menit, bukan 30 detik?** Awalnya saya buat jaraknya 30 detik biar lebih ngebut seperti alarm. Tapi ternyata Android punya pembatasan keras: alarm latar belakang tipe `allowWhileIdle` **hanya boleh bunyi sekali per 9 menit, per aplikasi** — sisanya di dalam jendela 9 menit itu otomatis dibuang diam-diam oleh sistem, apa pun yang kita lakukan di kode. Itu sebabnya sebelumnya selalu "cuma sekali" walau sudah dijadwalkan 5x. Jarak 10 menit ini sengaja dipilih supaya **tiap pengingat benar-benar lolos** dan bunyi, bukan didrop sistem.

**Izin alarm presisi (penting!):** di Android 12+, notifikasi yang dijadwalkan berdekatan (tiap 30 detik) butuh izin khusus "Alarms & reminders" / "Jadwalkan alarm tepat", kalau tidak, sistem akan **menggabungkan/menjatuhkan** sebagian notifikasi alih-alih membunyikan semuanya — ini kemungkinan besar penyebab kenapa sebelumnya cuma bunyi sekali. Sekarang ada tombol **"⏰ Izinkan alarm presisi"** yang otomatis muncul di Pengaturan kalau izin ini belum diberikan — tap untuk buka setelan dan izinkan.

**Jam selesai real-time (seperti alarm):** tiap kartu sekarang menampilkan jam selesai dalam jam asli HP kamu (misal "⏰ Selesai 14:35"), bukan cuma hitungan mundur. Begitu juga saat menambah/edit cooldown — di bawah input durasi ada preview live "Akan selesai jam ..." yang ikut update setiap kamu ubah jam/menit, supaya kerasa seperti mengatur alarm biasa.

> **Catatan jujur soal volume**: ini notification channel + alarm presisi, bukan alarm clock activity penuh seperti app Jam bawaan. Artinya suaranya tetap ikut **volume notifikasi & mode silent/Do Not Disturb HP kamu** — kalau HP disetel silent total, suara tidak akan keluar (getar biasanya tetap jalan). Kalau kamu mau notifikasi ini bisa "menembus" mode silent seperti alarm jam beneran (pakai `AudioManager.STREAM_ALARM` + layar nyala otomatis), itu butuh native plugin custom terpisah yang lebih kompleks — beri tahu saya kalau mau dibuatkan itu juga.

> **Soal HP Xiaomi/MIUI atau merk lain yang agresif membatasi background app**: kalau setelah semua ini masih belum bunyi sama sekali (bukan cuma sekali, tapi nol kali), kemungkinan besar bukan soal kode lagi — tapi setelan OS yang mematikan app di background. Cek dan aktifkan manual:
> - Settings → Apps → Cooldown → **Battery saver / Penghemat baterai** → pilih **"No restrictions" / "Tanpa batasan"**
> - Settings → Apps → Cooldown → **Autostart / Mulai otomatis** → aktifkan
> - Settings → Apps → Cooldown → **Notifications** → pastikan semua diizinkan (termasuk lock screen & pop-up)
> - Settings → Apps → Cooldown → **Alarms & reminders** → izinkan (ini yang dibuka otomatis lewat tombol "Izinkan alarm presisi" di atas)

Build pipeline (`.github/workflows/build-apk.yml`) sudah otomatis menjalankan `npm run build:bridge` (bundling `src/notify-bridge.js` via esbuild jadi `www/notify-bridge.js`) sebelum `npx cap sync`, jadi tidak perlu langkah manual tambahan — tinggal push, lalu install APK hasil build terbaru.

**Setelah install APK baru:**
1. Buka app → tap ikon gear (Pengaturan)
2. Nyalakan toggle **"Notifikasi saat siap"**
3. Izinkan permission yang muncul dari Android
4. (Opsional) atur toggle **"Notifikasi berulang"** sesuai keinginan
5. Selesai — semua cooldown yang sedang berjalan otomatis dijadwalkan ulang

## Pengembangan lanjutan
