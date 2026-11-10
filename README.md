# iFix Lab — Sistema de gestão

Sistema de gestão do laboratório iFix Lab (reparo de iPhone): clientes e lojistas, aparelhos (vistoria e fotos),
ordens de serviço (com impressão), estoque, fornecedores e compras, financeiro, relatórios, permissões por perfil
e auditoria.

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Supabase (Postgres, Auth, Storage).
Publicado no GitHub Pages em `/ifix-lab/`.

## Rodar e publicar

```bash
npm install
npm run dev      # desenvolvimento em http://localhost:5173/ifix-lab/
npm run build    # gera a pasta dist/
```

Para publicar, envie o **conteúdo** de `dist/` (`index.html`, `404.html`, `favicon.svg` e a pasta `assets/`) para o
repositório `instadaloja1k1-ai/ifix-lab`, apagando os arquivos antigos de `assets/`.

O `.env` é opcional: sem ele, o app usa o projeto Supabase de produção (veja `src/lib/supabase.ts`).

## Login por CPF + PIN

Desde a versão 1.1, cada pessoa entra com **CPF + PIN de 4 números**.

- O administrador cadastra usuários em **Configurações → Usuários → Novo usuário** e redefine CPF/PIN pelo botão
  **CPF / PIN** de cada linha.
- Cada pessoa troca o próprio PIN pelo ícone de chave no rodapé do menu lateral.
- Por trás, o Supabase Auth usa o e-mail `<cpf>@cpf.ifixlab.app` e a senha `ifix#<PIN>#lab`
  (`src/lib/cpf.ts` e `supabase/migrations/0004_login_cpf_pin.sql`, que precisam ficar iguais).
- **Acesso de emergência:** `/ifix-lab/login?email` mostra o login antigo por e-mail e senha, para quem ainda não tem
  CPF cadastrado.

### Primeira ativação

1. No Supabase, abra **SQL Editor**, cole o conteúdo de `supabase/migrations/0004_login_cpf_pin.sql` e clique em **Run**.
2. Publique o novo build.
3. Entre em `https://instadaloja1k1-ai.github.io/ifix-lab/login?email` com seu e-mail e senha atuais.
4. Vá em **Configurações → Usuários**, clique em **Definir acesso** na sua linha e cadastre seu CPF e PIN.
5. Saia e entre de novo, agora só com CPF + PIN. Repita o passo 4 para cada funcionário.

**Segurança:** um PIN de 4 dígitos tem 10 mil combinações. O Supabase limita as tentativas de login por IP, o que
torna adivinhar o PIN lento, mas não impossível. Não use PINs óbvios (1234, 0000, data de nascimento) e desative quem
sair da empresa.

## Recursos da versão 1.2

- **Versão celular + app instalável (PWA):** menu em gaveta no celular; no Chrome/Safari use "Adicionar à tela inicial".
- **Link de acompanhamento da OS** (`/acompanhar/<token>`): o cliente vê status, orçamento, fotos, histórico e
  garantia, e pode **aprovar ou recusar o orçamento** quando a OS está em "Aguardando aprovação". Aprovou →
  "Reparo aprovado"; recusou → "Sem reparo". Tudo fica no histórico da OS.
- **Botão WhatsApp na OS:** abre o WhatsApp do cliente com uma mensagem pronta para o status atual + o link.
- **Fechamento mensal do lojista:** link "Fechamento do mês" em Clientes (só lojistas) → extrato imprimível/PDF.
- **Histórico por IMEI/série:** botão em Aparelhos + aviso automático no cadastro quando o IMEI já é conhecido.
- **Margem por OS e comissão por técnico:** seção nova em Relatórios; o % de comissão de cada técnico fica em
  Configurações → Usuários → Editar.
- **Ping diário** (`.github/workflows/manter-supabase-ativo.yml`, na branch `main`) para o Supabase gratuito não pausar.

Banco: `supabase/migrations/0005_acompanhamento_comissao.sql`.

## Sobre este código-fonte

O código-fonte original se perdeu. Este projeto foi **reconstruído a partir da versão publicada** em 10/11/2026:
telas, textos, estilos, consultas ao banco e regras foram recuperados por completo, mas os nomes de variáveis
internas de cada tela ficaram curtos (`e`, `t`, `n`…). Por isso os arquivos reconstruídos começam com
`// @ts-nocheck`. Arquivos novos ou reescritos (`AuthContext`, `Login`, `lib/cpf`, `PinInput`,
`configuracoes/UserAccessModals` e a aba Usuários) são tipados normalmente. Ao mexer em uma tela, vale renomear as
variáveis dela e remover o `@ts-nocheck`.

As migrações SQL `0001` a `0003` (tabelas, permissões, auditoria) já estão aplicadas no banco, mas os arquivos se
perderam junto com o código. Só a `0004` está nesta pasta.
