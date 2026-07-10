
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
LANGUAGE sql STABLE SECURITY INVOKER
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

REVOKE EXECUTE ON FUNCTION public.match_user_memories(uuid, vector, text[], int) FROM anon;
