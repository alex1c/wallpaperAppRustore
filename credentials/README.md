# Production Android signing (local only)

This folder holds **templates**. Real keystores and `keystore.properties` are gitignored and must never be committed.

There is **no** existing production key in this repository, on the default Android debug path, in EAS credentials, or in the `D:\r` work copy. Generate **one** production keystore and keep it for every future update of `com.calculatorplatform.wallpaper`.

Do not let an agent invent or store the password. You choose the password and keep it in a password manager plus an offline backup.

## Recommended identity

| Item | Value |
|------|--------|
| Keystore file | `%USERPROFILE%\secure\calculator-platform\wallpaper-release.jks` |
| Store type | PKCS12 |
| Alias | `wallpaper` |
| Algorithm | RSA |
| Key size | 2048 |
| Validity | 10000 days (~27 years) |
| Package | `com.calculatorplatform.wallpaper` |

Create the directory first, then run **keytool from JDK 17** (`JAVA_HOME` must be JDK 17, not Android Studio JBR 25).

## 1. Generate the keystore (you run this)

PowerShell:

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\secure\calculator-platform" | Out-Null

keytool -genkeypair -v `
  -keystore "$env:USERPROFILE\secure\calculator-platform\wallpaper-release.jks" `
  -alias wallpaper `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000 `
  -storetype PKCS12
```

keytool will prompt for:

- store password (choose a strong unique password; do not reuse the debug password `android`)
- Distinguished Name — suggested: `CN=Calculator Platform, OU=Wallpaper, O=Calculator Platform, L=Moscow, ST=Moscow, C=RU`
- key password — press Enter to use the same as the store password

If the file already exists, **stop**. Do not overwrite it.

## 2. Backup (same day, before any store upload)

1. Copy `wallpaper-release.jks` to an encrypted USB / offline disk that is **not** this repo and **not** `D:\r`.
2. Store the password in a password manager (and a paper copy in a safe place).
3. Losing this keystore or password means you cannot update the RuStore listing for this package id.

## 3. Local Gradle wiring (no secrets in git)

```powershell
copy credentials\keystore.properties.example credentials\keystore.properties
```

Edit `credentials/keystore.properties`:

- `storeFile` — absolute path to the `.jks` (forward slashes)
- `storePassword` / `keyPassword` — the passwords you chose
- `keyAlias` — `wallpaper`

Then, after `npm run prebuild:android:production` on the short path (`D:\r`):

```powershell
npm run apply:release-signing
```

If `credentials/keystore.properties` exists, production prebuild applies signing automatically.

## 4. Confirm it is NOT the debug certificate

```powershell
keytool -list -v -keystore "$env:USERPROFILE\secure\calculator-platform\wallpaper-release.jks" -alias wallpaper
```

The owner must **not** be `CN=Android Debug, OU=Android, O=Android, L=Mountain View, ST=California, C=US`.

After `bundleRelease`:

```powershell
npm run verify:release-signing -- android/app/build/outputs/bundle/release/app-release.aab
```

## 5. RuStore AAB extra console step (after the key exists)

RuStore AAB upload is Play-like: the console needs an **app-signing** key (PEPK ZIP) and an **upload** certificate (PEM) **before** the AAB.

Recommended for this first app (one keystore, two aliases):

1. Keep alias `wallpaper` as the **app signing** key (never rotate; this is the stable identity).
2. Later add alias `upload` in the **same** keystore for signing the AAB (optional second alias; do this only when you are in the RuStore “Загрузка подписи” wizard — the PEPK command is unique per developer account).
3. Export the certificate that actually signed the AAB:

```powershell
keytool -exportcert -rfc -alias wallpaper -keystore "$env:USERPROFILE\secure\calculator-platform\wallpaper-release.jks" -file "$env:USERPROFILE\secure\calculator-platform\uploadcert.pem"
```

If RuStore asks for a separate upload alias, generate it in the same store (do not create a second keystore):

```powershell
keytool -genkeypair -v `
  -keystore "$env:USERPROFILE\secure\calculator-platform\wallpaper-release.jks" `
  -alias upload `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000 `
  -storetype PKCS12
```

Then point `keyAlias=upload` in `keystore.properties` for AAB builds, and PEPK-export alias `wallpaper` as the app-signing key.

Until you complete that console ceremony, a **production-signed APK** (`assembleRelease`) can still be used for RuStore APK upload with the single `wallpaper` alias.

Official AAB help: https://www.rustore.ru/help/developers/publishing-and-verifying-apps/app-publication/new-version-app/upload-aab

## Never

- Commit `*.jks`, `*.keystore`, `keystore.properties`, or passwords
- Check the keystore into `D:\r` as the only copy
- Generate a new production key for a later version of the same package
- Use the Android debug keystore for store upload
