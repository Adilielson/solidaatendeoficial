## Diagnóstico

A página `/dashboard/configuracoes` JÁ tem todos os submenus restaurados (Perfil do Projeto, Equipe, Horário, Voz, API, Follow-up, Admin, Avançado) e o termo visível foi trocado para "Projeto". O motivo de você estar vendo somente "Meu Perfil" + a mensagem "Nenhuma empresa encontrada" é que o seu usuário atual **não tem registro em `companies`** — todo o bloco de configurações depende de `company` existir (linha 79 `{company && (...)}` e o early-return da linha 47).

Ou seja: o código está correto, mas a UI fica vazia porque falta o registro de "projeto" para o usuário logado.

## Plano

### 1. Remover o bloqueio que esconde as configurações quando não há "company"
- Em `src/pages/dashboard/DashboardSettings.tsx`:
  - Remover o early-return "Nenhuma empresa encontrada" (linhas 46-53).
  - Quando `company` for `null`, criar automaticamente um registro padrão (slug derivado do email, nome = prefixo do email) usando o mesmo padrão já existente em `useCompany`/`useCompanyId`, e então renderizar todas as abas normalmente.
  - Alternativa mais simples (preferida): chamar uma função `ensureProject()` no `useCompany` que faz o `insert` em `companies` se não existir, e refetch. Assim a página sempre tem `company`.

### 2. Limpar textos visíveis remanescentes com "empresa"
- `DashboardSettings.tsx`: trocar comentário e textos visíveis residuais por "projeto".
- `WelcomeBanner.tsx`: trocar textos visíveis "empresa" → "projeto" (comentários podem ficar).
- `FollowupCard.tsx`: renomear o placeholder `{{empresa}}` para `{{projeto}}` (e atualizar o backend/template correspondente se houver substituição em runtime — verificar antes de trocar).
- `CreateCompanyModal.tsx`: trocar toasts e textos visíveis ("Empresa criada" → "Projeto criado", etc.). O componente continua existindo internamente como modal de criação inicial, mas com terminologia "projeto".

### 3. Remover "Gerenciar Empresas" do código vivo
- O card `CompaniesManagementCard.tsx` já **não está referenciado** em lugar nenhum da UI (não aparece no sidebar nem em `DashboardSettings`). Para garantir que não volte por engano:
  - Deletar `src/components/dashboard/settings/CompaniesManagementCard.tsx`.
  - Manter `CreateCompanyModal.tsx` (renomeado mentalmente como "criar projeto"), pois é útil no onboarding.

### 4. NÃO mexer no banco
- Manter a tabela `companies` e os hooks (`useCompany`, `useCompanyId`) intactos — apenas a camada de UI passa a falar "projeto". Quando você for implementar multiempresa depois, é só voltar a expor o conceito na UI.

## Validação
- Logar com um usuário sem registro em `companies` → `/dashboard/configuracoes` deve mostrar todos os submenus já com um projeto padrão criado.
- `rg -in "empresa" src/pages src/components` deve retornar apenas comentários ou strings técnicas (nada visível ao usuário, exceto talvez o footer/landing que é institucional).
- Sidebar continua sem "WhatsApp" e sem "Gerenciar Empresas".