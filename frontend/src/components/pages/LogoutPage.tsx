import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      // 1. Sign out from Supabase
      await supabase.auth.signOut();
      
      // 2. Clear any local storage if you use it (optional)
      // localStorage.clear(); 

      // 3. Redirect to Sign In page after a brief delay
      setTimeout(() => {
        navigate('/signin');
      }, 1000);
    };

    handleLogout();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white">
      <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mb-4" />
      <h2 className="text-2xl font-bold">Signing you out...</h2>
      <p className="text-gray-400 mt-2">See you next time!</p>
    </div>
  );
}