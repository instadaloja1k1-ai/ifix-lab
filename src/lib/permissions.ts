// @ts-nocheck

export const ROLE_LABELS = {
  administrador: `Administrador`,
  tecnico: `Técnico`,
  atendente: `Atendente`,
  financeiro: `Financeiro`,
  estoquista: `Estoquista`,
};
export const ROLE_DESCRIPTIONS = {
  administrador: `Acesso completo a todos os módulos, incluindo Configurações, permissões e auditoria.`,
  tecnico: `Cuida dos reparos: Aparelhos e Ordens de Serviço completos, Estoque só para consulta (ajuste de quantidade é restrito).`,
  atendente: `Linha de frente: Clientes/Lojistas, Aparelhos e Ordens de Serviço completos. Sem acesso a valores financeiros.`,
  financeiro: `Cuida do dinheiro: Financeiro, Fornecedores/Compras e Relatórios completos. Clientes só para consulta.`,
  estoquista: `Cuida do estoque: Estoque e Fornecedores/Compras (recebimento) completos.`,
};
export const MODULE_LABELS = {
  dashboard: `Dashboard`,
  clientes: `Clientes e Lojistas`,
  aparelhos: `Aparelhos`,
  'ordens-servico': `Ordens de Serviço`,
  estoque: `Estoque`,
  fornecedores: `Fornecedores e Compras`,
  financeiro: `Financeiro`,
  relatorios: `Relatórios`,
  configuracoes: `Configurações`,
};
export const MODULES = [
  `dashboard`,
  `clientes`,
  `aparelhos`,
  `ordens-servico`,
  `estoque`,
  `fornecedores`,
  `financeiro`,
  `relatorios`,
  `configuracoes`,
];
export const ROLE_PERMISSIONS = {
  administrador: {
    dashboard: `full`,
    clientes: `full`,
    aparelhos: `full`,
    'ordens-servico': `full`,
    estoque: `full`,
    fornecedores: `full`,
    financeiro: `full`,
    relatorios: `full`,
    configuracoes: `full`,
  },
  tecnico: {
    dashboard: `full`,
    clientes: `none`,
    aparelhos: `full`,
    'ordens-servico': `full`,
    estoque: `view`,
    fornecedores: `none`,
    financeiro: `none`,
    relatorios: `none`,
    configuracoes: `none`,
  },
  atendente: {
    dashboard: `full`,
    clientes: `full`,
    aparelhos: `full`,
    'ordens-servico': `full`,
    estoque: `none`,
    fornecedores: `none`,
    financeiro: `none`,
    relatorios: `none`,
    configuracoes: `none`,
  },
  financeiro: {
    dashboard: `full`,
    clientes: `view`,
    aparelhos: `none`,
    'ordens-servico': `none`,
    estoque: `none`,
    fornecedores: `full`,
    financeiro: `full`,
    relatorios: `full`,
    configuracoes: `none`,
  },
  estoquista: {
    dashboard: `full`,
    clientes: `none`,
    aparelhos: `none`,
    'ordens-servico': `none`,
    estoque: `full`,
    fornecedores: `full`,
    financeiro: `none`,
    relatorios: `none`,
    configuracoes: `none`,
  },
};
export function getAccessLevel(e, t) {
  return e ? (ROLE_PERMISSIONS[e]?.[t] ?? `none`) : `none`;
}
export function canAccess(e, t) {
  return getAccessLevel(e, t) !== `none`;
}
export function canEdit(e, t) {
  return getAccessLevel(e, t) === `full`;
}
