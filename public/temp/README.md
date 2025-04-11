# PWA Assets Generator

This utility helps generate the necessary assets for the Resume Matcher Progressive Web App (PWA).

## Prerequisites

- Node.js 18 or later
- NPM or Yarn

## Setup

Install dependencies:

```bash
npm install
# or
yarn install
```

## Usage

### Generate All Assets

To generate both maskable icons and screenshots:

```bash
npm run generate
# or
yarn generate
```

### Generate Only Icons

To generate only the maskable icons:

```bash
npm run generate:icons
# or
yarn generate:icons
```

### Generate Only Screenshots

To generate only the screenshots:

```bash
npm run generate:screenshots
# or
yarn generate:screenshots
```

## What This Generates

1. **Maskable Icons** - Icons with proper padding for PWA installation on devices
   - `maskable-192x192.png` 
   - `maskable-512x512.png`

2. **Screenshots** - Placeholder screenshots for the app listing
   - `screenshot-wide.png` (1366x768) for desktop view
   - `screenshot-mobile.png` (390x844) for mobile view

## Input Requirements

This script expects the following files to exist in the `public` directory:
- `pwa-192x192.png`
- `pwa-512x512.png`

## Manual Verification

After generating the assets, you can verify your PWA configuration with these tools:
- [PWA Builder](https://www.pwabuilder.com/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PWA Asset Generator](https://www.npmjs.com/package/pwa-asset-generator) 