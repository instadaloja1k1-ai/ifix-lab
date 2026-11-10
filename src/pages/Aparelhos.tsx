// @ts-nocheck
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CameraIcon,
  FingerprintPatternIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  SmartphoneIcon,
  TrashIcon,
  TriangleAlertIcon,
  UploadIcon,
  XIcon,
  HistoryIcon,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { formatDateTime, dateInputToISO, isoToDateInput } from '../lib/format';
import { findSameDevice, ImeiHistoryModal, SameDeviceAlert } from './aparelhos/ImeiHistory';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export const inputClass = `w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-base-100 outline-none focus:border-accent-500 transition-colors`;
export const INSPECTION_ITEMS = [
  `Tela e Touch`,
  `Face ID / Touch ID`,
  `Câmera traseira`,
  `Câmera frontal`,
  `Alto-falante`,
  `Microfone`,
  `Botões (volume / power)`,
  `Carregamento`,
  `Bateria`,
  `Wi-Fi / Bluetooth`,
  `Rede celular / Chip`,
  `Vibração`,
];
export function emptyInspection() {
  let e = {};
  for (let t of INSPECTION_ITEMS)
    e[t] = {
      result: `nao_testado`,
      notes: ``,
    };
  return e;
}
export const EMPTY_DEVICE = {
  internal_code: ``,
  client_id: ``,
  brand: `Apple`,
  model: ``,
  storage_capacity: ``,
  color: ``,
  imei1: ``,
  imei2: ``,
  serial_number: ``,
  cosmetic_condition: ``,
  initial_working_condition: ``,
  battery_health: null,
  reported_defect: ``,
  technical_diagnosis: ``,
  accessories_received: ``,
  entry_at: new Date().toISOString(),
  promised_at: null,
  priority: `normal`,
  technician_id: null,
  internal_notes: ``,
  client_visible_notes: ``,
};
export const INSPECTION_RESULT_LABELS = {
  aprovado: `Aprovado`,
  reprovado: `Reprovado`,
  nao_testado: `Não testado`,
  nao_aplicavel: `N/A`,
};
export const PHOTO_BUCKET = `device-photos`;
export const PHOTO_STAGE_LABELS = {
  entrada: `Entrada`,
  diagnostico: `Diagnóstico`,
  durante_reparo: `Durante o reparo`,
  apos_reparo: `Após o reparo`,
  entrega: `Entrega`,
};
export const PHOTO_STAGES = [`entrada`, `diagnostico`, `durante_reparo`, `apos_reparo`, `entrega`];
export const MAX_PHOTOS_PER_UPLOAD = 8;
export function AparelhosPage() {
  let { user: e } = useAuth(),
    [t, n] = useState([]),
    [r, i] = useState([]),
    [a, o] = useState(true),
    [s, c] = useState(null),
    [l, u] = useState(``),
    [d, f] = useState(false),
    [p, m] = useState(EMPTY_DEVICE),
    [h, g] = useState(emptyInspection()),
    [_, v] = useState(false),
    [y, b] = useState(null),
    [x, S] = useState(null),
    [C, T] = useState(null),
    [E, D] = useState(null),
    [O, k] = useState([]),
    [A, j] = useState(false),
    [M, N] = useState(`entrada`),
    [ee, P] = useState(false),
    [te, F] = useState(null),
    [ne, re] = useState(null),
    ie = useRef(null);
  const [imeiHistory, setImeiHistory] = useState(null);
  useEffect(() => {
    isSupabaseConfigured ? ae() : o(false);
  }, []);
  async function ae() {
    (o(true), c(null));
    let [e, t] = await Promise.all([
      supabase.from(`devices`).select(`*`).order(`created_at`, {
        ascending: false,
      }),
      supabase.from(`clients`).select(`*`).order(`name`),
    ]);
    (e.error ? c(e.error.message) : n(e.data ?? []),
      !e.error && t.error && c(t.error.message),
      i(t.data ?? []),
      o(false));
  }
  let oe = useMemo(() => {
      let e = new Map();
      for (let t of r) e.set(t.id, t);
      return e;
    }, [r]),
    se = useMemo(() => {
      if (!l.trim()) return t;
      let e = l.toLowerCase();
      return t.filter((t) => {
        let n = oe.get(t.client_id)?.name ?? ``;
        return (
          t.internal_code.toLowerCase().includes(e) ||
          t.model.toLowerCase().includes(e) ||
          (t.imei1 ?? ``).includes(e) ||
          (t.imei2 ?? ``).includes(e) ||
          (t.serial_number ?? ``).toLowerCase().includes(e) ||
          n.toLowerCase().includes(e)
        );
      });
    }, [t, l, oe]);
  async function ce() {
    let { data: e } = await supabase
        .from(`devices`)
        .select(`internal_code`)
        .order(`created_at`, {
          ascending: false,
        })
        .limit(1),
      t = e?.[0]?.internal_code,
      n = 1,
      r = t?.match(/(\d+)$/);
    return (r && (n = parseInt(r[1], 10) + 1), `AP-${String(n).padStart(6, `0`)}`);
  }
  function le() {
    (S(null),
      m({
        ...EMPTY_DEVICE,
        entry_at: new Date().toISOString(),
      }),
      g(emptyInspection()),
      b(null),
      f(true));
  }
  function ue(e) {
    (S(e),
      m({
        internal_code: e.internal_code,
        client_id: e.client_id,
        brand: e.brand,
        model: e.model,
        storage_capacity: e.storage_capacity ?? ``,
        color: e.color ?? ``,
        imei1: e.imei1 ?? ``,
        imei2: e.imei2 ?? ``,
        serial_number: e.serial_number ?? ``,
        cosmetic_condition: e.cosmetic_condition ?? ``,
        initial_working_condition: e.initial_working_condition ?? ``,
        battery_health: e.battery_health,
        reported_defect: e.reported_defect ?? ``,
        technical_diagnosis: e.technical_diagnosis ?? ``,
        accessories_received: e.accessories_received ?? ``,
        entry_at: e.entry_at,
        promised_at: e.promised_at,
        priority: e.priority,
        technician_id: e.technician_id,
        internal_notes: e.internal_notes ?? ``,
        client_visible_notes: e.client_visible_notes ?? ``,
      }),
      b(null),
      f(true));
  }
  async function de(e) {
    let { error: t } = await supabase.from(`devices`).delete().eq(`id`, e.id);
    if (t)
      throw t.message.toLowerCase().includes(`foreign key`) || t.code === `23503`
        ? Error(
            `Não é possível excluir: este aparelho já tem ordem de serviço ou inspeção vinculada. Edite os dados em vez de excluir.`,
          )
        : Error(t.message);
    (T(null), ae());
  }
  async function fe(e) {
    (D(e), F(null), N(`entrada`), await pe(e.id));
  }
  async function pe(e) {
    j(true);
    let { data: t, error: n } = await supabase
      .from(`device_photos`)
      .select(`*`)
      .eq(`device_id`, e)
      .order(`created_at`, {
        ascending: false,
      });
    (n ? F(n.message) : k(t ?? []), j(false));
  }
  function me(e) {
    return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(e).data.publicUrl;
  }
  async function I(t) {
    if (!E) return;
    if (!t.type.startsWith(`image/`)) {
      F(`Envie apenas arquivos de imagem (JPG, PNG, HEIC, etc.).`);
      return;
    }
    if (t.size > MAX_PHOTOS_PER_UPLOAD * 1024 * 1024) {
      F(`Imagem muito grande. O limite é ${MAX_PHOTOS_PER_UPLOAD}MB por foto.`);
      return;
    }
    (P(true), F(null));
    let n = t.name.includes(`.`) ? t.name.split(`.`).pop() : `jpg`,
      r = `${E.id}/${M}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${n}`,
      { error: i } = await supabase.storage.from(PHOTO_BUCKET).upload(r, t, {
        cacheControl: `3600`,
        upsert: false,
      });
    if (i) {
      (P(false),
        F(
          i.message.toLowerCase().includes(`bucket not found`)
            ? `O repositório de fotos ainda não foi configurado no Supabase (bucket "device-photos" não existe).`
            : i.message,
        ));
      return;
    }
    let { error: a } = await supabase.from(`device_photos`).insert([
      {
        device_id: E.id,
        stage: M,
        storage_path: r,
        uploaded_by: e?.id ?? null,
      },
    ]);
    (P(false), a ? F(a.message) : (ie.current && (ie.current.value = ``), await pe(E.id)));
  }
  async function he(e) {
    let { error: t } = await supabase.storage.from(PHOTO_BUCKET).remove([e.storage_path]);
    if (t) throw Error(t.message);
    let { error: n } = await supabase.from(`device_photos`).delete().eq(`id`, e.id);
    if (n) throw Error(n.message);
    (re(null), E && (await pe(E.id)));
  }
  function ge(e, t, n) {
    g((r) => ({
      ...r,
      [e]: {
        ...r[e],
        [t]: n,
      },
    }));
  }
  async function _e(t) {
    if ((t.preventDefault(), !p.client_id)) {
      b(`Selecione o cliente dono do aparelho.`);
      return;
    }
    if (!p.model.trim()) {
      b(`Informe o modelo do aparelho.`);
      return;
    }
    if (!p.reported_defect?.trim()) {
      b(`Descreva o defeito relatado pelo cliente.`);
      return;
    }
    if ((v(true), b(null), x)) {
      let { error: e } = await supabase.from(`devices`).update(p).eq(`id`, x.id);
      if ((v(false), e)) {
        b(e.message);
        return;
      }
      (f(false), ae());
      return;
    }
    let n = await ce(),
      r = {
        ...p,
        internal_code: n,
      },
      { data: i, error: a } = await supabase.from(`devices`).insert([r]).select(`id`).single();
    if (a || !i) {
      (v(false), b(a?.message ?? `Erro ao salvar o aparelho.`));
      return;
    }
    let o = INSPECTION_ITEMS.filter((e) => h[e].result !== `nao_testado`).map((t) => ({
      device_id: i.id,
      item: t,
      result: h[t].result,
      notes: h[t].notes || null,
      created_by: e?.id ?? null,
    }));
    if (o.length > 0) {
      let { error: e } = await supabase.from(`device_inspections`).insert(o);
      if (e) {
        (v(false),
          b(`Aparelho salvo (${n}), mas houve erro ao salvar a inspeção de entrada: ${e.message}`),
          ae());
        return;
      }
    }
    (v(false), f(false), ae());
  }
  return isSupabaseConfigured ? (
    <div>
      <PageHeader
        title="Aparelhos"
        description="Cadastro de aparelhos recebidos, vinculados a um cliente, com inspeção de entrada."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setImeiHistory('')}
              className="flex items-center gap-1.5 text-sm border border-base-700 text-base-300 px-3 py-1.5 rounded-lg hover:border-accent-500/50 hover:text-accent-300 transition-colors"
            >
              <HistoryIcon className="w-4 h-4" />
              {' Histórico por IMEI'}
            </button>
            <button
              onClick={le}
              disabled={r.length === 0}
              title={
                r.length === 0 ? `Cadastre um cliente antes de receber um aparelho` : undefined
              }
              className="flex items-center gap-1.5 text-sm bg-accent-500 text-base-950 font-medium px-3 py-1.5 rounded-lg hover:bg-accent-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="w-4 h-4" />
              {' Novo aparelho'}
            </button>
          </div>
        }
      />
      {r.length === 0 && !a && (
        <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          Cadastre um cliente ou lojista em "Clientes e Lojistas" antes de receber o primeiro
          aparelho.
        </div>
      )}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="w-4 h-4 text-base-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={l}
            onChange={(e) => u(e.target.value)}
            placeholder="Buscar por código, cliente, modelo, IMEI..."
            className="w-full bg-base-900 border border-base-800 rounded-lg pl-9 pr-3 py-2 text-sm text-base-100 outline-none focus:border-accent-500/50"
          />
        </div>
      </div>
      {s && (
        <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {s}
        </div>
      )}
      <div className="bg-base-900 border border-base-800 rounded-xl overflow-x-auto">
        {a ? (
          <div className="p-6 text-sm text-base-500">Carregando…</div>
        ) : se.length === 0 ? (
          <EmptyState
            icon={SmartphoneIcon}
            title="Nenhum aparelho cadastrado"
            description="Registre o primeiro aparelho recebido usando o botão acima."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-base-500 border-b border-base-800">
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Aparelho</th>
                <th className="px-4 py-3 font-medium">IMEI</th>
                <th className="px-4 py-3 font-medium">Prioridade</th>
                <th className="px-4 py-3 font-medium">Entrada</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {se.map((e) => (
                <tr
                  className="border-b border-base-800/60 last:border-0 hover:bg-base-850/50"
                  key={e.id}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-accent-400">{e.internal_code}</span>
                  </td>
                  <td className="px-4 py-3 text-base-200">{oe.get(e.client_id)?.name ?? `—`}</td>
                  <td className="px-4 py-3">
                    <p className="text-base-100 font-medium">
                      {e.brand} {e.model}
                    </p>
                    {e.storage_capacity && (
                      <p className="text-xs text-base-500">
                        {e.storage_capacity}
                        {e.color ? ` · ${e.color}` : ``}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-base-400">
                    <div className="flex items-center gap-1.5">
                      <FingerprintPatternIcon className="w-3.5 h-3.5 text-base-500" />
                      {e.imei1 || e.serial_number || `—`}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        e.priority === `urgente`
                          ? `danger`
                          : e.priority === `alta`
                            ? `warning`
                            : e.priority === `baixa`
                              ? `default`
                              : `info`
                      }
                    >
                      {e.priority}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-base-400">{formatDateTime(e.entry_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => fe(e)}
                        title="Fotos"
                        className="w-7 h-7 flex items-center justify-center rounded-md text-base-500 hover:text-accent-400 hover:bg-base-850"
                      >
                        <CameraIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => ue(e)}
                        title="Editar"
                        className="w-7 h-7 flex items-center justify-center rounded-md text-base-500 hover:text-accent-400 hover:bg-base-850"
                      >
                        <PencilIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => T(e)}
                        title="Excluir"
                        className="w-7 h-7 flex items-center justify-center rounded-md text-base-500 hover:text-danger hover:bg-base-850"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Modal
        open={d}
        onClose={() => f(false)}
        title={x ? `Editar aparelho ${x.internal_code}` : `Novo aparelho recebido`}
        width="2xl"
      >
        <form onSubmit={_e} className="space-y-4">
          <Field label="Cliente / lojista dono do aparelho">
            <select
              required
              value={p.client_id}
              onChange={(e) =>
                m({
                  ...p,
                  client_id: e.target.value,
                })
              }
              className={inputClass}
            >
              <option value="">Selecione…</option>
              <optgroup label="Lojistas (B2B)">
                {r
                  .filter((e) => e.kind === `lojista`)
                  .map((e) => (
                    <option value={e.id} key={e.id}>
                      {e.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Clientes finais (B2C)">
                {r
                  .filter((e) => e.kind === `final`)
                  .map((e) => (
                    <option value={e.id} key={e.id}>
                      {e.name}
                    </option>
                  ))}
              </optgroup>
            </select>
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Marca">
              <input
                value={p.brand}
                onChange={(e) =>
                  m({
                    ...p,
                    brand: e.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Modelo">
              <input
                required
                placeholder="iPhone 14 Pro"
                value={p.model}
                onChange={(e) =>
                  m({
                    ...p,
                    model: e.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Armazenamento">
              <input
                placeholder="128GB"
                value={p.storage_capacity ?? ``}
                onChange={(e) =>
                  m({
                    ...p,
                    storage_capacity: e.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Cor">
              <input
                value={p.color ?? ``}
                onChange={(e) =>
                  m({
                    ...p,
                    color: e.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>
            <Field label="IMEI 1">
              <input
                value={p.imei1 ?? ``}
                onChange={(e) =>
                  m({
                    ...p,
                    imei1: e.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>
            <Field label="IMEI 2">
              <input
                value={p.imei2 ?? ``}
                onChange={(e) =>
                  m({
                    ...p,
                    imei2: e.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>
          </div>
          <SameDeviceAlert
            matches={findSameDevice(t, p, x?.id ?? null)}
            onOpenHistory={() => setImeiHistory(p.imei1 || p.imei2 || p.serial_number || '')}
          />
          <div className="grid grid-cols-3 gap-3">
            <Field label="Número de série">
              <input
                value={p.serial_number ?? ``}
                onChange={(e) =>
                  m({
                    ...p,
                    serial_number: e.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Saúde da bateria (%)">
              <input
                type="number"
                min={0}
                max={100}
                value={p.battery_health ?? ``}
                onChange={(e) =>
                  m({
                    ...p,
                    battery_health: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Prioridade">
              <select
                value={p.priority}
                onChange={(e) =>
                  m({
                    ...p,
                    priority: e.target.value,
                  })
                }
                className={inputClass}
              >
                <option value="baixa">Baixa</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </Field>
          </div>
          <Field label="Estado de conservação (cosmético)">
            <input
              placeholder="Ex: riscos leves na tela, carcaça amassada no canto inferior..."
              value={p.cosmetic_condition ?? ``}
              onChange={(e) =>
                m({
                  ...p,
                  cosmetic_condition: e.target.value,
                })
              }
              className={inputClass}
            />
          </Field>
          <Field label="Defeito relatado pelo cliente">
            <textarea
              required
              value={p.reported_defect ?? ``}
              onChange={(e) =>
                m({
                  ...p,
                  reported_defect: e.target.value,
                })
              }
              className={inputClass + ` min-h-[60px]`}
            />
          </Field>
          <Field label="Acessórios recebidos junto">
            <input
              placeholder="Ex: cabo, capinha, chip..."
              value={p.accessories_received ?? ``}
              onChange={(e) =>
                m({
                  ...p,
                  accessories_received: e.target.value,
                })
              }
              className={inputClass}
            />
          </Field>
          <Field label="Previsão de entrega">
            <input
              type="date"
              value={isoToDateInput(p.promised_at)}
              onChange={(e) =>
                m({
                  ...p,
                  promised_at: dateInputToISO(e.target.value),
                })
              }
              className={inputClass}
            />
          </Field>
          {!x && (
            <div>
              <p className="text-xs font-medium text-base-400 mb-2">Inspeção de entrada</p>
              <div className="border border-base-800 rounded-lg divide-y divide-base-800">
                {INSPECTION_ITEMS.map((e) => (
                  <div className="flex items-center gap-2 px-3 py-2" key={e}>
                    <span className="text-sm text-base-200 flex-1">{e}</span>
                    <select
                      value={h[e].result}
                      onChange={(t) => ge(e, `result`, t.target.value)}
                      className="bg-base-850 border border-base-700 rounded-md px-2 py-1 text-xs text-base-200 outline-none"
                    >
                      {Object.keys(INSPECTION_RESULT_LABELS).map((e) => (
                        <option value={e} key={e}>
                          {INSPECTION_RESULT_LABELS[e]}
                        </option>
                      ))}
                    </select>
                    <input
                      placeholder="obs."
                      value={h[e].notes}
                      onChange={(t) => ge(e, `notes`, t.target.value)}
                      className="w-32 bg-base-850 border border-base-700 rounded-md px-2 py-1 text-xs text-base-200 outline-none focus:border-accent-500"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-base-500 mt-1">
                Itens deixados como "Não testado" não são registrados na inspeção.
              </p>
            </div>
          )}
          {x && (
            <p className="text-xs text-base-500 -mt-2">
              A inspeção de entrada já registrada não é editada aqui — ela fica no histórico do
              aparelho.
            </p>
          )}
          <Field label="Observações internas (não visível ao cliente)">
            <textarea
              value={p.internal_notes ?? ``}
              onChange={(e) =>
                m({
                  ...p,
                  internal_notes: e.target.value,
                })
              }
              className={inputClass + ` min-h-[50px]`}
            />
          </Field>
          {y && <p className="text-sm text-danger">{y}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => f(false)}
              className="text-sm px-3 py-2 rounded-lg text-base-400 hover:text-base-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={_}
              className="text-sm px-4 py-2 rounded-lg bg-accent-500 text-base-950 font-medium hover:bg-accent-400 disabled:opacity-50"
            >
              {_ ? `Salvando…` : x ? `Salvar alterações` : `Registrar aparelho`}
            </button>
          </div>
        </form>
      </Modal>
      {imeiHistory !== null && (
        <ImeiHistoryModal initialQuery={imeiHistory} onClose={() => setImeiHistory(null)} />
      )}
      <ConfirmDialog
        open={!!C}
        title="Excluir aparelho"
        description={`Tem certeza que deseja excluir o aparelho "${C?.internal_code}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onClose={() => T(null)}
        onConfirm={() => {
          if (C) return de(C);
        }}
      />
      <Modal
        open={!!E}
        onClose={() => D(null)}
        title={E ? `Fotos — ${E.internal_code}` : `Fotos`}
        width="2xl"
      >
        <div className="space-y-5">
          <div className="flex flex-wrap items-end gap-3 bg-base-850/60 border border-base-800 rounded-lg p-3">
            <Field label="Etapa da foto">
              <select value={M} onChange={(e) => N(e.target.value)} className={inputClass}>
                {PHOTO_STAGES.map((e) => (
                  <option value={e} key={e}>
                    {PHOTO_STAGE_LABELS[e]}
                  </option>
                ))}
              </select>
            </Field>
            <div>
              <input
                ref={ie}
                type="file"
                accept="image/*"
                disabled={ee}
                onChange={(e) => {
                  let t = e.target.files?.[0];
                  t && I(t);
                }}
                className="hidden"
                id="device-photo-input"
              />
              <label
                htmlFor="device-photo-input"
                className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg font-medium cursor-pointer ${ee ? `bg-base-800 text-base-500 cursor-not-allowed` : `bg-accent-500 text-base-950 hover:bg-accent-400`}`}
              >
                <UploadIcon className="w-4 h-4" /> {ee ? `Enviando…` : `Enviar foto`}
              </label>
            </div>
            <p className="text-xs text-base-500">
              {'JPG, PNG ou HEIC, até '}
              {MAX_PHOTOS_PER_UPLOAD}MB.
            </p>
          </div>
          {te && <p className="text-sm text-danger">{te}</p>}
          {A ? (
            <p className="text-sm text-base-500">Carregando fotos…</p>
          ) : O.length === 0 ? (
            <p className="text-sm text-base-500">
              Nenhuma foto registrada para este aparelho ainda.
            </p>
          ) : (
            <div className="space-y-4">
              {PHOTO_STAGES.filter((e) => O.some((t) => t.stage === e)).map((e) => (
                <div key={e}>
                  <p className="text-xs font-medium text-base-400 mb-2">{PHOTO_STAGE_LABELS[e]}</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {O.filter((t) => t.stage === e).map((t) => (
                      <div
                        className="relative group aspect-square rounded-lg overflow-hidden border border-base-800 bg-base-850"
                        key={t.id}
                      >
                        <a href={me(t.storage_path)} target="_blank" rel="noreferrer">
                          <img
                            src={me(t.storage_path)}
                            alt={`Foto — ${PHOTO_STAGE_LABELS[e]}`}
                            className="w-full h-full object-cover"
                          />
                        </a>
                        <button
                          onClick={() => re(t)}
                          title="Excluir foto"
                          className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-md bg-black/60 text-base-200 opacity-0 group-hover:opacity-100 hover:text-danger transition-opacity"
                        >
                          <XIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
      <ConfirmDialog
        open={!!ne}
        title="Excluir foto"
        description="Tem certeza que deseja excluir esta foto? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onClose={() => re(null)}
        onConfirm={() => {
          if (ne) return he(ne);
        }}
      />
    </div>
  ) : (
    <div>
      <PageHeader title="Aparelhos" />
      <EmptyState
        icon={TriangleAlertIcon}
        title="Conecte o Supabase para usar este módulo"
        description="Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env."
      />
    </div>
  );
}
export function Field({ label: e, children: t }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-base-400 mb-1">{e}</span>
      {t}
    </label>
  );
}
