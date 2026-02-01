-- TABELA: profiles
-- Vinculada ao auth.users do Supabase
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  university TEXT,
  course TEXT,
  age INTEGER CHECK (age >= 16 AND age <= 99),
  bio TEXT,
  budget NUMERIC(10,2),
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'landlord')),
  preferences JSONB DEFAULT '{}',
  photos TEXT[] DEFAULT '{}',
  city_origin TEXT,
  looking_for TEXT CHECK (looking_for IN ('roommate', 'housing')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABELA: matches
-- Conexões entre usuários
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_a, user_b)
);

-- TABELA: messages
-- Mensagens entre matches
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABELA: listings
-- Anúncios de moradias
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  location TEXT,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_matches_user_a ON public.matches(user_a);
CREATE INDEX idx_matches_user_b ON public.matches(user_b);
CREATE INDEX idx_messages_match_id ON public.messages(match_id);
CREATE INDEX idx_listings_owner_id ON public.listings(owner_id);

-- Trigger para atualizar updated_at em profiles
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();
