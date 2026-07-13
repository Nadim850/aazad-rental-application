import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Replace with your actual GitHub Client ID
  const GITHUB_CLIENT_ID = "YOUR_GITHUB_CLIENT_ID";

  useEffect(() => {
    // Check for GitHub OAuth callback code in URL
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    if (code) {
      handleSocialLogin('github', code);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/accounts/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access', data.access);
        localStorage.setItem('refresh', data.refresh);
        navigate('/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider, token) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/accounts/social-login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, token }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access', data.access);
        localStorage.setItem('refresh', data.refresh);
        navigate('/dashboard');
      } else {
        const data = await response.json();
        setError(data.error || 'Social login failed');
      }
    } catch (err) {
      setError('Network error during social login');
    } finally {
      setIsLoading(false);
      // Clean up URL if it was a github callback
      if (provider === 'github') {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      // get id_token or access_token depending on the flow (standard implicit flow returns access_token)
      // Usually social logins prefer id_token. If useGoogleLogin is used, we might need to get user info or use the access_token.
      // Since our backend expects an id_token or standard token, we'll send the access_token.
      handleSocialLogin('google', tokenResponse.access_token);
    },
    onError: () => setError('Google Login Failed'),
  });

  const githubLogin = () => {
    window.location.assign(`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-text-main mb-2">Welcome back</h2>
        <p className="text-sm text-text-main/70 mb-8">
          Enter your details to access your workspace and library bookings.
        </p>
      </div>

      <div className="mt-8">
        <form className="space-y-5" onSubmit={handleLogin}>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-sm">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-main mb-2">
              Email address
            </label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              leftIcon={<Mail size={18} />} 
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-main mb-2">
              Password
            </label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={18} />} 
              required
            />
          </div>

          <Button type="submit" className="w-full mt-6" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-main" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 text-text-main/50">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full" onClick={() => googleLogin()} disabled={isLoading}>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </Button>
            <Button variant="outline" className="w-full" onClick={githubLogin} disabled={isLoading}>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              GitHub
            </Button>
          </div>
        </div>
        
        <p className="mt-8 text-center text-sm text-text-main/70">
          Don't have an account?{' '}
          <Link to="/auth/signup" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
