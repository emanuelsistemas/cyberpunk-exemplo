/*
  # Adicionar política de inserção para profiles

  1. Alterações
    - Adiciona política para permitir inserção de novos perfis
    - Usuários autenticados podem criar seu próprio perfil

  2. Segurança
    - Garante que usuários só possam criar perfis vinculados ao seu próprio ID
*/

CREATE POLICY "Usuários podem criar seu próprio perfil"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);