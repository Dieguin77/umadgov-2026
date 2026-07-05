import { Check } from 'lucide-react'

export default function SelectableCards({ options, register, name, validation, watchValue, error }) {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map(opt => {
          const selected = watchValue === opt.value
          return (
            <label
              key={opt.value}
              className={`relative flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selected
                  ? `${opt.border} ${opt.bg}`
                  : 'border-lavanda-100 hover:border-lavanda-300 bg-white'
              }`}
            >
              <input
                type="radio"
                value={opt.value}
                {...register(name, validation)}
                className="sr-only"
              />
              <opt.icon
                size={22}
                className={selected ? opt.color : 'text-lavanda-300'}
              />
              <span className={`font-bold text-sm ${selected ? 'text-lavanda-900' : 'text-lavanda-500'}`}>
                {opt.label}
              </span>
              {opt.desc && (
                <span className={`text-xs text-center leading-tight ${selected ? 'text-lavanda-600' : 'text-lavanda-400'}`}>
                  {opt.desc}
                </span>
              )}
              {selected && (
                <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center ${opt.border.replace('border-', 'bg-')}`}>
                  <Check size={11} className="text-white" />
                </div>
              )}
            </label>
          )
        })}
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
    </div>
  )
}
