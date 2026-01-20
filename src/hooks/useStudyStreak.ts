import { useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';

export const useStudyStreak = () => {
  useEffect(() => {
    const updateStreak = () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const saved = localStorage.getItem('studyStreak');
      
      let streakData = saved ? JSON.parse(saved) : {
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: null,
      };

      if (streakData.lastStudyDate === today) return;

      if (streakData.lastStudyDate) {
        const daysDiff = differenceInDays(new Date(today), new Date(streakData.lastStudyDate));
        
        if (daysDiff === 1) {
          streakData.currentStreak += 1;
        } else if (daysDiff > 1) {
          streakData.currentStreak = 1;
        }
      } else {
        streakData.currentStreak = 1;
      }

      streakData.longestStreak = Math.max(streakData.currentStreak, streakData.longestStreak);
      streakData.lastStudyDate = today;

      localStorage.setItem('studyStreak', JSON.stringify(streakData));
    };

    updateStreak();
  }, []);
};
