
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.user_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_slug text NOT NULL,
  kind text NOT NULL DEFAULT 'note',
  content text NOT NULL,
  embedding vector(1536),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_memories TO authenticated;
GRANT ALL ON public.user_memories TO service_role;

ALTER TABLE public.user_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own memories"
  ON public.user_memories FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS user_memories_user_app_idx
  ON public.user_memories (user_id, app_slug, created_at DESC);

CREATE INDEX IF NOT EXISTS user_memories_embedding_idx
  ON public.user_memories USING hnsw (embedding vector_cosine_ops);

CREATE OR REPLACE FUNCTION public.match_user_memories(
  _user_id uuid,
  _query_embedding vector(1536),
  _app_slugs text[] DEFAULT NULL,
  _match_count int DEFAULT 6
)
RETURNS TABLE (
  id uuid,
  app_slug text,
  kind text,
  content text,
  metadata jsonb,
  similarity float,
  created_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.id, m.app_slug, m.kind, m.content, m.metadata,
         1 - (m.embedding <=> _query_embedding) AS similarity,
         m.created_at
  FROM public.user_memories m
  WHERE m.user_id = _user_id
    AND m.embedding IS NOT NULL
    AND (_app_slugs IS NULL OR m.app_slug = ANY(_app_slugs))
  ORDER BY m.embedding <=> _query_embedding
  LIMIT _match_count;
$$;
