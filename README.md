# Nexus Tac

Nexus Tac is a responsive, AI-powered tic-tac-toe game for the web and Android. It supports classic and expanded boards, local multiplayer, adjustable AI difficulty, persistent match scoring, move hints, animated wins, and selectable color themes.

**Live app:** [nexus-tac.netlify.app](https://nexus-tac.netlify.app)

## Features

- Play against the computer or another player on the same device.
- Choose 3×3, 4×4, 5×5, or 6×6 boards.
- Connect three marks on a 3×3 board or four marks on larger boards.
- Switch between Casual and Tactical AI difficulty.
- Request a suggested move during a human turn.
- Rename both players and track wins and draws across rounds.
- See the winning sequence with an animated connection line.
- Choose from multiple accent themes.
- Use the same responsive interface in a browser or as an Android app.
- Use `icon.png` consistently for the site brand, favicon, Android launcher icon, and splash screen.

## Technology

- [React](https://react.dev/) for the interface and game state
- [Vite](https://vite.dev/) for development and production builds
- [Capacitor](https://capacitorjs.com/) for the Android application wrapper
- CSS for the responsive glass-style interface and animations
- Netlify for web hosting

## Requirements

For web development:

- Node.js 20 or newer
- npm

For Android builds:

- Java Development Kit (JDK) 21 or newer
- Android SDK with platform tools, Android API 36, and build tools 35 or newer

## Local setup

Clone the repository and install its dependencies:

```bash
git clone <repository-url>
cd tic-tac-toe
npm install
```

Start the development server:

```bash
npm run dev
```

Vite prints the local URL in the terminal. Changes under `src/` are reflected automatically while the server is running.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create an optimized web build in `dist/`. |
| `npm run preview` | Preview the production web build locally. |
| `npm run android:sync` | Build the web app and copy it into the Android project. |
| `npm run android:apk` | Sync the web app and create a debug APK. |

## Game rules

Player X always starts a round. Players take turns placing a mark in an empty cell. On a 3×3 board, the first player to connect three marks horizontally, vertically, or diagonally wins. On 4×4, 5×5, and 6×6 boards, the target is four connected marks. A full board without a winning line is recorded as a draw.

Starting a new round keeps the current match score. Starting a new match resets wins and draws.

## AI behavior

Casual mode intentionally mixes tactical and random choices. Tactical mode checks immediate wins and blocks first, then evaluates future positions using depth-limited minimax, alpha-beta pruning, move ordering, and positional heuristics. Search depth is adjusted for larger boards to keep interaction responsive.

## Project structure

```text
.
├── android/                 Native Capacitor Android project
├── icon.png                Shared logo and launcher artwork
├── index.html              Web document and metadata
├── capacitor.config.json   Capacitor application configuration
├── src/
│   ├── components/         Interface components and modals
│   ├── data/               Theme definitions
│   ├── game/               Board rules and AI strategy
│   ├── hooks/              React game-state controller
│   ├── App.jsx             Application composition
│   ├── main.jsx            Browser entry point and favicon setup
│   └── styles.css          Responsive styles and animation
└── package.json            Dependencies and development commands
```

## Build the web app

```bash
npm run build
```

The deployable site is written to `dist/`. To test that exact output locally, run `npm run preview`.

## Deploy to Netlify

The production build command is `npm run build`, and the publish directory is `dist`.

Using the Netlify CLI:

```bash
npx netlify-cli login
npx netlify-cli link
npx netlify-cli deploy --prod --dir=dist
```

Run `npm run build` before a manual deployment whenever the source has changed.

## Build the Android APK

Ensure the Android SDK location is available through `ANDROID_HOME` or add a local, untracked `android/local.properties` file:

```properties
sdk.dir=/absolute/path/to/android-sdk
```

Then build the APK:

```bash
npm run android:apk
```

The installable debug package is generated at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

To refresh Android launcher and splash assets after changing `icon.png`, run:

```bash
npx @capacitor/assets generate --android --assetPath . \
  --iconBackgroundColor '#080b18' \
  --iconBackgroundColorDark '#080b18' \
  --splashBackgroundColor '#080b18' \
  --splashBackgroundColorDark '#080b18'
```

The debug APK is suitable for direct testing. Distribution through an app store requires a signed release APK or Android App Bundle and a securely managed release keystore.

## Accessibility and responsiveness

Interactive controls include accessible labels where visual text is insufficient. The interface adapts from desktop to small mobile screens, and animations are minimized when the operating system requests reduced motion.

## Author

Created by Soumya Pal.
