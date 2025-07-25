import { useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Adjust import to your setup

export function useUserActivity(userId: string | null) {
  useEffect(() => {
    if (!userId) {
      return;
    }
  
    const setActive = async () => {
      const { data, error } = await supabase
        .from('user_activity')
        .upsert({ user_id: userId, is_active: true, updated_at: new Date().toISOString() });
      if (error) console.error('Error setting active:', error);
      
    };
  
    const setInactive = async () => {
      const { data, error } = await supabase
        .from('user_activity')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
      if (error) console.error('Error setting inactive:', error);
    };
  
    setActive();
  
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setInactive();
      } else {
        setActive();
      }
    };
  
    const handleBeforeUnload = () => {
      setInactive();
    };
  
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
  
    return () => {
      setInactive();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userId]);
}

