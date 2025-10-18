import { Link } from 'react-router-dom';
import { Bot, Search, Salad, Clock, Dumbbell, Recycle, Brain, Zap, Target, Star, Sparkles, TrendingUp, Award } from 'lucide-react';
import Logo from '../components/Logo';

function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section with Floating Recipe Cards */}
      <section className="relative py-12 sm:py-20 px-4 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient Orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-float-delayed"></div>
          
          {/* Floating Recipe Cards - Hidden on mobile */}
          <div className="hidden lg:block">
            {/* Top Left Card - Fresh Salad */}
            <div className="absolute top-10 left-10 w-48 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden animate-float-slow border border-white/50">
              <div className="w-full h-32 bg-gradient-to-br from-orange-400 to-red-500 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&q=80" 
                  alt="Fresh Salad"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-sm text-gray-800 mb-2 line-clamp-1">Mediterranean Salad</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Clock className="w-3 h-3" />
                    <span className="font-semibold">25 min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                    <span className="text-xs font-semibold text-gray-700">4.9</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Top Right Card - Pasta Dish */}
            <div className="absolute top-20 right-10 w-56 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden animate-float-delayed border border-white/50">
              <div className="w-full h-36 bg-gradient-to-br from-green-400 to-emerald-600 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop&q=80" 
                  alt="Pasta Bowl"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute top-2 right-2 bg-primary-600/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Bot className="w-3 h-3" />
                  <span>AI Pick</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-sm text-gray-800 mb-2 line-clamp-1">Creamy Pesto Pasta</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Clock className="w-3 h-3" />
                    <span className="font-semibold">30 min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                    <span className="text-xs font-semibold text-gray-700">4.8</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom Left Card - Breakfast Bowl */}
            <div className="absolute bottom-20 left-20 w-52 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden animate-float border border-white/50">
              <div className="w-full h-32 bg-gradient-to-br from-purple-400 to-pink-500 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=400&h=300&fit=crop&q=80" 
                  alt="Breakfast Bowl"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute top-2 left-2 bg-orange-500/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Trending</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-sm text-gray-800 mb-2 line-clamp-1">Açai Power Bowl</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Clock className="w-3 h-3" />
                    <span className="font-semibold">15 min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                    <span className="text-xs font-semibold text-gray-700">5.0</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom Right Card - Gourmet Dish */}
            <div className="absolute bottom-10 right-20 w-48 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden animate-float-slow border border-white/50">
              <div className="w-full h-32 bg-gradient-to-br from-blue-400 to-cyan-500 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&q=80" 
                  alt="Gourmet Dish"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute top-2 right-2 bg-yellow-500/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  <span>Premium</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-sm text-gray-800 mb-2 line-clamp-1">Grilled Salmon Platter</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Clock className="w-3 h-3" />
                    <span className="font-semibold">35 min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                    <span className="text-xs font-semibold text-gray-700">4.9</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Logo with Glow Effect */}
          <div className="flex justify-center mb-6 relative">
            <div className="absolute inset-0 bg-primary-400/30 blur-2xl rounded-full animate-pulse"></div>
            <Logo className="relative w-20 h-20 sm:w-24 sm:h-24 drop-shadow-2xl" />
          </div>
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-100 to-blue-100 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-primary-200/50 shadow-lg">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold text-primary-700">AI-Powered Recipe Intelligence</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Cook Smarter with
            <br />
            <span className="bg-gradient-to-r from-primary-600 via-green-600 to-blue-600 bg-clip-text text-transparent">
              SmartChef AI
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Transform your cooking experience with AI-powered meal planning, intelligent recipe matching, and personalized nutrition insights.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-12">
            <Link 
              to="/recipes" 
              className="group relative bg-gradient-to-r from-primary-600 to-green-600 text-white font-bold text-lg px-10 py-4 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Search className="w-5 h-5" />
                Find Recipes
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link 
              to="/meal-planner" 
              className="group bg-white text-primary-600 font-bold text-lg px-10 py-4 rounded-xl shadow-xl hover:shadow-2xl border-2 border-primary-200 hover:border-primary-400 transform hover:scale-105 transition-all duration-300"
            >
              <span className="flex items-center justify-center gap-2">
                <Bot className="w-5 h-5" />
                AI Meal Planner
              </span>
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-semibold">10,000+ Recipes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="font-semibold">100% Free</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="font-semibold">AI-Powered</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
            <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4">
              <FeatureCard
                icon={<Bot className="w-12 h-12" />}
                title="AI Meal Planning"
                description="Let our AI create personalized weekly meal plans tailored to your dietary needs and preferences"
                highlight={true}
              />
              <FeatureCard
                icon={<Search className="w-12 h-12" />}
                title="Smart Recipe Search"
                description="Find recipes based on ingredients you already have with intelligent matching"
              />
              <FeatureCard
                icon={<Salad className="w-12 h-12" />}
                title="Nutrition Tracking"
                description="Get detailed nutrition information for every recipe"
              />
          </section>

          {/* AI Feature Section */}
          <AIFeatureSection />

          {/* Benefits Section */}
            <section className="glass-card p-6 sm:p-8 mx-4">
              <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
                <Logo className="w-8 h-8" />
                <h2 className="text-2xl sm:text-3xl font-bold text-center">Why SmartChef AI?</h2>
              </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <BenefitCard
            title="Save Time"
            description="No more endless scrolling through recipes. Get instant suggestions based on what you have."
            icon={<Clock className="w-10 h-10" />}
          />
          <BenefitCard
            title="Eat Healthier"
            description="Track nutrition, get healthier alternatives, and meet your dietary goals."
            icon={<Dumbbell className="w-10 h-10" />}
          />
          <BenefitCard
            title="Reduce Waste"
            description="Use ingredients before they expire and minimize food waste."
            icon={<Recycle className="w-10 h-10" />}
          />
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-4">
        <StatCard value="10,000+" label="Recipes" />
        <StatCard value="100%" label="Free" />
        <StatCard value="50+" label="Cuisines" />
        <StatCard value="24/7" label="Available" />
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, highlight }) {
  return (
    <div className={`glass-card p-6 text-center ${highlight ? 'border-2 border-blue-400/50 bg-gradient-to-br from-blue-50/80 to-purple-50/80 relative' : ''}`}>
      {highlight && (
        <div className="absolute top-4 right-4 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
          <Star className="w-3 h-3" fill="currentColor" /> AI
        </div>
      )}
      <div className="text-primary-600 mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function AIFeatureSection() {
  return (
    <section className="bg-gradient-to-r from-primary-600 to-green-600 rounded-2xl shadow-2xl p-6 sm:p-8 text-white mx-4">
      <div className="text-center mb-6 sm:mb-8">
        <div className="flex justify-center mb-4">
          <Bot className="w-16 h-16 sm:w-20 sm:h-20" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">AI-Powered Meal Planning</h2>
        <p className="text-base sm:text-lg md:text-xl text-green-100 max-w-2xl mx-auto">
          Our advanced AI technology analyzes your preferences, dietary restrictions, and goals to create perfectly personalized meal plans
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <div className="flex justify-center mb-3">
            <Brain className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-bold mb-2">Smart Learning</h3>
          <p className="text-green-100 text-sm">
            AI understands your dietary needs, budget, and preferences to generate optimal meal plans
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <div className="flex justify-center mb-3">
            <Zap className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-bold mb-2">Instant Generation</h3>
          <p className="text-green-100 text-sm">
            Get a complete 7-day meal plan with shopping list in seconds, not hours
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <div className="flex justify-center mb-3">
            <Target className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-bold mb-2">Personalized</h3>
          <p className="text-green-100 text-sm">
            Every meal plan is unique, tailored specifically to your lifestyle and goals
          </p>
        </div>
      </div>

      <div className="text-center mt-8">
        <Link 
          to="/meal-planner" 
          className="inline-block bg-white text-primary-600 font-bold px-8 py-4 rounded-xl hover:bg-green-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Try AI Meal Planner Now →
        </Link>
      </div>
    </section>
  );
}

function BenefitCard({ icon, title, description }) {
  return (
    <div className="text-center">
      <div className="flex justify-center text-primary-600 mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="glass-card p-6 text-center">
      <div className="text-3xl font-bold text-primary-600">{value}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}

export default Home;

// Add these custom animations to your index.css or tailwind.config.js
// @keyframes float {
//   0%, 100% { transform: translateY(0px) rotate(0deg); }
//   50% { transform: translateY(-20px) rotate(2deg); }
// }
// @keyframes float-delayed {
//   0%, 100% { transform: translateY(0px) rotate(0deg); }
//   50% { transform: translateY(-15px) rotate(-2deg); }
// }
// @keyframes float-slow {
//   0%, 100% { transform: translateY(0px) rotate(0deg); }
//   50% { transform: translateY(-25px) rotate(3deg); }
// }

