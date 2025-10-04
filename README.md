# 🤖 ChefMind AI - Your AI-Powered Recipe Assistant

An AI-powered recipe assistant that uses machine learning to create personalized meal plans, match ingredients intelligently, and help you cook smarter, eat healthier, and reduce food waste.

## ✨ Features

### 🤖 **AI-Powered** (Using Hugging Face Mixtral-8x7B)
- **AI Meal Planning**: Generate personalized weekly meal plans using advanced AI
- **Smart Dietary Analysis**: AI understands your restrictions and preferences
- **Budget Optimization**: AI creates cost-effective meal plans based on your budget

### 🔐 **Authentication & Security**
- **Google Sign-In**: Secure authentication with Firebase
- **Multi-User Support**: Each user has isolated data and personalized experience

### 🍳 **Recipe Features**
- **Smart Recipe Search**: Find recipes based on ingredients you already have
- **Ingredient Matching**: Recipes ranked by how many of your ingredients they use
- **50+ Cuisines**: Filter by Indian, Chinese, Japanese, Italian, and more
- **Dietary Filters**: Vegetarian, vegan, keto, paleo, seafood, and more
- **10,000+ Recipes**: From TheMealDB and Edamam APIs

### 📊 **Nutrition & Health**
- **Nutrition Tracking**: Detailed nutrition information for every recipe
- **Calorie Counting**: Track daily intake and meet your health goals

### 📦 **Pantry Management**
- **Personal Pantry**: Track your own ingredients and expiry dates
- **Expiry Alerts**: Get notified when items are about to expire
- **Waste Reduction**: Use ingredients before they go bad

### 📱 **Technology**
- **Progressive Web App**: Install on mobile devices for offline access
- **Modern UI**: Beautiful, responsive design with TailwindCSS
- **Real-time Updates**: Instant recipe search and AI meal generation

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool
- **TailwindCSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Firebase Auth** - Google authentication

### Backend
- **Netlify Serverless Functions** - Zero-config backend
- **MongoDB Atlas** - Cloud database (free tier)
- **Firebase Authentication** - User management

### APIs (All Free!)
- **TheMealDB** - Recipe database
- **Edamam** - Recipe search & nutrition analysis
- **Hugging Face** - AI meal plan generation
- **Open Food Facts** - Nutrition fallback
- **Firebase Auth** - Google Sign-In

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Netlify account
- MongoDB Atlas account
- Firebase account (for authentication)
- API keys (see below)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd chefmind
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# MongoDB Atlas
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chefmind?retryWrites=true&w=majority

# Edamam API (Free Tier)
# Sign up at: https://developer.edamam.com/
EDAMAM_APP_ID=your_app_id
EDAMAM_APP_KEY=your_app_key

# Hugging Face API
# Get token at: https://huggingface.co/settings/tokens
HF_API_KEY=your_hugging_face_token

# Firebase Authentication
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Set up Firebase Authentication

**📖 See detailed guide:** [FIREBASE_SETUP.md](FIREBASE_SETUP.md)

Quick steps:
1. Create Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Google Sign-In
3. Copy Firebase config to `.env` file

### 5. Get API Keys

#### MongoDB Atlas (Free)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Add to `MONGO_URI`

