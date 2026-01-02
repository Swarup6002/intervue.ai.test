import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!isSupabaseConfigured()) {
      setError("Supabase is not configured. Please add PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY to your .env file and restart the server.");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.session) {
        navigate('/');
        window.location.href = '/interview';
      } else {
        setSuccess('Account created successfully! Please check your email to verify your account.');
        // We don't redirect immediately so the user can see the message
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/20 to-secondary/20 dark:from-background dark:via-primary dark:to-secondary text-gray-900 dark:text-white flex items-center justify-center p-8 relative transition-colors duration-300">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-md"
      >
        {/* Glassmorphic Card */}
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/60 rounded-lg flex items-center justify-center shadow-lg shadow-accent/20">
              <span className="text-background font-heading font-bold text-2xl">AI</span>
            </div>
            <span className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
              Intervue.ai
            </span>
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Create Account
            </h1>
            <p className="font-paragraph text-base text-gray-600 dark:text-white/70">
              Start your journey to interview success
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-lg">
                {success}
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="font-paragraph text-sm font-medium text-gray-700 dark:text-white">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/50" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  // CHANGED: text-black added
                  className="pl-12 bg-secondary/10 border-transparent dark:border-white/10 text-black placeholder:text-gray-500 dark:placeholder:text-white/40 focus:border-accent/50 focus:ring-accent/20 rounded-lg h-12"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-paragraph text-sm font-medium text-gray-700 dark:text-white">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/50" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  // CHANGED: text-black added
                  className="pl-12 bg-secondary/10 border-transparent dark:border-white/10 text-black placeholder:text-gray-500 dark:placeholder:text-white/40 focus:border-accent/50 focus:ring-accent/20 rounded-lg h-12"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="font-paragraph text-sm font-medium text-gray-700 dark:text-white">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/50" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  // CHANGED: text-black added
                  className="pl-12 bg-secondary/10 border-transparent dark:border-white/10 text-black placeholder:text-gray-500 dark:placeholder:text-white/40 focus:border-accent/50 focus:ring-accent/20 rounded-lg h-12"
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-paragraph text-sm font-medium text-gray-700 dark:text-white">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/50" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  // CHANGED: text-black added
                  className="pl-12 bg-secondary/10 border-transparent dark:border-white/10 text-black placeholder:text-gray-500 dark:placeholder:text-white/40 focus:border-accent/50 focus:ring-accent/20 rounded-lg h-12"
                />
              </div>
            </div>

            {/* Terms */}
            <p className="font-paragraph text-xs text-gray-500 dark:text-white/50">
              By signing up, you agree to our{' '}
              <a href="#" className="text-accent hover:text-accent/80 transition-colors">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-accent hover:text-accent/80 transition-colors">
                Privacy Policy
              </a>
            </p>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent text-background hover:bg-accent/90 font-semibold h-12 rounded-lg shadow-lg shadow-accent/20 transition-all duration-300 hover:shadow-xl hover:shadow-accent/30 hover:scale-105"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="w-5 h-5 ml-2" /></>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-full font-paragraph text-gray-500 dark:text-white/50">
                or continue with
              </span>
            </div>
          </div>

          {/* Sign In Link */}
          <p className="mt-8 text-center font-paragraph text-sm text-gray-600 dark:text-white/70">
            Already have an account?{' '}
            <Link
              to="/signin"
              className="text-accent hover:text-accent/80 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="font-paragraph text-sm text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}