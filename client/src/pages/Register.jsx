import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [validationError, setValidationError] = useState('');
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }

    const { confirmPassword, ...registrationData } = formData;
    const result = await register(registrationData);
    
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#efeff2] dark:bg-slate-900 pt-32 pb-16">
      <div className="max-w-md mx-auto px-4">
        <div className="neu-flat p-8">
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-8 text-center">
            Register
          </h1>
          
          {(error || validationError) && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">
                {validationError || error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full neu-pressed px-4 py-3 text-slate-700 dark:text-white bg-[#efeff2] dark:bg-black/30 placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:border dark:border-white/10"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full neu-pressed px-4 py-3 text-slate-700 dark:text-white bg-[#efeff2] dark:bg-black/30 placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:border dark:border-white/10"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full neu-pressed px-4 py-3 text-slate-700 dark:text-white bg-[#efeff2] dark:bg-black/30 placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:border dark:border-white/10"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full neu-pressed px-4 py-3 text-slate-700 dark:text-white bg-[#efeff2] dark:bg-black/30 placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:border dark:border-white/10"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full neu-pressed px-4 py-3 text-slate-700 dark:text-white bg-[#efeff2] dark:bg-black/30 placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:border dark:border-white/10"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full neu-pressed px-4 py-3 text-slate-700 dark:text-white bg-[#efeff2] dark:bg-black/30 placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:border dark:border-white/10"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary text-white font-bold px-8 py-4 shadow-[6px_6px_12px_#d1d1d6,-6px_-6px_12px_#ffffff] hover:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] dark:bg-gradient-to-r dark:from-primary dark:to-red-600 dark:shadow-[0_0_20px_rgba(215,25,32,0.4)] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 dark:text-gray-300">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-primary hover:underline font-medium"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;