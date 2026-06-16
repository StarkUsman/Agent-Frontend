interface Step {
  number: number
  label: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (stepNumber: number) => void
  isClickable?: (stepNumber: number) => boolean
}

const StepIndicator = ({ steps, currentStep, onStepClick, isClickable }: StepIndicatorProps) => (
  <div className="flex items-center px-8 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
    {steps.map((step, i) => {
      const done      = step.number < currentStep
      const active    = step.number === currentStep
      const clickable = done || (step.number !== currentStep && (isClickable?.(step.number) ?? false))
      return (
        <div key={step.number} className="flex items-center">
          <div
            onClick={() => clickable && onStepClick?.(step.number)}
            className={`flex items-center gap-2 ${clickable ? 'cursor-pointer group' : ''}`}
          >
            <div
              className={`
                w-7 h-7 rounded-full border-2 flex items-center justify-center
                text-xs font-semibold transition-all shrink-0
                ${done || active
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : clickable
                    ? 'bg-white dark:bg-slate-800 border-indigo-400 text-indigo-400'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500'}
                ${clickable ? 'group-hover:bg-indigo-500 group-hover:border-indigo-500 group-hover:text-white' : ''}
              `}
            >
              {done ? '✓' : step.number}
            </div>
            <span
              className={`text-sm whitespace-nowrap ${
                active    ? 'font-semibold text-slate-800 dark:text-slate-100'
                : done    ? 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                : clickable ? 'text-indigo-400 group-hover:text-indigo-600'
                :           'text-slate-400 dark:text-slate-500'
              }`}
            >
              {step.label}
            </span>
          </div>

          {/* Connector line */}
          {i < steps.length - 1 && (
            <div
              className={`h-px w-16 mx-4 shrink-0 ${
                done ? 'bg-indigo-400' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          )}
        </div>
      )
    })}
  </div>
)

export default StepIndicator
