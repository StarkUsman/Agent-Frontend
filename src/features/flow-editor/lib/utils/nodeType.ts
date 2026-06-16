/**
 * Derives the node type from the node data based on its current state.
 * - If a node is explicitly marked as an HTTP request node, it's "http_request".
 * - If a node has post_actions with type "end_conversation", it's an "end" node.
 * - If a node has role_messages, it's an "initial" node.
 * - Otherwise, it's a "node".
 */
export function deriveNodeType(
  data: Record<string, unknown> | undefined,
  _originalType?: string
): string {
  if (!data) {
    return "node";
  }

  // Explicit HTTP request node marker takes priority (it still serializes to a
  // normal Pipecat node — the marker only selects the editor UI / visual).
  if (data.node_kind === "http_request") {
    return "http_request";
  }

  // Check for end node (has post_actions with end_conversation)
  const postActions = (data.post_actions as Array<{ type?: string }> | undefined) ?? [];
  const hasEndConversation = postActions.some((action) => action.type === "end_conversation");

  if (hasEndConversation) {
    return "end";
  }

  // Check for initial node (has role_messages)
  const roleMessages = (data.role_messages as unknown[] | undefined) ?? [];
  if (roleMessages.length > 0) {
    return "initial";
  }

  // Default to node
  return "node";
}

