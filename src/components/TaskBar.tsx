import React, { useState } from 'react';
import { Menu, User2, UserPlus, Settings, Lock } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/toast';
import { CyberLogo } from './CyberLogo';
import { UserManagement } from './UserManagement';

interface TaskBarProps {
  username: string;
}

export function TaskBar({ username }: TaskBarProps) {
  const navigate = useNavigate();
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error) {
      toast.error('Erro ao sair. Tente novamente.');
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-12 bg-black/90 border-b border-green-500/30 flex items-center px-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center space-x-2 text-green-500 hover:bg-green-500/10 p-2 rounded transition-colors">
            <CyberLogo className="w-6 h-6" />
            <span className="text-sm font-medium font-museo-moderno">nexo-drive</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setShowUserManagement(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Cadastro de Usuário
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowSettings(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1" />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center space-x-2 text-green-500 hover:bg-green-500/10 p-2 rounded transition-colors">
            <div className="relative">
              <User2 className="h-5 w-5" />
              <div className="absolute bottom-0 right-0 h-2 w-2 bg-green-500 rounded-full" />
            </div>
            <span className="text-sm font-medium">{username}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowSettings(true)}>
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500" onClick={handleLogout}>
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Dialog de Configurações */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurações</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-green-500 mb-4">
              <span className="text-sm font-medium">Configurações do Sistema</span>
            </div>
            {/* Adicione aqui as configurações do sistema */}
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowSettings(false)}
              className="px-4 py-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded transition-colors"
            >
              Fechar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Drawer de Gerenciamento de Usuários */}
      <div
        className={`fixed inset-y-0 left-0 w-96 bg-black/95 border-r border-green-500/30 transform transition-transform duration-300 ease-in-out ${
          showUserManagement ? 'translate-x-0' : '-translate-x-full'
        } z-50`}
      >
        <UserManagement onClose={() => setShowUserManagement(false)} />
      </div>
    </>
  );
}