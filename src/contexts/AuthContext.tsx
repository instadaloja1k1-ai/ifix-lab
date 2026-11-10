import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { cpfToLoginEmail, pinToPassword } from '../lib/cpf';

export type Role = 'administrador' | 'tecnico' | 'atendente' | 'financeiro' | 'estoquista';

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: Role;
  active: boolean;
  cpf: string | null;
  commission_percent?: number;
  [key: string]: unknown;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  configError: boolean;
  passwordRecovery: boolean;
  clearPasswordRecovery: () => void;
  /** Login padrão: CPF + PIN de 4 dígitos. */
  signInWithCpf: (cpf: string, pin: string) => Promise<{ error: string | null }>;
  /** Acesso de emergência por e-mail (tela /login?email). */
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  /** Troca o PIN do próprio usuário logado. */
  changeMyPin: (pin: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      return;
    }
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data }) => setProfile((data as Profile) ?? null));
  }, [session?.user?.id]);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signInWithCpf(cpf: string, pin: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email: cpfToLoginEmail(cpf),
      password: pinToPassword(pin),
    });
    if (!error) return { error: null };
    if (error.message === 'Invalid login credentials') return { error: 'CPF ou PIN incorretos.' };
    if (error.status === 429 || /rate limit|too many/i.test(error.message))
      return { error: 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.' };
    return { error: error.message };
  }

  async function changeMyPin(pin: string) {
    const { error } = await supabase.auth.updateUser({ password: pinToPassword(pin) });
    return { error: error?.message ?? null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        configError: !isSupabaseConfigured,
        passwordRecovery,
        clearPasswordRecovery: () => setPasswordRecovery(false),
        signInWithCpf,
        signIn,
        changeMyPin,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
