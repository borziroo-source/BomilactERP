import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.message || 'Sikertelen bejelentkezés. Ellenőrizd az adatokat.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-xl shadow-blue-900/50">
            <span className="text-white font-bold text-2xl">B</span>
          </div>
          <h1 className="text-3xl font-bold text-white">
            Bomilact<span className="text-blue-400 font-light">ERP</span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Tejipari Vállalatkirányítás</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
            <h2 className="text-white font-bold text-lg flex items-center">
              <LogIn size={20} className="mr-2" />
              Bejelentkezés
            </h2>
            <p className="text-blue-100 text-sm mt-0.5">Adja meg belépési adatait</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email cím
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pelda@bomilact.hu"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Jelszó
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-11 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Bejelentkezés...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Bejelentkezés
                </>
              )}
            </button>
          </form>

          <div className="px-6 pb-5">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-xs text-slate-500 font-medium mb-1">Alapértelmezett admin fiók:</p>
              <p className="text-xs text-slate-600">📧 admin@bomilact.hu</p>
              <p className="text-xs text-slate-600">🔑 Admin@123!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
