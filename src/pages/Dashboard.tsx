import React, { useEffect, useState } from 'react';
import { TaskBar } from '@/components/TaskBar';
import { FileExplorer } from '@/components/FileExplorer';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from '@/components/ui/toast';

export function Dashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/');
          return;
        }

        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          throw error;
        }
        
        if (!profiles) {
          toast.error('Perfil não encontrado');
          await supabase.auth.signOut();
          navigate('/');
          return;
        }
        
        setUsername(profiles.username);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Erro ao carregar perfil');
        await supabase.auth.signOut();
        navigate('/');
      }
    };

    getProfile();
  }, [navigate]);

  return (
    <div className="min-h-screen terminal-bg">
      <Toaster />
      <TaskBar username={username} />
      <div className="pt-12">
        <FileExplorer />
      </div>
    </div>
  );
}