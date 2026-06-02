import type { AgentDraft } from '../../pages/CreateAgentPage'

interface Props {
  draft:    AgentDraft
  onChange: (patch: Partial<AgentDraft>) => void
}

// ── Reusable card shell ────────────────────────────────────────────────────
const Card = ({ title, subtitle, children }: {
  title:    string
  subtitle: string
  children: React.ReactNode
}) => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
    </div>
    <div className="px-6 py-5 space-y-5">{children}</div>
  </div>
)

// ── Field wrapper ──────────────────────────────────────────────────────────
const Field = ({ label, required, helper, children }: {
  label:     string
  required?: boolean
  helper?:   string
  children:  React.ReactNode
}) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {helper && <p className="text-xs text-slate-400 mt-1.5">{helper}</p>}
  </div>
)

const textareaClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 ' +
  'placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 ' +
  'focus:border-indigo-400 transition resize-y'

// ── Step component ─────────────────────────────────────────────────────────
const Step4Behaviour = ({ draft, onChange }: Props) => (
  <div className="max-w-2xl space-y-4">

    {/* Card 1 — Opening greeting */}
    <Card
      title="What should the agent say to greet callers?"
      subtitle="This is the first thing callers hear when your agent picks up."
    >
      <Field label="Opening greeting" required>
        <textarea
          value={draft.openingGreeting}
          onChange={(e) => onChange({ openingGreeting: e.target.value })}
          placeholder="Hello! Thank you for calling. My name is Clara and I'm here to help you today. What can I do for you?"
          rows={4}
          className={textareaClass}
        />
      </Field>
    </Card>

    {/* Card 2 — Topics */}
    <Card
      title="What topics can this agent discuss?"
      subtitle="Give examples to help the agent understand what it should and shouldn't handle."
    >
      <Field
        label="Topics this agent handles"
        required
        helper="Enter each topic on a new line."
      >
        <textarea
          value={draft.topicsHandled}
          onChange={(e) => onChange({ topicsHandled: e.target.value })}
          placeholder={
            'Billing questions and invoice queries\n' +
            'Account management and password resets\n' +
            'Order status and delivery enquiries\n' +
            'Product information'
          }
          rows={5}
          className={textareaClass}
        />
      </Field>

      <Field
        label="Topics to avoid"
        helper="The agent will politely decline and offer to transfer if these come up."
      >
        <textarea
          value={draft.topicsToAvoid}
          onChange={(e) => onChange({ topicsToAvoid: e.target.value })}
          placeholder="e.g. Legal advice, medical questions, complaints about staff..."
          rows={4}
          className={textareaClass}
        />
      </Field>
    </Card>

  </div>
)

export default Step4Behaviour
