import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { User, Phone, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/accounts/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone_number: formData.phoneNumber || null,
          password: formData.password
        }),
      });
      
      if (response.ok) {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect');
        if (redirectUrl) {
          navigate(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
        } else {
          navigate('/auth/login');
        }
      } else {
        const data = await response.json();
        const errorMsg = data.detail || (data.email ? 'Email: ' + data.email[0] : 'Registration failed.');
        setError(errorMsg);
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-text-main mb-2">Create an account</h2>
        <p className="text-sm text-text-main/70 mb-8">
          Join us to book workspaces, library seats, and more.
        </p>
      </div>

      <div className="mt-8">
        <form className="space-y-4" onSubmit={handleSignup}>
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-text-main mb-1">
                First name
              </label>
              <Input 
                id="firstName" 
                type="text" 
                placeholder="John" 
                value={formData.firstName}
                onChange={handleChange}
                leftIcon={<User size={18} />} 
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-text-main mb-1">
                Last name
              </label>
              <Input 
                id="lastName" 
                type="text" 
                placeholder="Doe" 
                value={formData.lastName}
                onChange={handleChange}
                leftIcon={<User size={18} />} 
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-main mb-1">
              Email address
            </label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              value={formData.email}
              onChange={handleChange}
              leftIcon={<Mail size={18} />} 
              required
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-text-main mb-1">
              Phone number (Optional)
            </label>
            <Input 
              id="phoneNumber" 
              type="tel" 
              placeholder="e.g. 1234567890" 
              value={formData.phoneNumber}
              onChange={handleChange}
              leftIcon={<Phone size={18} />} 
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-main mb-1">
              Password
            </label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={handleChange}
              leftIcon={<Lock size={18} />} 
              required
            />
          </div>

          <Button type="submit" className="w-full mt-6" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-text-main/70">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
