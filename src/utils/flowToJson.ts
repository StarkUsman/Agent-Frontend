import type { Node, Edge } from '@xyflow/react'
import type { FlowFunction, FnProperty } from '../components/flow/inspector/FunctionsTab'
import type { Action } from '../components/flow/inspector/ActionsTab'
import type { Msg } from '../components/flow/NodeInspector'

// ── Official Pipecat editor JSON schema types ──────────────────────────────

export interface PipecatPropertySchema {
  type: string
  description?: string
  enum?: string[]
  pattern?: string
}

export interface PipecatFunction {
  name: string
  description: string
  properties?: Record<string, PipecatPropertySchema>
  required?: string[]
  next_node_id?: string
}

export type PipecatAction =
  | { type: 'end_conversation' }
  | { type: 'tts_say'; text: string }
  | { type: 'function'; handler: string }

export interface PipecatNodeData {
  label: string
  type: string
  role_messages?: { role: string; content: string }[]
  task_messages?: { role: string; content: string }[]
  functions?: PipecatFunction[]
  pre_actions?: PipecatAction[]
  post_actions?: PipecatAction[]
  context_strategy?: string
  respond_immediately?: boolean
}

export interface PipecatNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: PipecatNodeData
}

export interface PipecatEdge {
  id: string
  source: string
  target: string
  label: string
}

export interface PipecatFlow {
  $id: string
  meta: { name: string; version: string }
  nodes: PipecatNode[]
  edges: PipecatEdge[]
}

// ── Helpers ────────────────────────────────────────────────────────────────

function toSnakeCase(label: string): string {
  return (
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'node'
  )
}

function uniqueKey(base: string, used: Set<string>): string {
  if (!used.has(base)) { used.add(base); return base }
  let i = 2
  while (used.has(`${base}_${i}`)) i++
  const key = `${base}_${i}`
  used.add(key)
  return key
}

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}

// ReactFlow node type → pipecat node type
function toPipecatNodeType(rfType: string | undefined): string {
  if (rfType === 'initial') return 'initial'
  if (rfType === 'end') return 'end'
  return 'node'
}

// ── Action serialization ───────────────────────────────────────────────────

function toActionPipecat(action: Action): PipecatAction | null {
  switch (action.type) {
    case 'end_conversation': return { type: 'end_conversation' }
    case 'tts_say':          return { type: 'tts_say', text: action.handler }
    case 'function':         return action.handler ? { type: 'function', handler: action.handler } : null
    default:                 return null
  }
}

// ── Property serialization ─────────────────────────────────────────────────

function toPropertySchema(prop: FnProperty): PipecatPropertySchema {
  const schema: PipecatPropertySchema = { type: prop.type, description: prop.name }
  if (prop.validation === 'enum' && prop.enumValues) {
    const enums = prop.enumValues.split(/[\n,]+/).map((v) => v.trim()).filter(Boolean)
    if (enums.length > 0) schema.enum = enums
  } else if (prop.validation === 'pattern' && prop.pattern) {
    schema.pattern = prop.pattern
  }
  return schema
}

// ── Function serialization ─────────────────────────────────────────────────

function toFunctionPipecat(fn: FlowFunction, nodeIdToKey: Map<string, string>): PipecatFunction {
  const namedProps    = asArray<FnProperty>(fn.properties).filter((p) => p.name)
  const requiredProps = namedProps.filter((p) => p.required)

  const pipecatFn: PipecatFunction = { name: fn.name, description: fn.description }

  if (namedProps.length > 0) {
    const properties: Record<string, PipecatPropertySchema> = {}
    for (const prop of namedProps) properties[prop.name] = toPropertySchema(prop)
    pipecatFn.properties = properties
  }

  if (requiredProps.length > 0) {
    pipecatFn.required = requiredProps.map((p) => p.name)
  }

  const nextKey = fn.next_node ? nodeIdToKey.get(fn.next_node) : undefined
  if (nextKey) pipecatFn.next_node_id = nextKey

  return pipecatFn
}

// ── Main export ────────────────────────────────────────────────────────────

export function flowToJson(nodes: Node[], _edges: Edge[], agentName = 'Untitled'): PipecatFlow {
  // Assign unique snake_case IDs (used as pipecat node IDs)
  const usedKeys = new Set<string>()
  const nodeIdToKey = new Map<string, string>()
  for (const node of nodes) {
    const label = (node.data?.label as string | undefined) ?? 'node'
    nodeIdToKey.set(node.id, uniqueKey(toSnakeCase(label), usedKeys))
  }

  const pipecatNodes: PipecatNode[] = []
  const pipecatEdges: PipecatEdge[] = []
  const edgeSet = new Set<string>()

  for (const node of nodes) {
    const id       = nodeIdToKey.get(node.id)!
    const nodeType = toPipecatNodeType(node.type)

    const functions       = asArray<FlowFunction>(node.data?.functions).filter((fn) => fn.name)
    const preActions      = asArray<Action>(node.data?.pre_actions)
    const postActions     = asArray<Action>(node.data?.post_actions)
    const roleMessages    = asArray<Msg>(node.data?.role_messages)
    const taskMessagesRaw = asArray<Msg>(node.data?.task_messages)
    const instructions    = (node.data?.instructions as string | undefined) ?? ''

    const taskMessages: { role: string; content: string }[] =
      taskMessagesRaw.length > 0
        ? taskMessagesRaw
        : instructions
        ? [{ role: 'system', content: instructions }]
        : []

    // End nodes always carry end_conversation
    const effectivePost = [...postActions]
    if (node.type === 'end' && !effectivePost.some((a) => a.type === 'end_conversation')) {
      effectivePost.push({ id: 'auto-end', type: 'end_conversation', handler: '' })
    }

    const pipecatFunctions   = functions.map((fn) => toFunctionPipecat(fn, nodeIdToKey))
    const pipecatPreActions  = preActions.map(toActionPipecat).filter((a): a is PipecatAction => a !== null)
    const pipecatPostActions = effectivePost.map(toActionPipecat).filter((a): a is PipecatAction => a !== null)

    const data: PipecatNodeData = {
      label: (node.data?.label as string | undefined) ?? id,
      type: nodeType,
    }
    if (roleMessages.length > 0)       data.role_messages   = roleMessages
    if (taskMessages.length > 0)       data.task_messages   = taskMessages
    if (pipecatFunctions.length > 0)   data.functions       = pipecatFunctions
    if (pipecatPreActions.length > 0)  data.pre_actions     = pipecatPreActions
    if (pipecatPostActions.length > 0) data.post_actions    = pipecatPostActions
    if (node.data?.contextStrategy && node.data.contextStrategy !== 'APPEND') {
      data.context_strategy = node.data.contextStrategy as string
    }
    if (node.data?.respondImmediately === true) {
      data.respond_immediately = true
    }

    pipecatNodes.push({ id, type: nodeType, position: node.position ?? { x: 0, y: 0 }, data })

    // Build edges from function next_node_id references
    for (const fn of pipecatFunctions) {
      if (!fn.next_node_id) continue
      const edgeKey = `${id}-${fn.name}-${fn.next_node_id}`
      if (!edgeSet.has(edgeKey)) {
        edgeSet.add(edgeKey)
        pipecatEdges.push({
          id:     `func-${id}-${fn.name}-${fn.next_node_id}`,
          source: id,
          target: fn.next_node_id,
          label:  fn.name,
        })
      }
    }
  }

  return {
    $id:   'https://flows.pipecat.ai/schema/flow.json',
    meta:  { name: agentName, version: '0.1.0' },
    nodes: pipecatNodes,
    edges: pipecatEdges,
  }
}
