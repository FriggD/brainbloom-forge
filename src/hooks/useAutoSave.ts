import { useEffect, useRef, useState, useCallback } from 'react';

interface UseAutoSaveOptions {
  delay?: number;
  onSave: () => void | Promise<void>;
  enabled?: boolean;
}

export const useAutoSave = (data: any, options: UseAutoSaveOptions) => {
  const { delay = 2000, onSave, enabled = true } = options;
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const previousDataRef = useRef<string>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const onSaveRef = useRef(onSave);

  // Update ref when onSave changes
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    if (!enabled) {
      console.log('[AutoSave] Disabled');
      return;
    }

    const currentData = JSON.stringify(data);
    
    // Skip if data hasn't changed
    if (previousDataRef.current === currentData) {
      console.log('[AutoSave] Data unchanged, skipping');
      return;
    }
    
    // Skip first render (no previous data)
    if (previousDataRef.current === undefined) {
      console.log('[AutoSave] First render, initializing');
      previousDataRef.current = currentData;
      return;
    }
    
    console.log('[AutoSave] Data changed, scheduling save in', delay, 'ms');
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      console.log('[AutoSave] Saving...');
      setIsSaving(true);
      try {
        await onSaveRef.current();
        previousDataRef.current = currentData;
        setLastSaved(new Date());
        console.log('[AutoSave] Saved successfully');
      } catch (error) {
        console.error('[AutoSave] Save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled]);

  return { isSaving, lastSaved };
};
