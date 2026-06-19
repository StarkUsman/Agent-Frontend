import { MdClose, MdOutlineDeleteOutline } from 'react-icons/md'

interface DeleteConfirmModalProps {
  title:       string
  description: string
  onConfirm:   () => void
  onCancel:    () => void
  loading?:    boolean
}

const DeleteConfirmModal = ({
  title,
  description,
  onConfirm,
  onCancel,
  loading = false,
}: DeleteConfirmModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    />

    {/* Modal */}
    <div className="relative z-10 w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">

      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-red-50 dark:bg-red-900/30 shrink-0">
            <MdOutlineDeleteOutline className="text-xl text-red-500 dark:text-red-400" />
          </span>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h2>
        </div>
        <button
          onClick={onCancel}
          disabled={loading}
          className="p-1.5 -mr-1.5 -mt-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-40 transition-colors cursor-pointer"
        >
          <MdClose className="text-lg" />
        </button>
      </div>

      {/* Body */}
      <p className="px-6 pb-6 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        {description}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3 px-6 pb-6">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {loading ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
)

export default DeleteConfirmModal
