-- RLS Policies para Supabase
-- Execute este script APÓS o schema.sql

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- PROFILES: Usuários podem ver todos os perfis, mas só editar o próprio
CREATE POLICY "Profiles visíveis para todos os autenticados"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuário pode editar próprio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuário pode inserir próprio perfil"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- MATCHES: Usuário pode ver matches que participa
CREATE POLICY "Ver próprios matches"
  ON public.matches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "Criar match"
  ON public.matches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_a);

CREATE POLICY "Atualizar match se participante"
  ON public.matches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_a OR auth.uid() = user_b);

-- MESSAGES: Usuário pode ver mensagens de seus matches
CREATE POLICY "Ver mensagens de matches próprios"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    match_id IN (
      SELECT id FROM public.matches
      WHERE user_a = auth.uid() OR user_b = auth.uid()
    )
  );

CREATE POLICY "Enviar mensagem em match próprio"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    match_id IN (
      SELECT id FROM public.matches
      WHERE (user_a = auth.uid() OR user_b = auth.uid())
      AND status = 'accepted'
    )
  );

-- LISTINGS: Todos podem ver, só dono pode editar
CREATE POLICY "Listings visíveis para autenticados"
  ON public.listings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Criar listing"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Editar próprio listing"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Deletar próprio listing"
  ON public.listings FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Trigger para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
