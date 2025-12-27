# 😱 Scream Therapy - Private Stress Relief

A completely private stress-relief web application built with Next.js (App Router). Scream, vent, and release stress - all locally in your browser. **No data ever leaves your device.**

![Scream Therapy Screenshot](https://github.com/user-attachments/assets/e3af6d43-aa52-4ee8-aadb-88a824f5c6e5)

## 🔒 Privacy Guarantees

**All activity happens locally in your browser. No data is sent or stored on any server. Refreshing the page permanently deletes everything.**

- ✅ **Client-only architecture** - Uses `"use client"` components only
- ✅ **No API routes** - No server-side data processing
- ✅ **No Server Actions** - No server-side mutations
- ✅ **No databases** - Zero server storage
- ✅ **No tracking or analytics** - No Google Analytics, Vercel Analytics, Sentry, PostHog, Hotjar, or any logging SDK
- ✅ **Content Security Policy** - Blocks all outbound connections (`connect-src 'none'`)
- ✅ **Ephemeral by default** - All data stored in-memory (RAM) only
- ✅ **Auto-wipe on exit** - Page refresh or tab close erases everything

## 🎯 Features

### 🎤 Scream Analyzer
- Uses `navigator.mediaDevices.getUserMedia` for microphone access
- Real-time audio analysis with `AudioContext` and `AnalyserNode`
- Visual feedback showing volume levels
- **No audio recording or storage**

### 📝 Vent Box
- Type or speak your frustrations
- Voice-to-text using Web Speech API (browser-native)
- Save vents to in-memory storage
- "Burn It" feature to instantly delete

### 🥊 Stress Relief Punching Bag
- Canvas-based interactive stress toy
- Click/tap to punch with particle effects
- Emotion reactions based on hit count
- **No interaction data tracked**

### 🔐 Privacy Controls
- **Panic Wipe Button** - Instantly delete all data
- **Optional Local Persistence** - Opt-in IndexedDB storage (still local-only)
- Detailed privacy information display

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css      # Global styles (system fonts only)
│   ├── layout.tsx       # Root layout with privacy meta tags
│   └── page.tsx         # Main page with tab navigation
├── components/
│   ├── ScreamAnalyzer.tsx   # Microphone scream analyzer
│   ├── VentBox.tsx          # Text/voice vent component
│   ├── StressToy.tsx        # Canvas punching bag
│   └── PrivacyNotice.tsx    # Privacy controls & info
├── hooks/
│   ├── useScreamAnalyzer.ts # Audio analysis hook
│   └── useVoiceToText.ts    # Web Speech API hook
└── lib/
    ├── memoryStore.ts       # In-memory data storage
    └── indexedDbStore.ts    # Optional IndexedDB (opt-in)
```

## 🛡️ Security Configuration

### Content Security Policy (CSP)
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' blob: data:;
font-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
connect-src 'none';  # Blocks ALL outbound network requests
media-src 'self' blob:;
worker-src 'self' blob:;
```

## 📝 Technical Notes

- **No external fonts** - Uses system font stack to avoid external requests
- **No telemetry** - Next.js telemetry can be disabled via environment
- **Dynamic imports with SSR disabled** - Ensures client-only rendering
- **beforeunload cleanup** - Automatic data wipe on page exit

## 📄 License

This project is for stress relief purposes. Use responsibly.
