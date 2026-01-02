<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Gen Roof Tiling - AI-Powered CMS

A modern roofing business website with AI-driven content management, dynamic page building, and Google Sheets integration.

## Features

- 🚀 **AI-Powered CMS**: Dynamic page generation with Google Sheets backend
- 🎨 **Component System**: Modular React components with TypeScript
- 📱 **Responsive Design**: Mobile-first with Tailwind CSS
- 🤖 **Genkit AI Overlay**: Real-time optimization suggestions
- 📊 **Analytics Integration**: User behavior tracking and conversion optimization
- 🎯 **A/B Testing**: Variant testing with URL parameters (?variant=B)

## Quick Start

### Prerequisites
- Node.js 18+ and npm

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create `.env.local` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
   *Get your key from: https://ai.google.dev/*

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Project Structure

```
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components
│   └── magicui/        # Special effects components
├── features/           # Feature modules
│   ├── admin/          # Genkit AI overlay
│   ├── analytics/      # User tracking
│   ├── layout/         # Site layout & navigation
│   └── renderer/       # Page builder system
├── services/           # API services & business logic
├── lib/               # Utilities & validation
└── types.ts           # TypeScript definitions
```

## Available Pages

- **Home (/)**: Main landing page with hero, stats, features, reviews
- **Variant B (/?variant=B or /_B)**: Alternative layout for A/B testing
- **Bondi Area (/areas/bondi)**: Location-specific page

## API Integration

The app uses Sheet2DB for CMS functionality:
- **API ID**: `e9028d49-1711-4b29-90d2-5de17bbf21b9`
- **Sheets**: global, pages, leads, signals
- **Fallback**: Mock data when API unavailable

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn/ui
- **Backend**: Google Sheets (Sheet2DB API)
- **AI**: Google Gemini API
- **Routing**: React Router v7
- **Icons**: Lucide React

## Deployment

The app is configured for static site deployment. Build with `npm run build` and deploy the `dist/` folder.

View your app in AI Studio: https://ai.studio/apps/drive/1t0OYLWIkPhPfVlajbY4GOEyP-YgaG2fD
