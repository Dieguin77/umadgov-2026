# UMADGOV 2026

Sistema Web de encomenda da camisa oficial da UMADGOV 2026, com pagamento via PIX e painel administrativo para acompanhamento dos pedidos.

---

## Tecnologias

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase (banco de dados, autenticação e storage)
- Vercel

---

## Funcionalidades

- Pedido do cliente com modelo, tamanho e quantidade da camisa
- Geração de QR Code PIX (payload EMV/BR Code) direto no navegador, sem depender de gateway de pagamento externo
- Upload opcional de comprovante de pagamento
- Consulta pública do status do pedido
- Painel administrativo com autenticação (Supabase Auth) e controle de acesso por perfil (admin / moderador), protegido por Row Level Security
- Gestão de pedidos: conferência de comprovante, atualização de status e exclusão

---

## Projeto Online

https://umadgov-2026.vercel.app

---

## Desenvolvedor

**Diego Batista Gomes Moraes**

GitHub: https://github.com/Dieguin77

Portfólio: https://diegodev.dev.br
