// Login por CPF + PIN de 4 dígitos.
//
// O Supabase Auth trabalha com e-mail + senha, então cada usuário tem:
//   - e-mail de login "técnico" derivado do CPF:  12345678909@cpf.ifixlab.app
//   - senha derivada do PIN:                        ifix#1234#lab
// Ninguém precisa conhecer esses valores: a tela pede só CPF e PIN.
// IMPORTANTE: as mesmas regras existem no SQL (supabase/migrations/0004_login_cpf_pin.sql,
// funções cpf_login_email e pin_to_password). Se mudar aqui, mude lá também.

export const CPF_LOGIN_DOMAIN = 'cpf.ifixlab.app';

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatCpf(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function isValidCpf(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
}

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export function cpfToLoginEmail(cpf: string): string {
  return `${onlyDigits(cpf)}@${CPF_LOGIN_DOMAIN}`;
}

export function pinToPassword(pin: string): string {
  return `ifix#${pin}#lab`;
}
