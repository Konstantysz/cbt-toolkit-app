# Data handling and privacy

- All journal data stays on the device (SQLite). There is no backend or analytics.
- The database is not encrypted at rest; the optional PIN gates the UI only.
- The PIN is stored only as a salted PBKDF2 hash in the OS keystore (expo-secure-store). "PIN enabled" is derived from the presence of that hash at startup; a missing hash disables the lock instead of trapping the user.
- Android auto-backup is disabled (`android.allowBackup: false` in `app.json`), so the database is never uploaded to Google backup.
- A privacy cover hides content whenever the app is not active (app switcher), and screen capture is blocked via `expo-screen-capture` (Android FLAG_SECURE; on iOS, support depends on the OS version).
- The lock timeout is configurable in Settings (immediately, 30 s, 1 min, 5 min). The grace period uses wall-clock time; a backwards clock jump counts as expired.
- Data leaves the device only through the user-initiated JSON/PDF export.
