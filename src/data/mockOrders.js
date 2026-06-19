import { formatOrderNumber } from '@/utils/formatters'

export const STATUS = {
  AGUARDANDO_PAGAMENTO: 'aguardando_pagamento',
  COMPROVANTE_ENVIADO: 'comprovante_enviado',
  PAGAMENTO_APROVADO: 'pagamento_aprovado',
  SEPARADO_RETIRADA: 'separado_retirada',
  ENTREGUE: 'entregue',
}

export const STATUS_LABELS = {
  [STATUS.AGUARDANDO_PAGAMENTO]: 'Aguardando Pagamento',
  [STATUS.COMPROVANTE_ENVIADO]: 'Comprovante Enviado',
  [STATUS.PAGAMENTO_APROVADO]: 'Pagamento Aprovado',
  [STATUS.SEPARADO_RETIRADA]: 'Separado para Retirada',
  [STATUS.ENTREGUE]: 'Entregue',
}

export const STATUS_COLORS = {
  [STATUS.AGUARDANDO_PAGAMENTO]: 'yellow',
  [STATUS.COMPROVANTE_ENVIADO]: 'blue',
  [STATUS.PAGAMENTO_APROVADO]: 'green',
  [STATUS.SEPARADO_RETIRADA]: 'purple',
  [STATUS.ENTREGUE]: 'gray',
}

export const SHIRT_SIZES = ['P', 'M', 'G', 'GG', 'XG']
export const SHIRT_PRICE = 50

export const mockOrders = [
  {
    id: 'order_1748480000_abc1234',
    numeroPedido: formatOrderNumber(1),
    nome: 'Ana Paula Rodrigues',
    telefone: '(33) 99918-6633',
    congregacao: 'Sede Central',
    tamanho: 'M',
    quantidade: 2,
    valor: 100,
    status: STATUS.PAGAMENTO_APROVADO,
    comprovante: 'comprovantes/UMD-2026-0001-pix.jpg',
    comprovanteAt: '2026-06-01T15:10:00.000Z',
    createdAt: '2026-06-01T14:30:00.000Z',
  },
  {
    id: 'order_1748480001_abc5678',
    numeroPedido: formatOrderNumber(2),
    nome: 'Carlos Eduardo Santos',
    telefone: '(33) 99106-0488',
    congregacao: 'Congregação Norte',
    tamanho: 'G',
    quantidade: 1,
    valor: 50,
    status: STATUS.COMPROVANTE_ENVIADO,
    comprovante: 'comprovantes/UMD-2026-0002-pix.jpg',
    comprovanteAt: '2026-06-02T10:00:00.000Z',
    createdAt: '2026-06-02T09:15:00.000Z',
  },
  {
    id: 'order_1748480002_abc9012',
    numeroPedido: formatOrderNumber(3),
    nome: 'Maria Fernanda Lima',
    telefone: '(33) 98800-1234',
    congregacao: 'Congregação Sul',
    tamanho: 'P',
    quantidade: 3,
    valor: 150,
    status: STATUS.AGUARDANDO_PAGAMENTO,
    comprovante: null,
    comprovanteAt: null,
    createdAt: '2026-06-03T16:45:00.000Z',
  },
  {
    id: 'order_1748480003_abc3456',
    numeroPedido: formatOrderNumber(4),
    nome: 'João Pedro Alves',
    telefone: '(33) 97700-5678',
    congregacao: 'Sede Central',
    tamanho: 'GG',
    quantidade: 2,
    valor: 100,
    status: STATUS.SEPARADO_RETIRADA,
    comprovante: 'comprovantes/UMD-2026-0004-pix.pdf',
    comprovanteAt: '2026-06-04T11:00:00.000Z',
    createdAt: '2026-06-04T10:00:00.000Z',
  },
  {
    id: 'order_1748480004_abc7890',
    numeroPedido: formatOrderNumber(5),
    nome: 'Beatriz Oliveira',
    telefone: '(33) 96600-9012',
    congregacao: 'Congregação Leste',
    tamanho: 'XG',
    quantidade: 1,
    valor: 50,
    status: STATUS.ENTREGUE,
    comprovante: 'comprovantes/UMD-2026-0005-pix.jpg',
    comprovanteAt: '2026-06-05T09:00:00.000Z',
    createdAt: '2026-06-05T08:20:00.000Z',
  },
  {
    id: 'order_1748480005_abc2345',
    numeroPedido: formatOrderNumber(6),
    nome: 'Rodrigo Ferreira Costa',
    telefone: '(33) 95500-3456',
    congregacao: 'Congregação Oeste',
    tamanho: 'G',
    quantidade: 4,
    valor: 200,
    status: STATUS.AGUARDANDO_PAGAMENTO,
    comprovante: null,
    comprovanteAt: null,
    createdAt: '2026-06-06T13:30:00.000Z',
  },
  {
    id: 'order_1748480006_abc6789',
    numeroPedido: formatOrderNumber(7),
    nome: 'Larissa Mendes Souza',
    telefone: '(33) 94400-7890',
    congregacao: 'Sede Central',
    tamanho: 'M',
    quantidade: 1,
    valor: 50,
    status: STATUS.PAGAMENTO_APROVADO,
    comprovante: 'comprovantes/UMD-2026-0007-pix.png',
    comprovanteAt: '2026-06-07T12:00:00.000Z',
    createdAt: '2026-06-07T11:10:00.000Z',
  },
  {
    id: 'order_1748480007_abc0123',
    numeroPedido: formatOrderNumber(8),
    nome: 'Felipe Nascimento',
    telefone: '(33) 93300-1234',
    congregacao: 'Congregação Norte',
    tamanho: 'G',
    quantidade: 2,
    valor: 100,
    status: STATUS.COMPROVANTE_ENVIADO,
    comprovante: 'comprovantes/UMD-2026-0008-pix.jpg',
    comprovanteAt: '2026-06-08T16:00:00.000Z',
    createdAt: '2026-06-08T15:00:00.000Z',
  },
]

export const getMockDashboardStats = () => {
  const total = mockOrders.length
  const totalVendido = mockOrders.reduce((sum, o) => sum + o.quantidade, 0)
  const aguardandoPagamento = mockOrders.filter(o => o.status === STATUS.AGUARDANDO_PAGAMENTO).length
  const comprovantesEnviados = mockOrders.filter(o => o.comprovante !== null).length
  const aprovados = mockOrders.filter(o =>
    o.status === STATUS.PAGAMENTO_APROVADO ||
    o.status === STATUS.SEPARADO_RETIRADA ||
    o.status === STATUS.ENTREGUE
  ).length
  const receitaTotal = mockOrders.reduce((sum, o) => sum + o.valor, 0)

  return { total, totalVendido, aguardandoPagamento, comprovantesEnviados, aprovados, receitaTotal }
}
