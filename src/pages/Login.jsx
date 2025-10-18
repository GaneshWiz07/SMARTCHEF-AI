import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      setError(error.message || 'Failed to sign in. Please try again.');
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-green-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo and Welcome */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-full shadow-xl border border-white/30">
              <span className="text-6xl">👨‍🍳</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to <span className="text-primary-600">SmartChef</span> <span className="text-blue-600">AI</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Your AI-powered recipe assistant
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-6 border border-white/20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-600">
              Sign in to access your personalized recipes, meal plans, and pantry
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white/90 backdrop-blur-md border-2 border-white/30 hover:border-primary-500 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-primary-600 border-t-transparent rounded-full"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="group-hover:text-primary-600 transition-colors">
                  Continue with Google
                </span>
              </>
            )}
          </button>

          {/* Features Preview */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4 text-center font-medium">
              What you'll get:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="text-green-500 text-xl">✓</span>
                <span>Personalized recipe recommendations</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="text-green-500 text-xl">✓</span>
                <span>Custom meal plans & shopping lists</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="text-green-500 text-xl">✓</span>
                <span>Your own pantry manager</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="text-green-500 text-xl">✓</span>
                <span>Nutrition tracking & insights</span>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy.
          <br />
          Your data is securely stored and never shared.
        </p>
      </div>
    </div>
  );
}

export default Login;

