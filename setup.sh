#!/bin/bash

# IP Tracking Dashboard - Quick Start Script

echo "================================"
echo "IP Tracking Dashboard Setup"
echo "================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14+ first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ NPM version: $(npm -v)"
echo ""

# Backend setup
echo "📦 Setting up backend..."
cd backend

if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your Firebase credentials"
fi

echo "Installing dependencies..."
npm install

echo ""
echo "✅ Backend setup complete!"
echo ""

# Frontend info
echo "📱 Frontend setup:"
echo "The frontend is ready to use!"
echo ""

echo "================================"
echo "Quick Start Commands"
echo "================================"
echo ""
echo "1️⃣  Start Backend:"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "2️⃣  Start Frontend (in another terminal):"
echo "   Open: frontend/index.html in your browser"
echo "   OR use a local server:"
echo "   python -m http.server 3000"
echo ""
echo "3️⃣  Deploy to Vercel:"
echo "   vercel --prod"
echo ""
echo "================================"
echo "Next Steps"
echo "================================"
echo ""
echo "1. Get Firebase credentials:"
echo "   - Go to https://console.firebase.google.com/"
echo "   - Create new project"
echo "   - Add service account"
echo "   - Copy credentials to backend/.env"
echo ""
echo "2. Update API URL in frontend/js/api.js"
echo ""
echo "3. Run the application"
echo ""
echo "For detailed setup, see README.md"
