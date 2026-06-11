import EditorShell from '../features/flow-editor/components/EditorShell'
import '../features/flow-editor/styles/globals.css'

const FlowEditorPage = () => {
  return (
    <div className="fixed inset-0 bg-background">
      <EditorShell />
    </div>
  )
}

export default FlowEditorPage
