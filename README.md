# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Build for web and Android (APK)

This project supports running on the web and building an Android APK using EAS (Expo Application Services).

Prerequisites
- Node >= 16
- Expo CLI: `npm install -g expo-cli` (for classic commands) or use `npx expo`.
- EAS CLI for building native binaries: `npm install -g eas-cli` or `npx eas-cli`

Build web (static export)

```bash
npm run build:web
# Output will be in the `web-build` directory
```

Build Android (recommended: EAS)

1. Install and login with EAS:

```bash
npx eas login
```

2. Configure any Android credentials via the interactive prompts or in the Expo dashboard.

3. Trigger a production build (this will produce an APK/AAB depending on your `eas.json`):

```bash
npm run build:android:eas
```

If you prefer a local native build (requires Android toolchain), you can:

```bash
npm run prepare:android
npm run build:android:local
```

Notes
- EAS builds require a GitHub/Expo account for credentials and may prompt for signing keys.
- If you only need a web deployment, `npm run build:web` is sufficient and produces static files you can host with any static host.

