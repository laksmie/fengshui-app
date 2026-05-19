
# Laksmie Feng Shui

Application de calcul Feng Shui pour Android

- Calcul du nombre Kua
- Boussole Feng Shui interactive
- Carrés Lo Shu (logement et temporels)
- Cours et articles
Bonus
- Numérologie
- Jyotish

## Prérequis

- Node.js 20+
- Java JDK 17+
- Android SDK (API 35)
- Expo CLI : `npm install -g expo-cli eas-cli`

## Installation

```bash
npm install
```

## Lancer en développement

```bash
npx expo start
```

## Compiler l'APK

```bash
npx expo prebuild --platform android --clean
cd android && ./gradlew assembleRelease
```

Ou via EAS Build :

```bash
eas build -p android --profile preview
```

## Licence

GNU GPL v3 — voir le fichier LICENSE
