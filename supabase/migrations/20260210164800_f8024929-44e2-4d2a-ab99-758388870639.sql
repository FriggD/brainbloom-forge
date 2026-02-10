
CREATE TABLE public.schedule_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject TEXT NOT NULL,
  room TEXT,
  teacher TEXT,
  color TEXT DEFAULT '#6699cc',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.schedule_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own classes" ON public.schedule_classes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own classes" ON public.schedule_classes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own classes" ON public.schedule_classes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own classes" ON public.schedule_classes FOR DELETE USING (auth.uid() = user_id);
