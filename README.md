# UMADGOV 2026

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth%20%2B%20Storage-3ECF8E?logo=supabase&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)
![Deploy](https://img.shields.io/badge/deploy-Vercel-000000?logo=vercel&logoColor=white)

Sistema web de encomenda da camisa oficial da UMADGOV 2026, com pagamento via PIX e painel administrativo para acompanhamento dos pedidos.

## 🌐 Projeto Online

https://umadgov.com.br

## Funcionalidades

- **Pedido do cliente** em fluxo guiado de 5 etapas: modelo da camisa (Masculino / Baby Look / Infantil), tamanho e quantidade, dados pessoais, forma de pagamento e resumo final
- **Geração de QR Code PIX no navegador**: o payload EMV/BR Code (padrão Banco Central) é montado e validado (CRC16) inteiramente no front-end — sem depender de gateway de pagamento externo
- **Upload opcional de comprovante** de pagamento, usado apenas como apoio à conferência manual da equipe
- **Consulta pública do status do pedido** por número (`UMD-2026-XXXX`), sem necessidade de login
- **Painel administrativo** autenticado (Supabase Auth), com controle de acesso por perfil (`admin` / `moderador`)
- **Numeração de pedido automática e sequencial**, gerada por trigger no Postgres
- **Row Level Security (RLS)** protegendo todas as tabelas e o storage de comprovantes no banco

## Tecnologias

- **Frontend**: React 19 + Vite 7 + Tailwind CSS + React Router + React Hook Form + Framer Motion
- **Backend as a Service**: Supabase (Postgres, Auth, Storage) — não há back-end próprio; o front-end fala diretamente com o Supabase via SDK, protegido por Row Level Security
- **Hospedagem**: Vercel, com deploy automático a cada push na branch `main`

## Arquitetura

```
Navegador (React SPA)
  pages/        → uma página por rota (Home, Pedido, Pagamento, Consulta, Admin, Login)
    ↓
  components/   → ui/ (design system genérico) + home/, order/, admin/, layout/, auth/ (por domínio)
    ↓
  hooks/ + context/ → useOrders, useUpload · AuthContext, OrderContext
    ↓
  services/     → única camada que fala com o Supabase (orderService, uploadService)
    ↓
  Supabase (nuvem) → Postgres (tabela pedidos/profiles) · Auth (login admin) · Storage (comprovantes)
```

- **Geração do PIX**: `src/utils/pixPayload.js` monta o payload EMV/BR Code do zero (sem gateway), usado tanto no QR Code visual (`qrcode.react`) quanto no "Copia e Cola" — a mesma string alimenta os dois, garantindo que nunca divirjam.
- **Modo mock**: se as credenciais do Supabase não estiverem configuradas, os serviços caem automaticamente para dados em memória — o site funciona localmente sem exigir acesso ao banco de produção (os dados não persistem entre recargas).
- **Estado global**: apenas dois React Contexts (`AuthContext`, `OrderContext`) — sem Redux/Zustand.

## Instalação Local

1. Clone o repositório:
```bash
git clone https://github.com/Dieguin77/umadgov-2026.git
cd umadgov-2026
```

2. Instale as dependências:
```bash
npm install
```

3. Copie o arquivo de variáveis de ambiente e preencha com suas próprias credenciais do Supabase:
```bash
cp .env.example .env.local
```

4. Rode em modo desenvolvimento:
```bash
npm run dev
```

> Sem `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` configuradas, o site roda normalmente com dados de exemplo em memória.

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `VITE_SUPABASE_URL` | Sim, para dados reais | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Sim, para dados reais | Chave anônima/publicável (protegida por RLS) |
| `VITE_SUPABASE_STORAGE_BUCKET` | Não | Bucket de comprovantes (padrão: `comprovantes`) |
| `VITE_WHATSAPP_NUMBER` | Não | Número exibido no botão de WhatsApp |
| `VITE_INSTAGRAM_USER` | Não | Usuário do Instagram exibido no rodapé |
| `VITE_SHIRT_PRICE` | Não | Preço unitário da camisa |

## Estrutura do Banco de Dados

### Tabela: `pedidos`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador (chave primária) |
| numeroPedido | TEXT | Gerado automaticamente pelo banco (`UMD-2026-XXXX`) |
| nome, telefone, congregacao | TEXT | Dados do cliente |
| shirtModel | TEXT | `masculino` \| `baby_look` \| `infantil` |
| tamanho | TEXT | `P` \| `M` \| `G` \| `GG` \| `XG` |
| quantidade | INTEGER | > 0 |
| valor | NUMERIC | `quantidade × preço unitário` |
| status | TEXT | `aguardando_pagamento` → `comprovante_enviado` → `pagamento_aprovado` → `separado_retirada` → `entregue` |
| comprovante | TEXT (nullable) | Caminho do arquivo no bucket de storage |

### Tabela: `profiles`

Perfil de cada usuário autenticado (`admin` / `moderador` / `user`), criado automaticamente via trigger ao cadastro no Supabase Auth.

RLS ativado em `profiles`, `pedidos` e `storage.objects` — políticas completas em `supabase-setup.sql`.

## Regras de Negócio

- Pagamento exclusivo via PIX
- Comprovante de pagamento é **opcional** — não bloqueia criação, consulta ou gerenciamento do pedido, serve apenas de apoio à conferência manual
- Consulta de pedido é pública (sem login) — o painel administrativo é restrito a `admin`/`moderador`
- Exclusão de pedidos/comprovantes só é permitida para usuários autenticados com perfil `admin`/`moderador`, garantido por RLS no banco

## Licença

Este projeto está sob a licença MIT — veja o arquivo [LICENSE](LICENSE) para detalhes.

## Desenvolvedor

**Diego Batista Gomes Moraes**

GitHub: https://github.com/Dieguin77

Portfólio: https://diegodev.dev.br
