import type { Node, Edge } from '@xyflow/react'
import type { FlowFunction, FnProperty } from '../components/flow/inspector/FunctionsTab'
import type { Action } from '../components/flow/inspector/ActionsTab'
import type { Msg } from '../components/flow/NodeInspector'

// ── Pipecat flow JSON schema types ─────────────────────────────────────────

export interface PipecatPropertySchema {
  type: string
  description: string
  enum?: string[]
  pattern?: string
}

export interface PipecatFunctionDef {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: {
      type: 'object'
      properties: Record<string, PipecatPropertySchema>
      required: string[]
    }
    transition_to?: string
  }
}

export type PipecatAction =
  | { type: 'end_conversation' }
  | { type: 'tts_say'; text: string }
  | { type: 'function'; handler: string }

export interface PipecatNodeConfig {
  role_messages?: { role: string; content: string }[]
  task_messages?: { role: string; content: string }[]
  functions?: PipecatFunctionDef[]
  pre_actions?: PipecatAction[]
  post_actions?: PipecatAction[]
  context_strategy?: string
  respond_immediately?: boolean
}

export interface PipecatFlow {
  initial_node: string
  nodes: Record<string, PipecatNodeConfig>
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

// ── Action serialization ───────────────────────────────────────────────────

function toActionPipecat(action: Action): PipecatAction | null {
  switch (action.type) {
    case 'end_conversation':
      return { type: 'end_conversation' }
    case 'tts_say':
      return { type: 'tts_say', text: action.handler }
    case 'function':
      return action.handler ? { type: 'function', handler: action.handler } : null
    default:
      return null
  }
}

// ── Property serialization ─────────────────────────────────────────────────

function toPropertySchema(prop: FnProperty): PipecatPropertySchema {
  const schema: PipecatPropertySchema = {
    type: prop.type,
    description: prop.name,
  }
  if (prop.validation === 'enum' && prop.enumValues) {
    const enums = prop.enumValues
      .split(/[\n,]+/)
      .map((v) => v.trim())
      .filter(Boolean)
    if (enums.length > 0) schema.enum = enums
  } else if (prop.validation === 'pattern' && prop.pattern) {
    schema.pattern = prop.pattern
  }
  return schema
}

// ── Function serialization ─────────────────────────────────────────────────

function toFunctionPipecat(
  fn: FlowFunction,
  nodeIdToKey: Map<string, string>,
): PipecatFunctionDef {
  const namedProps = asArray<FnProperty>(fn.properties).filter((p) => p.name)
  const requiredProps = namedProps.filter((p) => p.required)

  const properties: Record<string, PipecatPropertySchema> = {}
  for (const prop of namedProps) {
    properties[prop.name] = toPropertySchema(prop)
  }

  const transitionTo = fn.next_node ? nodeIdToKey.get(fn.next_node) : undefined

  const funcDef: PipecatFunctionDef['function'] = {
    name: fn.name,
    description: fn.description,
    parameters: {
      type: 'object',
      properties,
      required: requiredProps.map((p) => p.name),
    },
  }
  if (transitionTo) funcDef.transition_to = transitionTo

  return { type: 'function', function: funcDef }
}

// ── Main export ────────────────────────────────────────────────────────────

export function flowToJson(nodes: Node[], _edges: Edge[]): PipecatFlow {
  // Assign a unique snake_case key to every node
  const usedKeys = new Set<string>()
  const nodeIdToKey = new Map<string, string>()
  for (const node of nodes) {
    const label = (node.data?.label as string | undefined) ?? 'node'
    nodeIdToKey.set(node.id, uniqueKey(toSnakeCase(label), usedKeys))
  }

  const initialNode = nodes.find((n) => n.type === 'initial')
  const initialKey  = initialNode ? nodeIdToKey.get(initialNode.id) ?? 'initial' : 'initial'

  const pipecatNodes: Record<string, PipecatNodeConfig> = {}

  for (const node of nodes) {
    const key = nodeIdToKey.get(node.id)!

    const functions       = asArray<FlowFunction>(node.data?.functions).filter((fn) => fn.name)
    const preActions      = asArray<Action>(node.data?.pre_actions)
    const postActions     = asArray<Action>(node.data?.post_actions)
    const roleMessages    = asArray<Msg>(node.data?.role_messages)
    const taskMessagesRaw = asArray<Msg>(node.data?.task_messages)
    const instructions    = (node.data?.instructions as string | undefined) ?? ''

    // Prefer explicit task_messages; fall back to instructions field
    const taskMessages: { role: string; content: string }[] =
      taskMessagesRaw.length > 0
        ? taskMessagesRaw
        : instructions
        ? [{ role: 'system', content: instructions }]
        : []

    // End nodes always carry end_conversation in post_actions
    const effectivePost = [...postActions]
    if (node.type === 'end' && !effectivePost.some((a) => a.type === 'end_conversation')) {
      effectivePost.push({ id: 'auto-end', type: 'end_conversation', handler: '' })
    }

    const pipecatFunctions   = functions.map((fn) => toFunctionPipecat(fn, nodeIdToKey))
    const pipecatPreActions  = preActions.map(toActionPipecat).filter((a): a is PipecatAction => a !== null)
    const pipecatPostActions = effectivePost.map(toActionPipecat).filter((a): a is PipecatAction => a !== null)

    const nodeConfig: PipecatNodeConfig = {}
    if (roleMessages.length > 0)          nodeConfig.role_messages      = roleMessages
    if (taskMessages.length > 0)          nodeConfig.task_messages      = taskMessages
    if (pipecatFunctions.length > 0)      nodeConfig.functions          = pipecatFunctions
    if (pipecatPreActions.length > 0)     nodeConfig.pre_actions        = pipecatPreActions
    if (pipecatPostActions.length > 0)    nodeConfig.post_actions       = pipecatPostActions
    if (node.data?.contextStrategy && node.data.contextStrategy !== 'APPEND') {
      nodeConfig.context_strategy = node.data.contextStrategy as string
    }
    if (node.data?.respondImmediately === true) {
      nodeConfig.respond_immediately = true
    }

    pipecatNodes[key] = nodeConfig
  }

  return { initial_node: initialKey, nodes: pipecatNodes }
}