#### Edamam (Free Tier - 10,000 calls/month)
1. Sign up at [Edamam Developer](https://developer.edamam.com/)
2. Choose "Nutrition Analysis API"
3. Get App ID and App Key
4. Add to `.env`

#### Hugging Face (Free)
1. Create account at [Hugging Face](https://huggingface.co/)
2. Go to Settings → Access Tokens
3. Create new token
4. Add to `HF_API_KEY`

#### TheMealDB & Open Food Facts
- No API keys needed! Completely free.

## 🏃 Running Locally

### Development mode (with functions)
```bash
npm run dev
```

Visit `http://localhost:8888`

This runs Netlify Dev which includes both the frontend and serverless functions.

### Frontend only (faster, but no backend)
```bash
npm run dev:frontend
```

Visit `http://localhost:5173`

Use this only for UI/styling work. Functions won't be available.

## 🚀 Deployment

### Deploy to Netlify

1. **Connect to Git**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy on Netlify**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository
   - Build settings are auto-detected from `netlify.toml`
   - Click "Deploy site"

3. **Set Environment Variables**
   - Go to Site settings → Environment variables
   - Add all variables from `.env`:
     - `MONGO_URI`
     - `EDAMAM_APP_ID`
     - `EDAMAM_APP_KEY`
     - `HF_API_KEY`

4. **Redeploy**
   - Trigger a new deploy after adding env variables

## 📁 Project Structure

```
chefmind-ai/
├── netlify/
│   └── functions/          # Serverless backend functions
│       ├── get-recipes.js  # Fetch recipes from TheMealDB
│       ├── nutrition.js    # Get nutrition data
│       ├── meal-plan.js    # Generate meal plans
│       └── pantry.js       # Manage pantry items
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── sw.js              # Service worker
│   └── chef-icon.svg      # App icon
├── src/
│   ├── components/        # Reusable components
│   │   ├── VoiceAssistant.jsx
│   │   ├── RecipeCard.jsx
│   │   ├── IngredientInput.jsx
│   │   └── DietaryFilter.jsx
│   ├── pages/            # Route pages
│   │   ├── Home.jsx
│   │   ├── Recipes.jsx
│   │   ├── MealPlanner.jsx
│   │   └── Pantry.jsx
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── netlify.toml          # Netlify configuration
├── package.json          # Dependencies
├── tailwind.config.js    # Tailwind configuration
└── vite.config.js        # Vite configuration
```

## 🎯 Features in Detail

### Recipe Search
- Search by ingredients you have
- Filter by dietary preferences
- Get random recipe suggestions
- View detailed instructions and video tutorials
- See nutrition information

### Meal Planning
- Generate 3-14 day meal plans
- Customize by dietary preference and budget
- Get automated shopping lists
- See cost estimates
- Balance nutrition automatically

### Pantry Management
- Track all your ingredients
- Set expiry dates
- Get warnings for expiring items
- Reduce food waste

### Voice Assistant
- Hands-free recipe search
- Navigate between pages
- Get help and suggestions
- Uses browser's Web Speech API

## 🌐 API Endpoints

All endpoints are accessible at `/.netlify/functions/{name}`

### POST `/get-recipes`
```json
{
  "ingredients": ["chicken", "tomato"],
  "dietary": "none"
}
```

### POST `/nutrition`
```json
{
  "ingredients": ["1 cup rice", "200g chicken"],
  "recipe": { "name": "Chicken Rice" }
}
```

### POST `/meal-plan`
```json
{
  "days": 7,
  "dietary": "vegetarian",
  "budget": "moderate",
  "preferences": "high protein"
}
```

### GET/POST/PUT/DELETE `/pantry`
- GET: Retrieve pantry items
- POST: Add items
- PUT: Update item
- DELETE: Remove item

## 🎨 Customization

### Change Theme Colors
Edit `tailwind.config.js`:
```js
colors: {
  primary: {
    500: '#your-color',
    // ...
  }
}
```

### Add New Dietary Filters
Edit `src/components/DietaryFilter.jsx` to add more options.

### Customize Meal Templates
Edit `generateTemplateMealPlan()` in `netlify/functions/meal-plan.js`.

## 🐛 Troubleshooting

### Voice Assistant Not Working
- Use Chrome, Edge, or Safari (Firefox has limited support)
- Enable microphone permissions
- Use HTTPS (required for Web Speech API)

### Recipes Not Loading
- Check if TheMealDB API is accessible
- Verify network connectivity
- Check browser console for errors

### Nutrition Data Failing
- Verify Edamam API credentials
- Check remaining API quota (10k/month free)
- App will fallback to estimates if API fails

### MongoDB Connection Issues
- Verify connection string format
- Check IP whitelist in MongoDB Atlas
- Ensure environment variables are set in Netlify

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 🙏 Acknowledgments

- TheMealDB for the recipe database
- Edamam for nutrition API
- Hugging Face for AI capabilities
- Open Food Facts for nutrition data
- All open-source contributors

## 📧 Contact

For questions or suggestions, please open an issue on GitHub.

---

**Made with ❤️ and 🍳 by ChefMind AI Team**


