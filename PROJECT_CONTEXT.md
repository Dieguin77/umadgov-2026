# PROJECT_CONTEXT — UMADGOV 2026

Documento de referência técnica do projeto. Objetivo: qualquer pessoa (ou IA) que
abrir este repositório pela primeira vez deve conseguir entender arquitetura,
fluxos e regras de negócio sem precisar ler todo o código-fonte.

---

## 1. Visão Geral

Site de encomenda da camisa oficial da UMADGOV 2026 (evento/tema "Vós sois
geração eleita" — I Pedro 2:9). O cliente faz o pedido pelo site, paga via PIX
e opcionalmente envia o comprovante; a equipe organizadora acompanha e
gerencia os pedidos por um painel administrativo.

- **Stack:** React 19 + Vite 7 + Tailwind CSS 3 + Supabase (Postgres + Auth + Storage)
- **Hospedagem:** Vercel, domínio `umadgov.com.br`, deploy automático a cada push na branch `main`
- **Sem back-end próprio:** o front-end fala diretamente com o Supabase pelo SDK `@supabase/supabase-js`, usando a chave anônima (`anon`/`publishable`) protegida por Row Level Security (RLS)

---

## 2. Arquitetura Completa

```
┌─────────────────────────────────────────────────────────┐
│  Navegador (React SPA)                                   │
│  ┌───────────────┐   ┌───────────────┐   ┌─────────────┐ │
│  │  Páginas       │──▶│  Serviços      │──▶│  Supabase   │ │
│  │  (pages/)      │   │  (services/)   │   │  JS client  │ │
│  └───────────────┘   └───────────────┘   └──────┬──────┘ │
│         ▲                                        │        │
│         │ hooks/, context/                        │        │
│         │                                          ▼        │
└─────────┼──────────────────────────────  Supabase (nuvem) ┘
          │                                 - Postgres (tabelas)
   componentes UI                           - Auth (login admin)
   (components/)                            - Storage (comprovantes)
```

- **Roteamento:** `react-router-dom` (`BrowserRouter`), definido inteiro em `src/App.jsx`.
- **Estado global:** dois React Contexts (`AuthContext`, `OrderContext`) — nada de Redux/Zustand.
- **Formulários:** `react-hook-form` em todos os formulários (pedido, edição admin).
- **Dados:** camada de serviço (`src/services/`) é o único lugar que fala com Supabase. Componentes/páginas nunca importam `supabase` diretamente para dados de pedido (só `AdminLogin`/`AuthContext` usam `supabase.auth` diretamente, pois é autenticação, não dado de negócio).
- **Modo offline/mock:** se `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` não estiverem definidas, `isSupabaseConfigured` (em `src/lib/supabase.js`) vira `false` e os serviços caem automaticamente para um array em memória (`mockOrders.js`) — útil para rodar o site localmente sem credenciais, mas **os dados não persistem** (somem ao recarregar a página).

> ⚠️ **Não existe ambiente de staging.** O `.env.local` local (não versionado) aponta para o **mesmo projeto Supabase da produção**. Qualquer teste feito rodando `npm run dev` grava direto no banco real. Ver seção 9.

---

## 3. Estrutura de Pastas

```
umadgov-2026/
├── public/                      # assets estáticos servidos como estão (favicon, manifest)
├── src/
│   ├── assets/                  # imagens (logo, mockups de camisa)
│   ├── components/
│   │   ├── ui/                  # design system genérico: Button, Input, Select, Modal, Card, Badge, SelectableCards
│   │   ├── layout/               # Navbar, Footer, WhatsAppButton, ScrollToTopButton
│   │   ├── home/                 # seções da landing page (Hero, ShirtInfo, Sizes, SizeChart, Contact)
│   │   ├── order/                # fluxo de pedido do cliente (OrderForm, OrderSuccess, PaymentInstructions, ReceiptUpload)
│   │   ├── admin/                 # painel administrativo (OrdersTable, OrderDetailModal, EditOrderModal, ComprovanteModal, SearchBar, DashboardStats, AdminLogin)
│   │   └── auth/                 # ProtectedRoute (guarda de rota do /admin)
│   ├── pages/                    # uma página por rota (HomePage, OrderPage, PaymentPage, OrderStatusPage, AdminPage, LoginPage)
│   ├── layouts/                   # MainLayout (site público), AdminLayout (painel)
│   ├── context/                   # AuthContext (sessão/perfil), OrderContext (pedido em andamento)
│   ├── hooks/                     # useOrders (listagem/dashboard admin), useUpload (upload de comprovante)
│   ├── services/                  # orderService.js, uploadService.js — única camada que fala com Supabase
│   ├── data/                      # mockOrders.js — constantes de domínio (status, tamanhos, modelos, forma de pagamento) + dados de fallback
│   ├── utils/                     # validators, formatters, orderNumber, pixPayload (gerador do BR Code/EMV do PIX)
│   ├── lib/                       # supabase.js (client + isSupabaseConfigured)
│   ├── App.jsx                    # rotas
│   ├── main.jsx                   # bootstrap do React
│   └── index.css                  # Tailwind + poucas classes utilitárias globais
├── supabase-setup.sql              # schema completo (tabelas, RLS, triggers, storage) — fonte de verdade do banco
├── tailwind.config.js               # tokens de cor/gradiente/sombra/animação (design system)
├── vite.config.js                   # alias @ → src/, chunks manuais de build
├── .env / .env.local / .env.example # variáveis de ambiente (ver seção 9)
└── PROJECT_CONTEXT.md               # este arquivo
```

---

## 4. Fluxo dos Pedidos

```
Home (/) → "Encomendar" → /pedido
   │
   ▼
OrderForm (5 etapas, nesta ordem):
   1. Modelo da camisa   (Masculino / Baby Look / Infantil — obrigatório)
   2. Tamanho + Quantidade
   3. Dados Pessoais     (Nome, Telefone, Congregação, Observações opcional)
   4. Forma de Pagamento  (fixo: PIX)
   5. Resumo do pedido + botão "Finalizar Pedido"
   │
   ▼ orderService.createOrder()
Pedido criado no Supabase (status inicial: aguardando_pagamento)
   │
   ▼
OrderSuccess (tela de confirmação, mostra número do pedido)
   │
   ▼ (opcional) "Ir para o pagamento" → /enviar-comprovante?pedido=XXX
PaymentPage:
   1. Instruções PIX (QR Code + Copia e Cola)
   2. Upload de comprovante (OPCIONAL — não bloqueia nada)
   │
   ▼
Cliente pode a qualquer momento consultar em /consulta (OrderStatusPage)
   digitando o número do pedido → mostra dados + timeline de status
   │
   ▼
Painel Admin (/admin, autenticado): visualiza, filtra, edita, muda status,
   vê/baixa comprovante quando existir, exclui pedido.
```

**Importante:** o pedido é criado e fica **totalmente válido e gerenciável no
painel** independentemente de o comprovante ter sido enviado ou não. Não há
nenhuma validação que impeça a criação, visualização ou gerenciamento do
pedido por falta de comprovante (ver seção 12).

### Ciclo de vida do status (`STATUS` em `src/data/mockOrders.js`)

```
aguardando_pagamento → comprovante_enviado → pagamento_aprovado → separado_retirada → entregue
```

- `aguardando_pagamento`: estado inicial de todo pedido.
- `comprovante_enviado`: setado automaticamente quando o cliente envia um comprovante (`orderService.updateComprovante`). É só um sinalizador de "há algo para o admin conferir" — não confirma pagamento.
- `pagamento_aprovado` em diante: alterado manualmente pelo admin hoje (`OrderDetailModal` → botões de status → `orderService.updateOrderStatus`). Este é o método que uma futura integração com Gateway PIX (webhook) deve chamar diretamente para confirmar pagamento, sem depender de comprovante.

---

## 5. Fluxo de Pagamento

- **Método único: PIX.** Cartão de crédito/débito foi removido da interface e da lógica (não existe mais no schema além de valores legados que porventura existam em pedidos antigos).
- **Chave PIX:** definida em `PIX_KEY` no topo de `src/components/order/PaymentInstructions.jsx` (atualmente uma chave e-mail). Único ponto no código onde a chave aparece.
- **Geração do QR Code / Copia e Cola:** `src/utils/pixPayload.js` exporta `buildPixPayload({ pixKey, merchantName, merchantCity, amount, txid })`, que monta o payload EMV/BR Code (padrão Banco Central) com CRC16 calculado na hora — **não depende de nenhum serviço externo/gateway**. O QR Code visual é renderizado com a lib `qrcode.react` (`<QRCodeSVG value={pixCode} />`), usando exatamente a mesma string do "Copia e Cola" (fonte única de verdade — os dois nunca podem divergir).
- **Valor e identificação:** `amount` = `order.valor`, `txid` = `order.numeroPedido` (sanitizado para alfanumérico no payload).
- **Comprovante é opcional** (ver seção 12) — serve apenas de apoio para conferência manual pela equipe, preparando o sistema para uma futura confirmação automática via webhook de Gateway PIX.
- **Nada acoplado:** os três processos abaixo são propositalmente independentes (ver comentários em `orderService.js`):
  1. `createOrder` — cria o pedido.
  2. `updateComprovante` — só registra o arquivo enviado (bookkeeping).
  3. `updateOrderStatus` — único método que muda o status oficial do pagamento; é o ponto de entrada natural para um futuro webhook de gateway.

---

## 6. Estrutura do Supabase

- **Projeto único** (`wlawsunqywdnfamltqba.supabase.co`) usado tanto em desenvolvimento local quanto em produção — não há projeto de staging separado.
- **Autenticação:** Supabase Auth (e-mail/senha) só para a equipe administrativa. Clientes finais nunca fazem login — todas as ações do cliente (criar pedido, consultar status, enviar comprovante) passam pela chave anônima + RLS.
- **Controle de acesso:** tabela `profiles` guarda o `role` de cada usuário autenticado (`admin`, `moderador`, `user`). Só `admin`/`moderador` conseguem acessar `/admin` (`ProtectedRoute` + `AuthContext.isAdmin`) e excluir pedidos/comprovantes.
- **Row Level Security (RLS):** ativado em `profiles`, `pedidos` e `storage.objects`. Todas as policies estão centralizadas em `supabase-setup.sql`.
- **Numeração do pedido:** sequência Postgres (`pedidos_numero_seq`) + trigger `set_numero_pedido`, que gera `UMD-2026-0001`, `UMD-2026-0002`, ... automaticamente no `INSERT` (o front-end nunca define o número, exceto no modo mock local).

---

## 7. Tabelas

### `profiles`
| Coluna | Tipo | Observações |
|---|---|---|
| `id` | UUID (PK) | referencia `auth.users(id)`, `ON DELETE CASCADE` |
| `nome` | TEXT | |
| `role` | TEXT | `admin` \| `moderador` \| `user`, default `'user'` |
| `createdAt` | TIMESTAMPTZ | default `NOW()` |

Criada automaticamente para todo novo usuário do Supabase Auth via trigger
`handle_new_user`. RLS: cada usuário só lê/insere o próprio perfil.

### `pedidos`
| Coluna | Tipo | Observações |
|---|---|---|
| `id` | UUID (PK) | `gen_random_uuid()` |
| `numeroPedido` | TEXT UNIQUE | gerado pelo trigger, formato `UMD-2026-XXXX` |
| `nome` | TEXT NOT NULL | |
| `telefone` | TEXT NOT NULL | |
| `congregacao` | TEXT NOT NULL | |
| `shirtModel` | TEXT NOT NULL | `masculino` \| `baby_look` \| `infantil`, default `'masculino'` |
| `tamanho` | TEXT NOT NULL | `P` \| `M` \| `G` \| `GG` \| `XG` |
| `quantidade` | INTEGER NOT NULL | `> 0` |
| `valor` | NUMERIC(10,2) NOT NULL | `quantidade × SHIRT_PRICE` (calculado no front-end) |
| `status` | TEXT NOT NULL | ver ciclo de vida na seção 4, default `aguardando_pagamento` |
| `formaPagamento` | TEXT NOT NULL | único valor aceito: `pix` |
| `comprovante` | TEXT (nullable) | caminho do arquivo no bucket `comprovantes`, `NULL` = não enviado |
| `comprovanteAt` | TIMESTAMPTZ (nullable) | |
| `observacoes` | TEXT (nullable) | |
| `createdAt` | TIMESTAMPTZ | default `NOW()` |

RLS: leitura, inserção e atualização públicas (`USING (true)` / `WITH CHECK (true)`)
— necessário porque o cliente final não faz login. Exclusão restrita a
`admin`/`moderador` autenticado.

> Todas as colunas com nome composto usam **camelCase entre aspas** no
> Postgres (`"numeroPedido"`, `"shirtModel"`, `"comprovanteAt"`) para bater
> exatamente com as chaves usadas no JS — evita mapeamento manual de nomes.

---

## 8. Buckets do Storage

### `comprovantes`
- **Privado** (`public: false`), limite de **10 MB** por arquivo.
- Tipos aceitos: `image/jpeg`, `image/png`, `application/pdf`.
- Upload público (cliente não precisa estar logado para enviar o comprovante).
- Leitura só para usuário `authenticated` (admin acessa via `createSignedUrl`, válida por 1h — `uploadService.getComprovanteUrl`).
- Exclusão só para `authenticated` (na prática, admin/moderador).
- Nome do arquivo: `${numeroPedido}-comprovante-${timestamp}.${extensão}`.

---

## 9. Variáveis de Ambiente

| Variável | Usada no código? | Onde | Observação |
|---|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | `src/lib/supabase.js` | obrigatória para o site funcionar com dados reais |
| `VITE_SUPABASE_ANON_KEY` | ✅ | `src/lib/supabase.js` | chave anônima/publicável — segura para expor no front-end (protegida por RLS) |
| `VITE_SUPABASE_STORAGE_BUCKET` | ✅ | `src/lib/supabase.js` | fallback hardcoded (`comprovantes`) se ausente |
| `VITE_WHATSAPP_NUMBER` | ✅ | `WhatsAppButton.jsx`, `ContactSection.jsx`, `Footer.jsx`, `ReceiptUpload.jsx` | fallback hardcoded (`5533999186633`) se ausente |
| `VITE_WHATSAPP_NUMBER_2` | ✅ | `ContactSection.jsx`, `Footer.jsx` | fallback hardcoded (`5533991060488`) se ausente |
| `VITE_INSTAGRAM_USER` | ✅ | `ContactSection.jsx`, `Footer.jsx` | fallback hardcoded (`umadgov`) se ausente |
| `VITE_SHIRT_PRICE` | ✅ | `src/data/mockOrders.js` | fallback hardcoded (`50`) se ausente |

Arquivos:
- **`.env`** — versionado, serve de template com valores vazios/exemplo.
- **`.env.example`** — versionado, documentação dos campos esperados.
- **`.env.local`** — **não versionado** (gitignored), contém as credenciais reais do Supabase. É o mesmo projeto usado em produção (ver aviso na seção 2/6).

> Se for necessário rodar testes locais que criam/editam pedidos, **esvazie
> temporariamente `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` em
> `.env.local`** antes de testar — isso força o modo mock em memória — e
> restaure os valores originais depois. Caso contrário, qualquer pedido de
> teste é gravado direto na produção (e não pode ser apagado sem acesso de
> admin, por causa da RLS de `DELETE`).

---

## 10. Convenções do Projeto

- **Alias de import:** `@/` aponta para `src/` (configurado em `vite.config.js`). Sempre usar `@/...`, nunca caminhos relativos longos (`../../..`).
- **Idioma:** nomes de domínio/negócio em **português** (`congregacao`, `numeroPedido`, `tamanho`, `formaPagamento`, `shirtModel`), pois refletem a linguagem do time e do banco. Nomes técnicos/genéricos (componentes de UI, hooks, props) em inglês.
- **Estilização:** exclusivamente Tailwind CSS utilitário. Sem CSS Modules, sem styled-components. Só duas classes utilitárias globais customizadas em `index.css` (`.scrollbar-hide`, `.text-gradient-lavanda`).
- **Design tokens centralizados em `tailwind.config.js`:**
  - Cor `lavanda` (roxo/azulado, cor primária da marca) e `dourado` (laranja institucional `#F45F27` — nome do token ficou `dourado` por herança histórica, mas o valor é o laranja atual).
  - `boxShadow.gold`/`gold-lg`, `backgroundImage.gradient-gold`/`gradient-lavanda`/`gradient-hero`, `animation.pulse-gold`/`float`/`shimmer`.
  - **Nunca hardcodar hex de cor da marca num componente** — sempre usar a classe Tailwind do token (`bg-dourado-600`, `text-lavanda-700`, etc.), para que uma futura troca de cor institucional continue centralizada em um único arquivo.
- **Ícones:** sempre `lucide-react`.
- **Animações:** `framer-motion` para transições/entrada de elementos.
- **Formulários:** `react-hook-form` com `register`/`watch`/`setValue`; validações centralizadas em `src/utils/validators.js`.
- **Toasts:** `react-hot-toast`, configurado globalmente em `App.jsx` (estilo dark, ícone de sucesso na cor da marca).
- **Separador visual em textos:** use `|` entre dois textos na mesma linha (ex.: `"UMADGOV 2026 | Vós sois geração eleita"`, `"Centro | Governador Valadares/MG"`).
- **Placeholder de valor ausente:** use `—` (travessão), não `|`, quando não há nenhum texto ao lado (ex.: `FORMA_PAGAMENTO_LABELS[x] || '—'`) — um `|` sozinho, sem texto adjacente, é visualmente ambíguo (parece erro de renderização). O `|` é só para separar dois textos existentes, nunca para representar "vazio".

---

## 11. Padrões de Componentes

- **`components/ui/`** — design system genérico e sem conhecimento de domínio (Button, Input, Select, Modal, Card, Badge, `SelectableCards`). Qualquer novo padrão de seleção/exibição reutilizável deve nascer aqui, não duplicado dentro de uma feature.
  - `SelectableCards`: grade de cards com rádio nativo (`sr-only` + `register` do react-hook-form), borda/ícone/texto destacados quando selecionado. Usado hoje para o modelo da camisa; é o padrão a seguir para qualquer nova escolha de opção única no formulário.
- **`components/{home,order,admin,layout,auth}/`** — componentes com conhecimento de domínio, organizados por área da aplicação, não por tipo técnico.
- **`services/`** — única camada que importa `@/lib/supabase`. Todo serviço segue o padrão:
  ```js
  if (isSupabaseConfigured) { /* chama Supabase */ }
  /* senão, opera sobre o array em memória `localOrders` */
  ```
  Isso garante que o site sempre funcione (com dados de exemplo) mesmo sem credenciais configuradas.
- **`hooks/`** — encapsulam chamadas de serviço + estado de loading/erro + toast de feedback, para as páginas não repetirem esse boilerplate (`useOrders`, `useUpload`).
- **`context/`** — só para estado verdadeiramente global (sessão do admin, pedido em andamento). Estado de formulário/UI local fica no componente, nunca sobe para Context sem necessidade.
- **Variantes de componente via objeto de mapeamento**, não `if/else` encadeado — ver `Button.jsx` (`variants`, `sizes`), `Badge.jsx` (`colorMap`). Ao adicionar uma nova variante, adicione uma entrada no objeto.

---

## 12. Regras de Negócio

1. **Preço fixo:** R$ 50,00 por camisa, qualquer modelo/tamanho (`SHIRT_PRICE` em `mockOrders.js`). `valor = quantidade × 50`.
2. **Modelos disponíveis:** Masculino, Baby Look, Infantil — escolha obrigatória, é a primeira etapa do formulário.
3. **Tamanhos disponíveis:** P, M, G, GG, XG (mesmos para todos os modelos hoje).
4. **Pagamento exclusivo via PIX** — não há mais cartão de crédito/débito na interface nem no schema atual.
5. **Comprovante de pagamento é opcional.** Não bloqueia criação, visualização, consulta pública ou gerenciamento administrativo do pedido. Serve só de apoio à conferência manual; é o campo que uma futura integração de Gateway PIX tornará dispensável na prática (confirmação automática via webhook).
6. **Numeração de pedido é sequencial e imutável**, gerada pelo banco (`UMD-2026-XXXX`), nunca pelo front-end quando Supabase está configurado.
7. **Consulta de pedido é pública** — qualquer pessoa com o número do pedido consulta o status em `/consulta`, sem login (por design: é o cliente final consultando o próprio pedido).
8. **Painel administrativo é restrito** a usuários com `role = admin` ou `role = moderador` na tabela `profiles`; qualquer outro usuário autenticado é redirecionado para a home.
9. **Exclusão de pedidos/comprovantes** só é permitida para `admin`/`moderador` autenticado (garantido por RLS no banco, não só na interface).
10. **Status muda em uma via só para trás→frente pelo fluxo natural**, mas o admin pode setar manualmente qualquer status a qualquer momento pelo `OrderDetailModal` (não há máquina de estados travada no código, a ordem descrita na seção 4 é a esperada, não a única tecnicamente possível).
