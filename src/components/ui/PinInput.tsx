import { useRef } from 'react';

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  /** Mostra os dígitos em vez de bolinhas (útil para o administrador definir o PIN). */
  visible?: boolean;
}

/** Quatro caixinhas numéricas para o PIN. Aceita colar "1234". */
export function PinInput({ value, onChange, autoFocus, disabled, visible }: PinInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 4 }, (_, i) => value[i] ?? '');

  function setAt(index: number, digit: string) {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join('').slice(0, 4));
  }

  return (
    <div className="flex gap-2 justify-between">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type={visible ? 'text' : 'password'}
          inputMode="numeric"
          autoComplete="off"
          maxLength={1}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          value={d}
          aria-label={`Dígito ${i + 1} do PIN`}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '');
            if (v.length > 1) {
              onChange(v.slice(0, 4));
              refs.current[Math.min(v.length, 4) - 1]?.focus();
              return;
            }
            setAt(i, v);
            if (v && i < 3) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !digits[i] && i > 0) {
              setAt(i - 1, '');
              refs.current[i - 1]?.focus();
              e.preventDefault();
            }
          }}
          onFocus={(e) => e.target.select()}
          className="w-14 h-14 text-center text-xl font-semibold rounded-lg bg-base-850 border border-base-700 text-base-100 outline-none focus:border-accent-500 transition-colors disabled:opacity-50"
        />
      ))}
    </div>
  );
}
