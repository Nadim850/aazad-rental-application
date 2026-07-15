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
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (id, value) => {
    let errorMsg = null;
    if (id === 'firstName') {
      if (!value.trim()) {
        errorMsg = 'First name is required.';
      } else if (!/^[A-Za-z\s\-']+$/.test(value)) {
        errorMsg = "First name can only contain letters, spaces, hyphens, and apostrophes.";
      }
    } else if (id === 'lastName') {
      if (!value.trim()) {
        errorMsg = 'Last name is required.';
      }
    } else if (id === 'email') {
      if (!value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errorMsg = 'Please enter a valid email address.';
      }
    } else if (id === 'phoneNumber') {
      if (value && !/^\d{10}$/.test(value)) {
        errorMsg = 'Phone number must contain exactly 10 digits.';
      }
    } else if (id === 'password') {
      const pwd = value.trim();
      if (!pwd) {
        errorMsg = 'Password is required.';
      } else if (/\s/.test(value)) {
        errorMsg = 'Password cannot contain spaces.';
      } else if (pwd.length < 8) {
        errorMsg = 'Password must be at least 8 characters.';
      }
    }
    return errorMsg;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    
    // For password, we don't trim while typing so they can see the error, or we can prevent spaces?
    // User requested "Trim accidental leading/trailing spaces before validation if appropriate"
    // Let's just update the state
    setFormData(prev => ({ ...prev, [id]: value }));

    // Clear the specific error when user types and it becomes valid
    const errorMsg = validateField(id, value);
    if (!errorMsg) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    } else {
      setErrors(prev => ({ ...prev, [id]: errorMsg }));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setGlobalError(null);
    
    // Trim accidental leading/trailing spaces for password before final validation
    const submitData = { ...formData };
    submitData.password = submitData.password.trim();

    // Validate all fields
    const newErrors = {};
    Object.keys(submitData).forEach(key => {
      const err = validateField(key, submitData[key]);
      if (err) newErrors[key] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/accounts/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: submitData.firstName,
          last_name: submitData.lastName,
          email: submitData.email,
          phone_number: submitData.phoneNumber || null,
          password: submitData.password
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
        if (data.email) {
          setErrors(prev => ({ ...prev, email: 'This email is already registered.' }));
        } else {
          setGlobalError(data.detail || 'Registration failed.');
        }
      }
    } catch (err) {
      setGlobalError('Network error. Please try again later.');
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
        <form className="space-y-4" onSubmit={handleSignup} noValidate>
          
          {globalError && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-sm">
              {globalError}
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
                error={errors.firstName}
                tabIndex={1}
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
                error={errors.lastName}
                tabIndex={2}
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
              error={errors.email}
              tabIndex={3}
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
              error={errors.phoneNumber}
              tabIndex={4}
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
              error={errors.password}
              tabIndex={5}
              required
            />
          </div>

          <Button type="submit" className="w-full mt-6" disabled={isLoading} tabIndex={6}>
            {isLoading ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-text-main/70">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-semibold text-primary hover:text-primary/80 transition-colors" tabIndex={7}>
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
