import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import MealPlanner from './pages/MealPlanner';
import Pantry from './pages/Pantry';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

// Page transition wrapper component
function PageTransition({ children }) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fadeOut');
    }
  }, [location, displayLocation]);

  return (
    <div
      className={`page-transition ${transitionStage}`}
      onAnimationEnd={() => {
        if (transitionStage === 'fadeOut') {
          setTransitionStage('fadeIn');
          setDisplayLocation(location);
        }
      }}
    >
      {children}
    </div>
  );
}

function Navigation() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Don't show navigation on login page
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <nav className="bg-white/70 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-white/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <span className="text-2xl sm:text-3xl">👨‍🍳</span>
            <span className="text-lg sm:text-2xl font-bold text-primary-600">
              ChefMind <span className="text-blue-600">AI</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'text-primary-600 font-bold' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/recipes" 
              className={`nav-link ${location.pathname === '/recipes' ? 'text-primary-600 font-bold' : ''}`}
            >
              Recipes
            </Link>
            <Link 
              to="/meal-planner" 
              className={`nav-link ${location.pathname === '/meal-planner' ? 'text-primary-600 font-bold' : ''}`}
            >
              Meal Planner
            </Link>
            <Link 
              to="/pantry" 
              className={`nav-link ${location.pathname === '/pantry' ? 'text-primary-600 font-bold' : ''}`}
            >
              Pantry
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="w-8 h-8 rounded-full border-2 border-primary-500 object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-primary-500 bg-primary-100 flex items-center justify-center text-primary-600 font-bold"
                    style={{ display: user.photoURL ? 'none' : 'flex' }}
                  >
                    {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm text-gray-700 font-medium hidden lg:inline">
                    {user.displayName?.split(' ')[0] || 'User'}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-primary-600 hover:bg-primary-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors font-medium text-sm"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button with Animation */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700 hover:text-primary-600 focus:outline-none p-2 rounded-lg hover:bg-primary-50 transition-all duration-300"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center relative">
              {/* Top line */}
              <span
                className={`block w-6 h-0.5 bg-current absolute transition-all duration-300 ease-in-out ${
                  mobileMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'
                }`}
              ></span>
              {/* Middle line */}
              <span
                className={`block w-6 h-0.5 bg-current transition-all duration-300 ease-in-out ${
                  mobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                }`}
              ></span>
              {/* Bottom line */}
              <span
                className={`block w-6 h-0.5 bg-current absolute transition-all duration-300 ease-in-out ${
                  mobileMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'
                }`}
              ></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu with Slide Animation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 space-y-3 border-t border-white/20 bg-white/90 backdrop-blur-md">
            <Link
              to="/"
              className={`block px-4 py-2 rounded-lg transition-all duration-200 transform hover:translate-x-1 ${
                location.pathname === '/' 
                  ? 'bg-primary-50 text-primary-600 font-bold' 
                  : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
              }`}
              onClick={closeMobileMenu}
            >
              🏠 Home
            </Link>
            <Link
              to="/recipes"
              className={`block px-4 py-2 rounded-lg transition-all duration-200 transform hover:translate-x-1 ${
                location.pathname === '/recipes' 
                  ? 'bg-primary-50 text-primary-600 font-bold' 
                  : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
              }`}
              onClick={closeMobileMenu}
            >
              🍳 Recipes
            </Link>
            <Link
              to="/meal-planner"
              className={`block px-4 py-2 rounded-lg transition-all duration-200 transform hover:translate-x-1 ${
                location.pathname === '/meal-planner' 
                  ? 'bg-primary-50 text-primary-600 font-bold' 
                  : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
              }`}
              onClick={closeMobileMenu}
            >
              📅 Meal Planner
            </Link>
            <Link
              to="/pantry"
              className={`block px-4 py-2 rounded-lg transition-all duration-200 transform hover:translate-x-1 ${
                location.pathname === '/pantry' 
                  ? 'bg-primary-50 text-primary-600 font-bold' 
                  : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
              }`}
              onClick={closeMobileMenu}
            >
              📦 Pantry
            </Link>

            {user ? (
              <div className="px-4 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="w-10 h-10 rounded-full border-2 border-primary-500 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full border-2 border-primary-500 bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                      {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-800">{user.displayName || 'User'}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="px-4">
                <Link
                  to="/login"
                  className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 font-medium shadow-md hover:shadow-lg"
                  onClick={closeMobileMenu}
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  const location = useLocation();
  const showFooter = location.pathname !== '/login';
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-100">
      <Navigation />

      {/* Main Content with Transition */}
      <main className="container mx-auto px-4 py-8 relative">
        <div
          key={location.pathname}
          className={`page-transition ${isTransitioning ? 'page-enter' : 'page-enter-active'}`}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route
              path="/meal-planner"
              element={
                <ProtectedRoute>
                  <MealPlanner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pantry"
              element={
                <ProtectedRoute>
                  <Pantry />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </main>

      {/* Footer */}
      {showFooter && (
        <footer className="bg-white/70 backdrop-blur-md mt-16 py-8 border-t border-white/20">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>© 2025 ChefMind AI - Your AI-Powered Recipe Assistant</p>
          </div>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;

