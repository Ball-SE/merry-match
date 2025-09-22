import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt:', formData);
  };

  return (
    <div className="min-h-screen bg-[#FCFCFE] flex flex-col sm:flex-row">
      {/* Mobile: Image at top, Desktop: Image on left */}
      <div className="flex items-start justify-center pt-4 pb-0 px-4 sm:items-center sm:p-8 order-1 sm:order-1 mt-6 sm:mt-0 mb-9 sm:mb-0">
        <div className="relative">
          {/* Main image */}
          <div className="w-[300px] h-[300px] sm:w-[500px] sm:h-[500px]">
            <Image
              src="/assets/image3.png"
              alt="Merry Match"
              width={500}
              height={500}
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          
          {/* Decorative circles - hidden on mobile, visible on sm and up */}
          <div className="hidden sm:block absolute -top-0 -left-12 w-20 h-20 bg-[#FAF1ED] rounded-full"></div>
          <div className="hidden sm:block absolute top-25 left-7 w-2 h-2 bg-[#7B4429] rounded-full"></div>
        </div>
      </div>

      {/* Mobile: Form below image, Desktop: Form on right */}
      <div className="flex-none flex items-start justify-center pt-0 pb-4 px-4 sm:flex-1 sm:items-center sm:p-8 order-2 sm:order-2">
        <div className="w-full max-w-md">
          {/* Login header */}
          <div className="mb-8 sm:mb-8">
            <h2 className="text-[#7B4429] text-sm font-medium mb-2">LOGIN</h2>
            <h1 className="text-[#A62D82] text-3xl sm:text-5xl font-bold">Welcome back to</h1>
            <h1 className="text-[#A62D82] text-3xl sm:text-5xl font-bold">Merry Match</h1>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-6">
            {/* Username or Email field */}
            <div>
              <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Username or Email
              </label>
              <input
                type="text"
                id="usernameOrEmail"
                name="usernameOrEmail"
                value={formData.usernameOrEmail}
                onChange={handleInputChange}
                placeholder="Enter Username or Email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            {/* Login button */}
            <button
              type="submit"
              className="button-primary w-full bg-[#C70039] text-white py-3 px-4 rounded-lg font-medium"
            >
              Log in
            </button>
          </form>

          {/* Register link */}
          <div className="mt-8 sm:mt-6">
            <span className="text-gray-600">Don't have an account? </span>
            <Link href="/register" className="text-[#C70039] hover:text-[#FF1659] font-medium">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
