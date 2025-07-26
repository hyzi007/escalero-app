# 🎲 Escalero Playing Book

Modern digital score keeping application for Escalero dice game built with Next.js, React, and Tailwind CSS.

## ✨ Features

- 🎮 **Complete Game Management** - Add players, track scores, game history
- 📱 **PWA Ready** - Install as native app on mobile devices
- 🎨 **Modern UI** - Glassmorphism effects, dark/light theme
- 🔄 **Animated Scoring** - Smooth counter animations and visual feedback
- 📊 **Smart History** - Resume incomplete games, replay completed ones
- 🏆 **Win Celebration** - Confetti animation and winner announcement
- 📱 **Mobile Optimized** - Touch-friendly interface, responsive design

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/escalero-app)

### Manual Deployment:

1. **Create Project**:
   ```bash
   npx create-next-app@latest escalero-app --typescript --tailwind --eslint --app
   cd escalero-app
   ```

2. **Replace Files**:
   - Copy all files from this artifact into your project
   - Install dependencies: `npm install lucide-react`

3. **Deploy to Vercel**:
   ```bash
   npm install -g vercel
   vercel
   ```

4. **Or use Vercel Dashboard**:
   - Connect your GitHub repository
   - Deploy automatically

## 🎯 Game Rules

### Number Scoring:
- **9**: 1 point × count (0-5 dice)
- **10**: 2 points × count (0-5 dice)  
- **Jack**: 3 points × count (0-5 dice)
- **Queen**: 4 points × count (0-5 dice)
- **King**: 5 points × count (0-5 dice)
- **Ace**: 6 points × count (0-5 dice)

### Special Combinations:
- **Straight**: Normal 20pts | Served 25pts
- **Full House**: Normal 30pts | Served 35pts  
- **Poker**: Normal 40pts | Served 45pts
- **Grande**: Normal 50pts | Served 80pts

## 🛠️ Development

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

## 📱 PWA Installation

### Android:
1. Open app in Chrome
2. Tap "Install app" banner
3. Or use browser menu → "Add to Home Screen"

### iOS:
1. Open app in Safari
2. Tap Share button → "Add to Home Screen"
3. Confirm installation

## 🎨 Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Icons**: Lucide React
- **PWA**: Web App Manifest + Service Worker ready
- **Deployment**: Optimized for Vercel

## 📁 Project Structure

```
escalero-app/
├── app/
│   ├── globals.css          # Global styles + Tailwind
│   ├── layout.tsx           # Root layout with PWA meta
│   └── page.tsx             # Main game component
├── public/
│   ├── manifest.json        # PWA manifest
│   ├── icon-192x192.png     # App icons
│   └── icon-512x512.png
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind + animations
├── postcss.config.js        # PostCSS setup
└── package.json             # Dependencies
```

## 🔧 Configuration

The app is pre-configured for optimal Vercel deployment with:
- Automatic PWA optimization
- Image optimization
- Security headers
- TypeScript support
- ESLint configuration

## 📄 License

MIT License - feel free to use for personal or commercial projects.

---

**Ready to deploy?** Just push to GitHub and connect with Vercel! 🚀