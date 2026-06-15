import { useParams } from 'react-router-dom'
import EditorShell from '../features/flow-editor/components/EditorShell'
import '../features/flow-editor/styles/globals.css'

const FlowEditorPage = () => {
  const { id } = useParams<{ id: string }>()
  return (
    <div className="fixed inset-0 bg-background">
      <EditorShell agentId={id} />
    </div>
  )
}

export default FlowEditorPage
