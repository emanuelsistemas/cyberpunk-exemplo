import React, { useState, useEffect } from 'react';
import { Shield, Lock, User, UserPlus, Mail, ArrowLeft } from 'lucide-react';
import { supabase } from './lib/supabase';
import { Toaster, toast } from './components/ui/toast';
import { useNavigate } from 'react-router-dom';
import { CyberLogo } from './components/CyberLogo';

function App() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bootText, setBootText] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const fullBootText = '> INICIALIZANDO PROTOCOLO DE LOGIN SEGURO...\n> ESTABELECENDO CONEXÃO ENCRIPTADA...\n> INTERFACE NEURAL ATIVA\n> AGUARDANDO AUTENTICAÇÃO DO USUÁRIO...';

  useEffect(() => {
    let currentText = '';
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < fullBootText.length) {
        currentText += fullBootText[currentIndex];
        setBootText(currentText);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (error) {
        if (error.message === 'Invalid login credentials') {
          toast.error('E-mail ou senha incorretos');
        } else {
          toast.error('Erro ao fazer login. Tente novamente.');
        }
        return;
      }

      if (data.user) {
        // Verificar se o perfil existe
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        if (!profile) {
          toast.error('Perfil não encontrado. Por favor, cadastre-se.');
          await supabase.auth.signOut();
          return;
        }

        toast.success('Login realizado com sucesso!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Erro ao fazer login. Tente novamente.');
      await supabase.auth.signOut();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === import.meta.env.VITE_ADMIN_PASSWORD) {
      setShowAdminModal(false);
      setAdminPassword('');
      setShowRegistration(true);
    } else {
      toast.error('Senha administrativa incorreta');
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (registrationData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    if (registrationData.password !== registrationData.confirmPassword) {
      toast.error('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    try {
      // Verificar se o usuário já existe
      const { data: existingUser, error: existingUserError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', registrationData.username.trim())
        .maybeSingle();

      if (existingUserError) throw existingUserError;

      if (existingUser) {
        toast.error('Nome de usuário já está em uso');
        setIsLoading(false);
        return;
      }

      // 1. Registrar o usuário no auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registrationData.email.trim(),
        password: registrationData.password
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          toast.error('Este e-mail já está cadastrado');
        } else {
          toast.error(
            authError.message === 'Password should be at least 6 characters.'
              ? 'A senha deve ter pelo menos 6 caracteres'
              : 'Erro ao criar conta. Verifique os dados e tente novamente.'
          );
        }
        return;
      }

      if (authData.user) {
        // 2. Criar o perfil do usuário
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              username: registrationData.username.trim(),
              profile_type: 'admin' // Definindo o tipo de perfil como admin por padrão
            }
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          toast.error('Erro ao criar perfil do usuário. Tente novamente.');
          return;
        }

        // Sucesso no cadastro
        setRegistrationData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
        setShowRegistration(false);
        toast.success('Usuário cadastrado com sucesso!');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Erro ao criar conta. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowRegistration(false);
    setRegistrationData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  if (showRegistration) {
    return (
      <div className="min-h-screen terminal-bg text-green-500 flex items-center justify-center p-4">
        <Toaster />
        <div className="w-full max-w-md bg-black/90 p-8 border border-green-500/30 rounded-lg shadow-lg shadow-green-500/20">
          <div className="flex items-center mb-6">
            <button
              onClick={handleBackToLogin}
              className="text-green-500 hover:text-green-400 transition-colors"
              disabled={isLoading}
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold ml-4">CADASTRO DE NOVO USUÁRIO</h2>
          </div>

          <form onSubmit={handleRegistrationSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-green-500/50" />
              </div>
              <input
                type="text"
                value={registrationData.username}
                onChange={(e) => setRegistrationData({...registrationData, username: e.target.value})}
                className="w-full pl-10 pr-4 py-2 bg-black border border-green-500/30 rounded text-green-500 placeholder-green-500/50 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                placeholder="NOME DE USUÁRIO"
                required
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-green-500/50" />
              </div>
              <input
                type="email"
                value={registrationData.email}
                onChange={(e) => setRegistrationData({...registrationData, email: e.target.value})}
                className="w-full pl-10 pr-4 py-2 bg-black border border-green-500/30 rounded text-green-500 placeholder-green-500/50 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                placeholder="E-MAIL"
                required
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-green-500/50" />
              </div>
              <input
                type="password"
                value={registrationData.password}
                onChange={(e) => setRegistrationData({...registrationData, password: e.target.value})}
                className="w-full pl-10 pr-4 py-2 bg-black border border-green-500/30 rounded text-green-500 placeholder-green-500/50 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                placeholder="SENHA (MÍNIMO 6 CARACTERES)"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-green-500/50" />
              </div>
              <input
                type="password"
                value={registrationData.confirmPassword}
                onChange={(e) => setRegistrationData({...registrationData, confirmPassword: e.target.value})}
                className="w-full pl-10 pr-4 py-2 bg-black border border-green-500/30 rounded text-green-500 placeholder-green-500/50 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                placeholder="CONFIRMAR SENHA"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-green-500/10 border border-green-500/30 rounded text-green-500 hover:bg-green-500/20 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200 flex items-center justify-center space-x-2"
              disabled={isLoading}
            >
              <UserPlus className="w-5 h-5" />
              <span>{isLoading ? 'CADASTRANDO...' : 'CADASTRAR USUÁRIO'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen terminal-bg text-green-500 flex items-center justify-center p-4">
      <Toaster />
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black/90 p-8 border border-green-500/30 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-center">Acesso Administrativo</h2>
            <form onSubmit={handleAdminAccess}>
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-green-500/50" />
                </div>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black border border-green-500/30 rounded text-green-500 placeholder-green-500/50 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  placeholder="SENHA ADMINISTRATIVA"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-green-500/10 border border-green-500/30 rounded text-green-500 hover:bg-green-500/20 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200"
                >
                  CONFIRMAR
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminModal(false);
                    setAdminPassword('');
                  }}
                  className="flex-1 py-2 px-4 bg-red-500/10 border border-red-500/30 rounded text-red-500 hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-200"
                >
                  CANCELAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-black/90 p-8 border border-green-500/30 rounded-lg shadow-lg shadow-green-500/20">
        <div className="flex flex-col items-center justify-center mb-8">
          <CyberLogo className="w-24 h-24" />
          <h1 className="font-museo-moderno text-2xl mt-2">nexo-drive</h1>
        </div>
        
        <div className="mb-8 font-mono text-sm">
          <pre className="whitespace-pre-line">{bootText}</pre>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-green-500/50" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black border border-green-500/30 rounded text-green-500 placeholder-green-500/50 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              placeholder="DIGITE SEU E-MAIL"
              required
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-green-500/50" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black border border-green-500/30 rounded text-green-500 placeholder-green-500/50 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              placeholder="DIGITE SUA SENHA"
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-green-500/10 border border-green-500/30 rounded text-green-500 hover:bg-green-500/20 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200 flex items-center justify-center space-x-2"
              disabled={isLoading}
            >
              <Shield className="w-5 h-5" />
              <span>{isLoading ? 'AUTENTICANDO...' : 'ENTRAR'}</span>
            </button>
            
            <button
              type="button"
              onClick={() => setShowAdminModal(true)}
              className="flex-1 py-2 px-4 bg-green-500/10 border border-green-500/30 rounded text-green-500 hover:bg-green-500/20 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200 flex items-center justify-center space-x-2"
              disabled={isLoading}
            >
              <UserPlus className="w-5 h-5" />
              <span>CADASTRAR</span>
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-green-500/50 text-sm">
          <p className="terminal-cursor">STATUS DO SISTEMA: SEGURO</p>
        </div>
      </div>
    </div>
  );
}

export default App;