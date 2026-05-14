import { useState } from 'react';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(username, password);

      if (!success) {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 px-4">

      {/* Background Glow */}
      <div className="absolute w-72 h-72 bg-blue-500/20 blur-3xl rounded-full top-10 left-10"></div>
      <div className="absolute w-72 h-72 bg-cyan-400/20 blur-3xl rounded-full bottom-10 right-10"></div>

      <div className="absolute left-0 right-0 top-8 px-4 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">
          Community Health
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
          Community Health Records System
        </h1>
        <div className="mx-auto mt-2 h-1 w-28 rounded-full bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-300" />
      </div>

      <div className="relative mt-28 w-full max-w-md">

        {/* Glassmorphism Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg mb-4">
              <Lock className="text-white" size={30} />
            </div>

            <h1 className="text-3xl font-bold text-white">
              Welcome To CHR System
            </h1>

            <p className="text-gray-300 mt-2 text-sm">
              Sign in to continue to
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/40 text-red-200 text-sm p-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username */}
            <div>
              <label className="text-sm text-gray-300 mb-2 block">
                Username
              </label>

              <div className="flex items-center bg-white/10 border border-white/20 rounded-xl px-4 focus-within:border-blue-400 transition">
                <User className="text-gray-400" size={18} />

                <input
                  type="text"
                  placeholder="Enter your username"
                  className="w-full bg-transparent outline-none text-white placeholder-gray-400 px-3 py-3"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-300 mb-2 block">
                Password
              </label>

              <div className="flex items-center bg-white/10 border border-white/20 rounded-xl px-4 focus-within:border-blue-400 transition">
                <Lock className="text-gray-400" size={18} />

                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full bg-transparent outline-none text-white placeholder-gray-400 px-3 py-3"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-white transition"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input type="checkbox" className="accent-blue-500" />
                Remember me
              </label>

              <button
                type="button"
                className="text-blue-300 hover:text-white transition"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-white font-semibold py-3 rounded-xl shadow-lg disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Secure access to your dashboard
          </p>
        </div>
      </div>
    </div>
  );
}
