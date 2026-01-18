import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays } from 'date-fns';

export const useStudyStreak = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const updateStreak = async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const { data: streak, error: fetchError } = await supabase
        .from('study_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') return;

      if (!streak) {
        await supabase.from('study_streaks').insert({
          user_id: user.id,
          current_streak: 1,
          longest_streak: 1,
          last_study_date: today,
        });
        return;
      }

      if (streak.last_study_date === today) return;

      const daysDiff = differenceInDays(new Date(today), new Date(streak.last_study_date));
      
      let newStreak = daysDiff === 1 ? streak.current_streak + 1 : 1;
      let newLongest = Math.max(newStreak, streak.longest_streak);

      await supabase
        .from('study_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_study_date: today,
          updated_at: new Date(),
        })
        .eq('user_id', user.id);
    };

    updateStreak();
  }, [user]);
};
