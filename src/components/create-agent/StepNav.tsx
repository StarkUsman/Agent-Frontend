import { MdArrowBack, MdArrowForward, MdCheck } from 'react-icons/md'

export interface StepNavProps {
  onBack?:     () => void
  onContinue:  () => void
  canContinue: boolean
  isFinalStep: boolean
  submitting?: boolean
}

const StepNav = ({ onBack, onContinue, canContinue, isFinalStep, submitting }: StepNavProps) => (
  <div className="flex items-center justify-end gap-3 rounded-2xl pt-2 mt-2">
    {onBack ? (
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
      >
        <MdArrowBack className="text-base" />
        Back
      </button>
    ) : (
      <div />
    )}

    <button
      onClick={onContinue}
      disabled={!canContinue || !!submitting}
      className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
      style={{ backgroundColor: '#6366f1' }}
    >
      {isFinalStep ? (
        <>
          <MdCheck className="text-base" />
          {submitting ? 'Creating…' : 'Create agent'}
        </>
      ) : (
        <>
          Continue
          <MdArrowForward className="text-base" />
        </>
      )}
    </button>
  </div>
)

export default StepNav
