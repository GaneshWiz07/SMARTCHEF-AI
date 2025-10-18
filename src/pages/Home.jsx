import { Link } from 'react-router-dom';
import { Bot, Search, Salad, Clock, Dumbbell, Recycle, Brain, Zap, Target, Star } from 'lucide-react';
import Logo from '../components/Logo';

function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
    <section className="text-center py-8 sm:py-12 px-4">
      <div className="flex justify-center mb-4">
        <Logo className="w-16 h-16 sm:w-20 sm:h-20" />
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        Welcome to <span className="text-primary-600">SmartChef</span> <span className="text-blue-600">AI</span>
      </h1>
      <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Your AI-powered recipe assistant that uses machine learning to create personalized meal plans, match ingredients intelligently, and help you cook smarter.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
        <Link to="/recipes" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 text-center">
          Find Recipes
        </Link>
        <Link to="/meal-planner" className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 text-center">
          Plan Meals
        </Link>
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

