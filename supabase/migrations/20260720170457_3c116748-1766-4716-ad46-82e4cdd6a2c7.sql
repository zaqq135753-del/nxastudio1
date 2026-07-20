-- Create feed_comments table
CREATE TABLE IF NOT EXISTS public.feed_comments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id uuid REFERENCES public.feed_posts(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Grant access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feed_comments TO authenticated;
GRANT ALL ON public.feed_comments TO service_role;

-- Enable RLS
ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone authenticated can view comments" ON public.feed_comments
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own comments" ON public.feed_comments
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.feed_comments
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.feed_comments
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_feed_comments_post_id ON public.feed_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_feed_comments_user_id ON public.feed_comments(user_id);
