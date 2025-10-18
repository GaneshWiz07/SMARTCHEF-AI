# SmartChef AI Logo Assets

This directory contains the logo files for SmartChef AI.

## Logo Files

### Primary Logo
- **chef-icon.svg** - Main app icon (100x100px)
  - Modern chef hat design in brand green (#22c55e)
  - SVG format for perfect scaling
  - Used for: Favicon, PWA icon, loading states

### Horizontal Logo
- **logo-horizontal.svg** - Horizontal brand lockup (200x60px)
  - Includes icon + "SmartChef AI" text
  - Perfect for: Navigation bars, headers, email signatures
  - SVG format for crisp display at any size

### PNG Exports (Recommended to generate)
- **logo-192.png** - 192x192px PNG (placeholder - needs generation)
- **logo-512.png** - 512x512px PNG (placeholder - needs generation)

## How to Generate PNG Files

You can convert the SVG to PNG using any of these methods:

### Method 1: Using Inkscape (Free, Desktop)
```bash
# Install Inkscape from https://inkscape.org/
inkscape chef-icon.svg --export-filename=logo-192.png --export-width=192 --export-height=192
inkscape chef-icon.svg --export-filename=logo-512.png --export-width=512 --export-height=512
```

### Method 2: Using ImageMagick (Command Line)
```bash
# Install ImageMagick from https://imagemagick.org/
convert -density 300 -background none chef-icon.svg -resize 192x192 logo-192.png
convert -density 300 -background none chef-icon.svg -resize 512x512 logo-512.png
```

### Method 3: Online Converter
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `chef-icon.svg`
3. Set dimensions to 192x192 (for first export) or 512x512 (for second)
4. Download and save in `/public` directory

### Method 4: Using Node.js (sharp library)
```bash
npm install sharp
```

```javascript
// convert-logo.js
const sharp = require('sharp');

async function convertLogo() {
  await sharp('public/chef-icon.svg')
    .resize(192, 192)
    .png()
    .toFile('public/logo-192.png');
    
  await sharp('public/chef-icon.svg')
    .resize(512, 512)
    .png()
    .toFile('public/logo-512.png');
    
  console.log('✓ Logos converted successfully!');
}

convertLogo();
```

Then run: `node convert-logo.js`

## Logo Usage in Code

### In HTML (Favicon)
```html
<link rel="icon" type="image/svg+xml" href="/chef-icon.svg" />
<link rel="apple-touch-icon" href="/chef-icon.svg" />
```

### In React Components
```jsx
import { ChefHat } from 'lucide-react';

// Using Lucide icon (already implemented)
<ChefHat className="w-8 h-8 text-primary-600" />

// Or using logo image
<img src="/chef-icon.svg" alt="SmartChef AI" className="w-10 h-10" />
```

### In PWA Manifest
```json
{
  "icons": [
    {
      "src": "/chef-icon.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    },
    {
      "src": "/logo-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/logo-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## Design Specifications

### Colors
- **Primary Green**: `#22c55e` (Tailwind `green-500`)
- **Darker Green**: `#16a34a` (Tailwind `green-600`)
- **Accent Blue**: `#2563eb` (Tailwind `blue-600`)
- **White**: `#ffffff`

### Icon Design
- Chef hat with pleated details
- Clean, minimal design
- Follows Lucide icon style guidelines
- Circular background with gradient
- Drop shadow for depth

### Dimensions
- Square format: 100x100px (scalable SVG)
- Horizontal format: 200x60px (scalable SVG)
- Recommended exports: 192x192px, 512x512px PNG

## File Locations
- `/public/chef-icon.svg` - Primary logo
- `/public/logo-horizontal.svg` - Horizontal logo
- `/public/logo-192.png` - PWA icon (192x192)
- `/public/logo-512.png` - PWA icon (512x512)
- `/public/favicon.ico` - Browser favicon

## Browser Support
- SVG: All modern browsers
- PNG fallbacks: Universal support
- Apple Touch Icon: iOS devices
- PWA Icons: Android, iOS, desktop PWA installations

## License
Copyright © 2025 SmartChef AI Team. All rights reserved.
