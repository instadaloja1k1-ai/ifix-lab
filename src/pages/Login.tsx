import { useState, type FormEvent } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { WrenchIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCpf, isValidCpf, isValidPin, onlyDigits } from '../lib/cpf';
import { PinInput } from '../components/ui/PinInput';

const inputClass =
  'w-full rounded-lg bg-base-850 border border-base-700 px-3 py-2 text-sm text-base-100 outline-none focus:border-accent-500 transition-colors';
const buttonClass =
  'w-full rounded-lg bg-accent-500 text-base-950 font-medium py-2 text-sm hover:bg-accent-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

export function LoginPage() {
  const { session, configError } = useAuth();
  const [params] = useSearchParams();
  // Acesso de emergência por e-mail: /login?email (não aparece para a equipe).
  const emailMode = params.has('email');

  if (session) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent-500/10 border border-accent-500/30 flex items-center justify-center mb-3">
            <WrenchIcon className="w-6 h-6 text-accent-400" />
          </div>
          <h1 className="text-xl font-semibold text-base-100">iFix Lab</h1>
          <p className="text-sm text-base-400 mt-1">Sistema de gestão do laboratório</p>
        </div>
        {configError && (
          <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            Supabase ainda não configurado. Preencha{' '}
            <code className="font-mono">VITE_SUPABASE_URL</code> e{' '}
            <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> no arquivo{' '}
            <code className="font-mono">.env</code> para habilitar o login.
          </div>
        )}
        {emailMode ? <EmailLoginForm /> : <CpfLoginForm />}
      </div>
    </div>
  );
}

function CpfLoginForm() {
  const { signInWithCpf, configError } = useAuth();
  const [cpf, setCpf] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isValidCpf(cpf)) {
      setError('CPF inválido. Confira os números.');
      return;
    }
    if (!isValidPin(pin)) {
      setError('O PIN tem 4 números.');
      return;
    }
    setLoading(true);
    const { error } = await signInWithCpf(cpf, pin);
    setLoading(false);
    if (error) {
      setError(error);
      setPin('');
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-base-900 border border-base-800 rounded-xl p-6"
      >
        <div>
          <label className="block text-xs font-medium text-base-400 mb-1.5" htmlFor="cpf">
            CPF
          </label>
          <input
            id="cpf"
            type="text"
            inputMode="numeric"
            autoComplete="username"
            autoFocus
            required
            value={formatCpf(cpf)}
            onChange={(e) => setCpf(onlyDigits(e.target.value).slice(0, 11))}
            className={inputClass + ' tracking-wide'}
            placeholder="000.000.000-00"
          />
        </div>
        <div>
          <span className="block text-xs font-medium text-base-400 mb-1.5">PIN</span>
          <PinInput value={pin} onChange={setPin} />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button type="submit" disabled={loading || configError} className={buttonClass}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
      <p className="text-center text-xs text-base-500 mt-6">
        Esqueceu o PIN ou ainda não tem acesso? Fale com o administrador do laboratório.
      </p>
    </>
  );
}

function EmailLoginForm() {
  const { signIn, configError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error)
      setError(error === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : error);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-base-900 border border-base-800 rounded-xl p-6"
    >
      <p className="text-xs text-base-400">
        Acesso de emergência por e-mail. Use apenas se ainda não tiver CPF e PIN cadastrados.
      </p>
      <div>
        <label className="block text-xs font-medium text-base-400 mb-1.5">E-mail</label>
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="voce@ifixlab.com"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-base-400 mb-1.5">Senha</label>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          placeholder="••••••••"
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button type="submit" disabled={loading || configError} className={buttonClass}>
        {loading ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
