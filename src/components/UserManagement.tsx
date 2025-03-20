import React, { useState, useEffect } from 'react';
import { X, UserPlus, User2, ChevronLeft, Pencil, Trash2, MoreVertical, Lock, Shield, Folder, File } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from './ui/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Switch } from './ui/switch';

interface UserManagementProps {
  onClose: () => void;
}

interface User {
  id: string;
  username: string;
  profile_type: 'admin' | 'user';
  created_at?: string;
  updated_at?: string;
}

interface FileSystemItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileSystemItem[];
  hasAccess?: boolean;
}

type View = 'list' | 'create' | 'edit';
type EditTab = 'usuario' | 'senha' | 'acesso';

export function UserManagement({ onClose }: UserManagementProps) {
  const [view, setView] = useState<View>('list');
  const [editTab, setEditTab] = useState<EditTab>('usuario');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>([]);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    profile_type: 'user' as 'admin' | 'user'
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUsers();
    setFileSystem([
      {
        id: '1',
        name: 'Documentos',
        type: 'folder',
        path: '/documentos',
        hasAccess: true,
        children: [
          {
            id: '1-1',
            name: 'Contratos',
            type: 'folder',
            path: '/documentos/contratos',
            hasAccess: true,
            children: [
              {
                id: '1-1-1',
                name: 'contrato.pdf',
                type: 'file',
                path: '/documentos/contratos/contrato.pdf',
                hasAccess: true
              }
            ]
          }
        ]
      },
      {
        id: '2',
        name: 'Imagens',
        type: 'folder',
        path: '/imagens',
        hasAccess: false,
        children: [
          {
            id: '2-1',
            name: 'foto.jpg',
            type: 'file',
            path: '/imagens/foto.jpg',
            hasAccess: false
          }
        ]
      }
    ]);
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, profile_type, created_at, updated_at');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email || !newUser.password || !newUser.confirmPassword) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    if (newUser.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setIsLoading(true);

    try {
      const { data: existingUser, error: existingUserError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', newUser.username.trim())
        .maybeSingle();

      if (existingUserError) throw existingUserError;

      if (existingUser) {
        toast.error('Nome de usuário já está em uso');
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email.trim(),
        password: newUser.password
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          toast.error('Este e-mail já está cadastrado');
        } else {
          toast.error('Erro ao criar conta. Verifique os dados e tente novamente.');
        }
        return;
      }

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              username: newUser.username.trim(),
              profile_type: newUser.profile_type
            }
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          toast.error('Erro ao criar perfil do usuário');
          return;
        }

        toast.success('Usuário criado com sucesso!');
        setNewUser({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          profile_type: 'user'
        });
        setView('list');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Erro ao criar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: newUser.username.trim(),
          profile_type: newUser.profile_type
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast.success('Usuário atualizado com sucesso!');
      setView('list');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Erro ao atualizar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast.success('Usuário excluído com sucesso!');
      setShowDeleteConfirm(false);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erro ao excluir usuário');
    } finally {
      setIsLoading(false);
      setSelectedUser(null);
    }
  };

  const startEdit = (user: User) => {
    setSelectedUser(user);
    setNewUser({
      username: user.username,
      email: '',
      password: '',
      confirmPassword: '',
      profile_type: user.profile_type
    });
    setView('edit');
  };

  const startDelete = (user: User) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (passwordForm.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      toast.success('Senha atualizada com sucesso!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Erro ao atualizar senha');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccessToggle = (itemId: string, hasAccess: boolean) => {
    setFileSystem(prev => {
      const updateAccess = (items: FileSystemItem[]): FileSystemItem[] => {
        return items.map(item => {
          if (item.id === itemId) {
            return { ...item, hasAccess };
          }
          if (item.children) {
            return { ...item, children: updateAccess(item.children) };
          }
          return item;
        });
      };
      return updateAccess(prev);
    });
  };

  const renderFileSystem = (items: FileSystemItem[], level = 0) => {
    return items.map(item => (
      <div key={item.id} style={{ marginLeft: `${level * 20}px` }}>
        <div className="flex items-center justify-between p-2 rounded hover:bg-green-500/10">
          <div className="flex items-center space-x-2">
            {item.type === 'folder' ? (
              <Folder className="h-4 w-4 text-green-500" />
            ) : (
              <File className="h-4 w-4 text-green-500" />
            )}
            <span className="text-green-500">{item.name}</span>
          </div>
          <Switch
            checked={item.hasAccess}
            onCheckedChange={(checked) => handleAccessToggle(item.id, checked)}
          />
        </div>
        {item.children && renderFileSystem(item.children, level + 1)}
      </div>
    ));
  };

  const UserForm = ({ onSubmit, submitText }: { onSubmit: (e: React.FormEvent) => Promise<void>, submitText: string }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-green-500">Nome de Usuário</label>
        <input
          type="text"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          className="w-full p-2 bg-black border border-green-500/30 rounded text-green-500 focus:outline-none focus:border-green-500"
          disabled={isLoading}
        />
      </div>

      {view === 'create' && (
        <>
          <div className="space-y-2">
            <label className="text-sm text-green-500">E-mail</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full p-2 bg-black border border-green-500/30 rounded text-green-500 focus:outline-none focus:border-green-500"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-green-500">Senha</label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="w-full p-2 bg-black border border-green-500/30 rounded text-green-500 focus:outline-none focus:border-green-500"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-green-500">Confirmar Senha</label>
            <input
              type="password"
              value={newUser.confirmPassword}
              onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
              className="w-full p-2 bg-black border border-green-500/30 rounded text-green-500 focus:outline-none focus:border-green-500"
              disabled={isLoading}
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <label className="text-sm text-green-500">Tipo de Perfil</label>
        <select
          value={newUser.profile_type}
          onChange={(e) => setNewUser({ ...newUser, profile_type: e.target.value as 'admin' | 'user' })}
          className="w-full p-2 bg-black border border-green-500/30 rounded text-green-500 focus:outline-none focus:border-green-500"
          disabled={isLoading}
        >
          <option value="user">Usuário</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full py-2 bg-green-500/10 text-green-500 rounded hover:bg-green-500/20 transition-colors flex items-center justify-center space-x-2"
        disabled={isLoading}
      >
        <UserPlus className="h-5 w-5" />
        <span>{isLoading ? 'Processando...' : submitText}</span>
      </button>
    </form>
  );

  const EditForm = () => {
    if (!selectedUser) return null;

    return (
      <div className="flex-1 p-4">
        <Tabs value={editTab} onValueChange={(value) => setEditTab(value as EditTab)}>
          <TabsList className="w-full">
            <TabsTrigger value="usuario" className="flex-1">Usuário</TabsTrigger>
            <TabsTrigger value="senha" className="flex-1">Senha</TabsTrigger>
            <TabsTrigger value="acesso" className="flex-1">Acesso</TabsTrigger>
          </TabsList>

          <TabsContent value="usuario">
            <UserForm
              onSubmit={handleEditUser}
              submitText="Salvar Alterações"
            />
          </TabsContent>

          <TabsContent value="senha">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-green-500">Senha Atual</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full p-2 bg-black border border-green-500/30 rounded text-green-500 focus:outline-none focus:border-green-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-green-500">Nova Senha</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full p-2 bg-black border border-green-500/30 rounded text-green-500 focus:outline-none focus:border-green-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-green-500">Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full p-2 bg-black border border-green-500/30 rounded text-green-500 focus:outline-none focus:border-green-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-green-500/10 text-green-500 rounded hover:bg-green-500/20 transition-colors flex items-center justify-center space-x-2"
                disabled={isLoading}
              >
                <Lock className="h-5 w-5" />
                <span>{isLoading ? 'Alterando...' : 'Alterar Senha'}</span>
              </button>
            </form>
          </TabsContent>

          <TabsContent value="acesso">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-green-500 font-medium">Permissões de Acesso</h3>
                <div className="flex items-center space-x-2 text-green-500/50">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs">Controle de Acesso</span>
                </div>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {renderFileSystem(fileSystem)}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-green-500/30">
        <div className="flex items-center space-x-2">
          {(view === 'create' || view === 'edit') && (
            <button
              onClick={() => {
                setView('list');
                setSelectedUser(null);
                setEditTab('usuario');
              }}
              className="text-green-500 hover:bg-green-500/10 p-2 rounded transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <h2 className="text-green-500 text-lg font-medium">
            {view === 'list' ? 'Usuários' : view === 'edit' ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-green-500 hover:bg-green-500/10 p-2 rounded transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {view === 'list' ? (
        <div className="flex-1 p-4">
          <button
            onClick={() => setView('create')}
            className="w-full flex items-center justify-center space-x-2 p-3 mb-4 bg-green-500/10 text-green-500 rounded hover:bg-green-500/20 transition-colors"
          >
            <UserPlus className="h-5 w-5" />
            <span>Novo Usuário</span>
          </button>

          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded bg-green-500/5 hover:bg-green-500/10 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <User2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-green-500">{user.username}</p>
                    <p className="text-green-500/50 text-sm">{user.profile_type}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-5 w-5 text-green-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => startEdit(user)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => startDelete(user)} className="text-red-500">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>
      ) : view === 'edit' ? (
        <EditForm />
      ) : (
        <div className="flex-1 p-4">
          <UserForm
            onSubmit={handleCreateUser}
            submitText="Criar Usuário"
          />
        </div>
      )}

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-green-500">
              Tem certeza que deseja excluir o usuário "{selectedUser?.username}"?
              Esta ação não pode ser desfeita.
            </p>
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 text-green-500 hover:bg-green-500/10 rounded transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteUser}
              className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded transition-colors ml-2"
              disabled={isLoading}
            >
              {isLoading ? 'Excluindo...' : 'Excluir'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}