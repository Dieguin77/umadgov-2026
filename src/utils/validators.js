export const validators = {
  required: (msg = 'Campo obrigatório') => ({
    required: msg,
  }),

  name: {
    required: 'Nome completo é obrigatório',
    minLength: { value: 3, message: 'Nome deve ter pelo menos 3 caracteres' },
    pattern: {
      value: /^[A-Za-zÀ-ÿ\s]+$/,
      message: 'Nome deve conter apenas letras',
    },
  },

  phone: {
    required: 'Telefone é obrigatório',
    pattern: {
      value: /^\(\d{2}\) \d{4,5}-\d{4}$/,
      message: 'Telefone inválido. Ex: (33) 99999-9999',
    },
  },

  congregation: {
    required: 'Congregação é obrigatória',
    minLength: { value: 2, message: 'Congregação muito curta' },
  },

  size: {
    required: 'Selecione um tamanho',
  },

  quantity: {
    required: 'Quantidade é obrigatória',
    min: { value: 1, message: 'Mínimo 1 camisa' },
    max: { value: 20, message: 'Máximo 20 camisas por pedido' },
  },

  password: {
    required: 'Senha é obrigatória',
    minLength: { value: 6, message: 'Senha deve ter pelo menos 6 caracteres' },
  },
}

const FALLBACK_MIME_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  pdf: 'application/pdf',
}

const getFileMimeType = (file) => {
  if (file.type) return file.type
  const extension = file.name.split('.').pop().toLowerCase()
  return FALLBACK_MIME_TYPES[extension] || ''
}

export const validateFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
  const maxSize = 10 * 1024 * 1024 // 10MB
  const fileType = getFileMimeType(file)

  if (!allowedTypes.includes(fileType)) {
    return 'Arquivo inválido. Aceitos: JPG, JPEG, PNG, PDF'
  }

  if (file.size > maxSize) {
    return 'Arquivo muito grande. Máximo 10MB'
  }

  return null
}
