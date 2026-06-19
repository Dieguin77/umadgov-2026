import { forwardRef } from 'react'

const Input = forwardRef(function Input({
  label,
  error,
  helper,
  className = '',
  icon: Icon,
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
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-lavanda-400">
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          {...props}
          className={`
            w-full rounded-xl border-2 bg-white px-4 py-3 text-lavanda-900
            placeholder:text-lavanda-300 transition-all duration-200
            focus:outline-none focus:border-lavanda-500 focus:ring-2 focus:ring-lavanda-100
            ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-lavanda-200'}
            ${Icon ? 'pl-10' : ''}
            ${className}
          `}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {helper && !error && <p className="text-lavanda-400 text-sm">{helper}</p>}
    </div>
  )
})

export default Input
