import { forwardRef } from 'react'

const Select = forwardRef(function Select({
  label,
  error,
  helper,
  options = [],
  placeholder = 'Selecione...',
  className = '',
  ...props
}, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-lavanda-900">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        {...props}
        className={`
          w-full rounded-xl border-2 bg-white px-4 py-3 text-lavanda-900
          transition-all duration-200 appearance-none cursor-pointer
          focus:outline-none focus:border-lavanda-500 focus:ring-2 focus:ring-lavanda-100
          ${error ? 'border-red-400 focus:border-red-500' : 'border-lavanda-200'}
          ${props.value === '' ? 'text-lavanda-300' : 'text-lavanda-900'}
          ${className}
        `}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {helper && !error && <p className="text-lavanda-400 text-sm">{helper}</p>}
    </div>
  )
})

export default Select
