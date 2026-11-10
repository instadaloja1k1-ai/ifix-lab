import { useState, type FormEvent, type ReactNode } from 'react';
import { Modal } from '../../components/ui/Modal';
import { PinInput } from '../../components/ui/PinInput';
import { useAuth, type Profile, type Role } from '../../contexts/AuthContext';
import { formatCpf, isValidCpf, isValidPin, onlyDigits } from '../../lib/cpf';
import { ROLE_LABELS } from '../../lib/permissions';
import { supabase } from '../../lib/supabase';

const ROLES: Role[] = ['administrador', 'tecnico', 'atendente', 'financeiro', 'estoquista'];
const inputClass =
  'w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-base-100 outline-none focus:border-accent-500';

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <span className="block text-xs font-medium text-base-400 mb-1">{label}</span>
      {children}
      {hint && <p className="text-[11px] text-base-500 mt-1">{hint}</p>}
    </div>
  );
}

function Actions({
  saving,
  onClose,
  label,
}: {
  saving: boolean;
  onClose: () => void;
  label: string;
}) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button
        type="button"
        onClick={onClose}
        className="text-sm px-3 py-2 rounded-lg text-base-400 hover:text-base-200"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={saving}
        className="text-sm px-4 py-2 rounded-lg bg-accent-500 text-base-950 font-medium hover:bg-accent-400 disabled:opacity-50"
      >
        {saving ? 'Salvando…' : label}
      </button>
    </div>
  );
}

function friendlyError(message: string): string {
  if (/profiles_cpf_key|cpf_ja_cadastrado|duplicate key/i.test(message))
    return 'Já existe um usuário com esse CPF.';
  return message;
}

/** Administrador cadastra um novo usuário que entra com CPF + PIN. */
export function NewUserModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [fullName, setFullName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('atendente');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim()) return setError('Informe o nome.');
    if (!isValidCpf(cpf)) return setError('CPF inválido.');
    if (!isValidPin(pin)) return setError('O PIN precisa ter 4 números.');
    setSaving(true);
    const { error } = await supabase.rpc('admin_create_user', {
      p_full_name: fullName.trim(),
      p_cpf: onlyDigits(cpf),
      p_pin: pin,
      p_role: role,
      p_phone: phone.trim() || null,
    });
    setSaving(false);
    if (error) return setError(friendlyError(error.message));
    onSaved();
  }

  return (
    <Modal open onClose={onClose} title="Novo usuário" width="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nome completo">
          <input
            className={inputClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoFocus
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="CPF">
            <input
              className={inputClass}
              inputMode="numeric"
              value={formatCpf(cpf)}
              onChange={(e) => setCpf(onlyDigits(e.target.value).slice(0, 11))}
              placeholder="000.000.000-00"
            />
          </Field>
          <Field label="Telefone (opcional)">
            <input
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>
        </div>
        <Field label="Perfil">
          <select
            className={inputClass}
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="PIN inicial (4 números)"
          hint="Passe o PIN para a pessoa. Ela pode trocar depois em “Alterar meu PIN”."
        >
          <PinInput value={pin} onChange={setPin} visible />
        </Field>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Actions saving={saving} onClose={onClose} label="Cadastrar" />
      </form>
    </Modal>
  );
}

/** Administrador edita nome, telefone, comissão, CPF e PIN de um usuário existente. */
export function UserAccessModal({
  user,
  onClose,
  onSaved,
}: {
  user: Profile;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [fullName, setFullName] = useState(user.full_name ?? '');
  const [phone, setPhone] = useState((user.phone as string) ?? '');
  const [commission, setCommission] = useState(String(user.commission_percent ?? 0));
  const [cpf, setCpf] = useState(user.cpf ?? '');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const cpfChanged = onlyDigits(cpf) !== (user.cpf ?? '');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim()) return setError('Informe o nome.');
    const commissionValue = Number(commission.replace(',', '.'));
    if (!Number.isFinite(commissionValue) || commissionValue < 0 || commissionValue > 100)
      return setError('A comissão precisa ser um número entre 0 e 100.');
    if (!isValidCpf(cpf)) return setError('CPF inválido.');
    if (!user.cpf && !pin) return setError('Defina também um PIN para o primeiro acesso.');
    if (pin && !isValidPin(pin)) return setError('O PIN precisa ter 4 números.');
    setSaving(true);

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        commission_percent: commissionValue,
      })
      .eq('id', user.id);
    if (profileError) {
      setSaving(false);
      return setError(profileError.message);
    }
    if (cpfChanged) {
      const { error } = await supabase.rpc('admin_set_user_cpf', {
        p_user_id: user.id,
        p_cpf: onlyDigits(cpf),
      });
      if (error) {
        setSaving(false);
        return setError(friendlyError(error.message));
      }
    }
    if (pin) {
      const { error } = await supabase.rpc('admin_set_user_pin', {
        p_user_id: user.id,
        p_pin: pin,
      });
      if (error) {
        setSaving(false);
        return setError(error.message);
      }
    }
    setSaving(false);
    onSaved();
  }

  return (
    <Modal open onClose={onClose} title={`Editar usuário — ${user.full_name}`} width="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nome completo">
          <input
            className={inputClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoFocus
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Telefone">
            <input
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>
          <Field label="Comissão (%)" hint="Sobre a mão de obra das OS entregues.">
            <input
              className={inputClass}
              inputMode="decimal"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
            />
          </Field>
        </div>
        <Field label="CPF (usado no login)">
          <input
            className={inputClass}
            inputMode="numeric"
            value={formatCpf(cpf)}
            onChange={(e) => setCpf(onlyDigits(e.target.value).slice(0, 11))}
            placeholder="000.000.000-00"
          />
        </Field>
        <Field
          label={user.cpf ? 'Novo PIN (deixe em branco para manter o atual)' : 'PIN (4 números)'}
          hint="O PIN antigo deixa de funcionar na hora."
        >
          <PinInput value={pin} onChange={setPin} visible />
        </Field>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Actions saving={saving} onClose={onClose} label="Salvar" />
      </form>
    </Modal>
  );
}

/** Qualquer usuário troca o próprio PIN. */
export function ChangeMyPinModal({ onClose }: { onClose: () => void }) {
  const { changeMyPin } = useAuth();
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isValidPin(pin)) return setError('O PIN precisa ter 4 números.');
    if (pin !== confirm) return setError('Os dois PINs não são iguais.');
    setSaving(true);
    const { error } = await changeMyPin(pin);
    setSaving(false);
    if (error) return setError(error);
    setDone(true);
  }

  return (
    <Modal open onClose={onClose} title="Alterar meu PIN" width="md">
      {done ? (
        <div className="space-y-4">
          <p className="text-sm text-base-300">PIN alterado. Use o novo PIN no próximo login.</p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="text-sm px-4 py-2 rounded-lg bg-accent-500 text-base-950 font-medium hover:bg-accent-400"
            >
              Fechar
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Novo PIN">
            <PinInput value={pin} onChange={setPin} autoFocus />
          </Field>
          <Field label="Repita o novo PIN">
            <PinInput value={confirm} onChange={setConfirm} />
          </Field>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Actions saving={saving} onClose={onClose} label="Salvar PIN" />
        </form>
      )}
    </Modal>
  );
}
