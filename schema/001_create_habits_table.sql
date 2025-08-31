-- Create habits table with Islamic principles integration
CREATE TABLE IF NOT EXISTS habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  quote TEXT,
  description TEXT,
  streak INTEGER DEFAULT 0,
  completed JSONB DEFAULT '[]'::jsonb, -- Array of completion records
  related_days INTEGER[] DEFAULT '{0,1,2,3,4,5,6}', -- Days of week (0-6)
  related_salat TEXT[] DEFAULT '{}', -- Prayer times array
  priority TEXT DEFAULT 'عادي',
  priority_color TEXT DEFAULT '#22C55E',
  category JSONB DEFAULT '{"text": "عام", "hexColor": "#8B5CF6"}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);

-- Create index for related_salat for prayer-based filtering
CREATE INDEX IF NOT EXISTS idx_habits_related_salat ON habits USING GIN(related_salat);

-- Create index for related_days for day-based filtering
CREATE INDEX IF NOT EXISTS idx_habits_related_days ON habits USING GIN(related_days);

-- Enable Row Level Security (RLS)
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: users can only see their own habits
CREATE POLICY "Users can view their own habits" ON habits
  FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policy: users can insert their own habits
CREATE POLICY "Users can insert their own habits" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policy: users can update their own habits
CREATE POLICY "Users can update their own habits" ON habits
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policy: users can delete their own habits
CREATE POLICY "Users can delete their own habits" ON habits
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_habits_updated_at 
  BEFORE UPDATE ON habits 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
