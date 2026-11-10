// @ts-nocheck
import { useState } from 'react';
import { KeyRoundIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function ResetPasswordPage() {
  let { clearPasswordRecovery: e, signOut: t } = useAuth(),
    [n, r] = useState(``),
    [i, a] = useState(``),
    [o, s] = useState(null),
    [c, l] = useState(false),
    [u, d] = useState(false);
  async function f(e) {
    if ((e.preventDefault(), s(null), n.length < 6)) {
      s(`A senha precisa ter pelo menos 6 caracteres.`);
      return;
    }
    if (n !== i) {
      s(`As senhas não coincidem.`);
      return;
    }
    l(true);
    let { error: t } = await supabase.auth.updateUser({
      password: n,
    });
    (l(false), t ? s(t.message) : d(true));
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent-500/10 border border-accent-500/30 flex items-center justify-center mb-3">
            <KeyRoundIcon className="w-6 h-6 text-accent-400" />
          </div>
          <h1 className="text-xl font-semibold text-base-100">Definir nova senha</h1>
          <p className="text-sm text-base-400 mt-1 text-center">
            {u
              ? `Senha atualizada com sucesso.`
              : `Você chegou aqui pelo link de recuperação de senha enviado por e-mail.`}
          </p>
        </div>
        {u ? (
          <div className="space-y-4 bg-base-900 border border-base-800 rounded-xl p-6">
            <p className="text-sm text-base-300">
              Sua nova senha já está ativa. Você pode continuar usando o sistema agora.
            </p>
            <button
              onClick={e}
              className="w-full rounded-lg bg-accent-500 text-base-950 font-medium py-2 text-sm hover:bg-accent-400 transition-colors"
            >
              Continuar
            </button>
          </div>
        ) : (
          <form
            onSubmit={f}
            className="space-y-4 bg-base-900 border border-base-800 rounded-xl p-6"
          >
            <div>
              <label className="block text-xs font-medium text-base-400 mb-1.5">Nova senha</label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={n}
                onChange={(e) => r(e.target.value)}
                className="w-full rounded-lg bg-base-850 border border-base-700 px-3 py-2 text-sm text-base-100 outline-none focus:border-accent-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-base-400 mb-1.5">
                Confirmar nova senha
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={i}
                onChange={(e) => a(e.target.value)}
                className="w-full rounded-lg bg-base-850 border border-base-700 px-3 py-2 text-sm text-base-100 outline-none focus:border-accent-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
            {o && <p className="text-sm text-danger">{o}</p>}
            <button
              type="submit"
              disabled={c}
              className="w-full rounded-lg bg-accent-500 text-base-950 font-medium py-2 text-sm hover:bg-accent-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {c ? `Salvando…` : `Salvar nova senha`}
            </button>
            <button
              type="button"
              onClick={() => t()}
              className="w-full text-xs text-base-500 hover:text-base-300 transition-colors"
            >
              Cancelar e voltar para o login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
