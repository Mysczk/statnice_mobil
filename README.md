# Activity Tracker

Mobilní aplikace pro záznam fyzické aktivity na platformách iOS a Android. Měří počet kroků, intenzitu pohybu a překonanou vzdálenost GPS. Data jsou ukládána lokálně a lze je exportovat do CSV nebo JSON.

**Ukázka:** [Video funkčnosti](https://drive.google.com/drive/folders/1ctnEvxoD58NZsiDI4n8yvhEdy-XFczDN?usp=sharing)

---

## Dokumentace

- [Technická dokumentace](./DOKUMENTACE.md#technická-dokumentace--activity-tracker)
- [Uživatelská příručka](./PRIRUCKA.md#uživatelská-příručka--activity-tracker)
---

## Požadavky

| Nástroj | Verze | Odkaz |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | součást Node.js |
| Expo Go | aktuální | [App Store](https://apps.apple.com/app/expo-go/id982107779) / [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent) |

---
## Vyvinuto a otestováno na

| | Verze |
|---|---|
| Operační systém (vývoj) | Windows 11 |
| Node.js | 24.16.0 |
| Expo Go | iOS 26.4.2 |
| Testovací zařízení | iPhone 16e |

---
## Instalace a spuštění

```bash
# 1. Klonování repozitáře
git clone <url-repozitare>
cd tracker

# 2. Instalace závislostí
npm install

# 3. Spuštění vývojového serveru
npx expo start
```

Naskenujte QR kód v aplikaci Expo Go (Android) nebo fotoaparátem (iOS). Pokud jsou telefon a počítač připojeny ke stejné Wi-Fi síti, Expo Go aplikaci detekuje automaticky v sekci **Recently in Development**.

> Fyzické zařízení je vyžadováno pro plnou funkčnost — pedometr a GPS nejsou dostupné na simulátorech a emulátorech.

---

## Technologický stack

- [React Native](https://reactnative.dev/) 0.81.5
- [Expo SDK](https://expo.dev/) 54.0.34
- [Expo Router](https://expo.github.io/router/) 6.0.23
- [TypeScript](https://www.typescriptlang.org/) 5.9.2
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) — lokální databáze
- [expo-sensors](https://docs.expo.dev/versions/latest/sdk/sensors/) — akcelerometr, pedometr
- [expo-location](https://docs.expo.dev/versions/latest/sdk/location/) — GPS
- [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) — lokální notifikace
- [react-native-chart-kit](https://github.com/indiespirit/react-native-chart-kit) — grafy

---

## Oprávnění

Aplikace při prvním spuštění vyžádá následující oprávnění:

- **Pohyb a fitness** — počítání kroků
- **Poloha** — sledování vzdálenosti pomocí GPS
- **Notifikace** — upozornění při dlouhé neaktivitě