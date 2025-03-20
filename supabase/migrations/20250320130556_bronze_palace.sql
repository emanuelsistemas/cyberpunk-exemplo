/*
  # Criar tabela de perfis de usuário
  
  1. Nova Tabela
    - `profiles`
      - `id` (uuid, chave primária, referencia auth.users)
      - `username` (texto, único)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Segurança
    - Habilitar RLS na tabela `profiles`
    - Adicionar política para usuários autenticados lerem seus próprios dados
    - Adicionar política para usuários autenticados atualizarem seus próprios dados
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para leitura
CREATE POLICY "Usuários podem ler seu próprio perfil"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Política para atualização
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Trigger para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE
  ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();