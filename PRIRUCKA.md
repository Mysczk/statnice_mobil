# Uživatelská příručka — Activity Tracker

## Navigace

- [Zpět na README](./README.md)
- [Technická dokumentace](./DOKUMENTACE.md#technická-dokumentace--activity-tracker)

---

## Obsah

1. [Úvod](#1-úvod)
2. [Instalace](#2-instalace)
3. [Spuštění aplikace](#3-spuštění-aplikace)
4. [Zahájení měření](#4-zahájení-měření)
5. [Průběh měření](#5-průběh-měření)
6. [Ukončení měření](#6-ukončení-měření)
7. [Detail měření](#7-detail-měření)
8. [Historie měření](#8-historie-měření)
9. [Export dat](#9-export-dat)
10. [Notifikace](#10-notifikace)

---

## 1. Úvod

Activity Tracker je mobilní aplikace pro záznam fyzické aktivity. Aplikace měří počet kroků, intenzitu pohybu a překonanou vzdálenost. Všechna data jsou ukládána lokálně v zařízení a lze je exportovat pro další zpracování.

Aplikace je určena pro zařízení se systémem **iOS** nebo **Android**.

---

## 2. Instalace

### Požadavky

- Chytrý telefon s iOS nebo Androidem
- Aplikace **Expo Go** — dostupná zdarma v App Store (iOS) nebo Google Play (Android)
- Aktivní připojení k síti pro první spuštění

### Postup

1. Nainstalujte aplikaci **Expo Go** na svůj telefon.
2. Ujistěte se, že váš telefon a počítač jsou připojeny ke stejné Wi-Fi síti.
3. Na počítači spusťte vývojový server příkazem `npx expo start`.
4. Naskenujte zobrazený QR kód:
   - **Android** — pomocí aplikace Expo Go
   - **iOS** — pomocí vestavěné čtečky fotoaparátu

Aplikace se automaticky načte v Expo Go.

---

## 3. Spuštění aplikace

Po načtení aplikace se zobrazí hlavní obrazovka **Měřit** se dvěma záložkami v dolní části:

- **Měřit** — zahájení a sledování aktivního měření
- **Historie** — přehled všech uložených měření

---

## 4. Zahájení měření

1. Přejděte na záložku **Měřit**.
2. Klepněte na tlačítko **▶ Zahájit měření**.
3. Pokud aplikace dosud nemá potřebná oprávnění, zobrazí se systémové dialogy:
   - **Pohyb a fitness** — povolte pro počítání kroků
   - **Poloha** — povolte pro sledování vzdálenosti
   - **Notifikace** — povolte pro upozornění při neaktivitě
4. Měření okamžitě začíná.

> **Doporučení:** Noste telefon v kapse kalhot nebo v ruce podél těla pro nejpřesnější měření kroků.

---

## 5. Průběh měření

Během aktivního měření jsou na obrazovce zobrazeny tyto hodnoty:

| Údaj | Popis |
|---|---|
| Čas měření | Uplynulý čas od zahájení ve formátu HH:MM:SS |
| Intenzita | Slovní vyjádření aktuální intenzity pohybu |
| Kroky | Počet kroků od zahájení měření |
| Vzdálenost | Překonaná vzdálenost v metrech nebo kilometrech |

Barevný ukazatel pod statistikami zobrazuje aktuální intenzitu pohybu:

| Barva | Intenzita |
|---|---|
| Šedá | Klid |
| Zelená | Nízká |
| Oranžová | Střední |
| Červená | Vysoká |

Data jsou automaticky ukládána každé 3 sekundy — není nutná žádná akce ze strany uživatele.

---

## 6. Ukončení měření

1. Klepněte na tlačítko **⏹ Ukončit měření**.
2. V potvrzovacím dialogu vyberte **Ukončit**.
3. Aplikace automaticky přejde na detail právě ukončeného měření.

---

## 7. Detail měření

Obrazovka detailu zobrazuje kompletní přehled jednoho měření:

**Statistiky**
- Délka aktivity
- Celkový počet kroků
- Průměrná intenzita pohybu
- Maximální dosažená intenzita
- Překonaná vzdálenost

**Časy**
- Čas zahájení a ukončení měření
- Počet zaznamenaných vzorků

**Graf intenzity**
- Spojnicový graf zobrazující průběh intenzity pohybu v čase
- Zobrazí se pouze pokud měření obsahuje alespoň 2 vzorky (tj. trvalo alespoň 6 sekund)

**Průběh měření**
- Tabulka jednotlivých vzorků s časem, počtem kroků a intenzitou

---

## 8. Historie měření

Záložka **Historie** zobrazuje seznam všech uložených měření seřazených od nejnovějšího.

Každá položka seznamu zobrazuje:
- Datum a čas zahájení
- Délku aktivity
- Celkový počet kroků
- Průměrnou intenzitu

**Otevření detailu** — klepněte na libovolnou položku seznamu.

**Smazání záznamu** — klepněte na tlačítko **✕** v pravém horním rohu položky. Smazání je nevratné.

---

## 9. Export dat

V detailu měření je k dispozici sekce **Export** se dvěma možnostmi:

- **Exportovat CSV** — tabulkový formát vhodný pro zpracování v Excelu nebo Google Sheets
- **Exportovat JSON** — strukturovaný formát vhodný pro programové zpracování

Po klepnutí na tlačítko se otevře systémový dialog pro sdílení, kde lze soubor odeslat e-mailem, uložit do cloudového úložiště nebo přenést jiným způsobem.

### Struktura exportovaných dat

**CSV** obsahuje sloupce: `cas`, `kroky`, `intenzita`

**JSON** obsahuje objekt `session` s celkovými statistikami měření a pole `samples` s jednotlivými vzorky.

---

## 10. Notifikace

Aplikace automaticky odešle notifikaci **„Čas se hýbat!"** pokud není po dobu 5 minut detekován žádný pohyb při aktivním měření. Při obnovení pohybu se časovač resetuje.

Notifikace se nezobrazí pokud:
- Měření není aktivní
- Oprávnění pro notifikace nebyla udělena
- Pohyb byl detekován v posledních 5 minutách