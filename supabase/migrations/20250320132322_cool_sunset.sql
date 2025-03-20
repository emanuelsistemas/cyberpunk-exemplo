/*
  # Adicionar tipo de perfil

  1. Alterações
    - Adiciona coluna `profile_type` na tabela `profiles`
    - Define valores padrão: 'admin' e 'user'
    - Define 'admin' como valor padrão para novos registros
*/

-- Criar tipo enum para perfis
CREATE TYPE profile_type AS ENUM ('admin', 'user');

-- Adicionar coluna profile_type
ALTER TABLE profiles 
ADD COLUMN profile_type profile_type NOT NULL DEFAULT 'admin';