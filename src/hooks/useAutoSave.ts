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
  const isMountedRef = useRef(true);
  const pendingSaveRef = useRef<string | null>(null);

  // Update ref when onSave changes
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const executeSave = useCallback(async (dataToSave: string) => {
    if (!isMountedRef.current) return;
    
    setIsSaving(true);
    try {
      await onSaveRef.current();
      if (isMountedRef.current) {
        previousDataRef.current = dataToSave;
        setLastSaved(new Date());
        pendingSaveRef.current = null;
      }
    } catch (error) {
      console.error('[AutoSave] Save failed:', error);
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const currentData = JSON.stringify(data);
    
    // Skip if data hasn't changed
    if (previousDataRef.current === currentData) {
      return;
    }
    
    // Initialize on first render
    if (previousDataRef.current === undefined) {
      previousDataRef.current = currentData;
      return;
    }
    
    // Store pending save data
    pendingSaveRef.current = currentData;
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      if (pendingSaveRef.current) {
        executeSave(pendingSaveRef.current);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, executeSave]);

  // Force save on unmount if there's pending data
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Execute pending save synchronously on unmount
      if (pendingSaveRef.current && pendingSaveRef.current !== previousDataRef.current) {
        onSaveRef.current();
      }
    };
  }, []);

  return { isSaving, lastSaved };
};
