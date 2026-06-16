import type {
  FlowFunctionJson,
  FlowJson,
  FlowNodeJson,
  MessageJson,
} from "@/lib/schema/flow.schema";

function escapePythonString(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

// Placeholder regex: captures the inner expression of any {{ ... }} marker.
const PLACEHOLDER_RE = /\{\{\s*([^}]*?)\s*\}\}/g;

// Map a placeholder's inner text to the Python expression used inside an
// f-string field. Two supported forms:
//   {{ name }}        → this function's own argument variable (a property)
//   {{ state.name }}  → a value saved to flow_manager.state by an earlier node
// Returns null for anything unrecognized (left as literal text).
function placeholderToField(inner: string): string | null {
  const stateMatch = /^state\.([a-zA-Z_][a-zA-Z0-9_]*)$/.exec(inner);
  if (stateMatch) {
    return `flow_manager.state.get('${stateMatch[1]}', '')`;
  }
  if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(inner)) {
    return inner;
  }
  return null;
}

// Convert a user-supplied template into a Python string-literal expression.
// If the template contains recognized {{ placeholders }}, an f-string is
// emitted whose fields reference args or flow_manager.state; otherwise a plain
// double-quoted literal is emitted.
function toPyStringExpr(template: string): string {
  const SENT_OPEN = String.fromCharCode(0);
  const SENT_CLOSE = String.fromCharCode(1);
  let hasField = false;
  let s = template.replace(PLACEHOLDER_RE, (whole, inner) => {
    const field = placeholderToField((inner as string).trim());
    if (field === null) return whole as string; // not a recognized placeholder
    hasField = true;
    // The field expression contains no braces or double quotes, so it survives
    // the escaping pass below untouched.
    return `${SENT_OPEN}${field}${SENT_CLOSE}`;
  });
  if (!hasField) {
    // No placeholders: a JSON string is a valid Python double-quoted literal.
    return JSON.stringify(template);
  }
  // Escape for a double-quoted string.
  s = s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
  // Escape literal braces so the f-string parser ignores them.
  s = s.replace(/\{/g, "{{").replace(/\}/g, "}}");
  // Restore placeholders as real f-string fields.
  s = s.split(SENT_OPEN).join("{").split(SENT_CLOSE).join("}");
  return `f"${s}"`;
}

// Resolve a placeholder's inner text to a Python expression that yields the
// underlying *value* (object-preserving), for use inside a JSON body. Unlike
// placeholderToField (which targets f-string interpolation and stringifies the
// value), this keeps dicts/lists intact so they serialize as real JSON:
//   {{ flow_manager.state }} / {{ state }}              → the whole state dict
//   {{ state.a.b.c }} / {{ flow_manager.state.a.b.c }}  → nested lookup (dot notation)
//   {{ name }}                                          → this function's own argument
// Returns null for anything unrecognized (left as literal text by the caller).
function placeholderToValueExpr(inner: string): { expr: string; needsHelper: boolean } | null {
  const trimmed = inner.trim();
  if (trimmed === "state" || trimmed === "flow_manager.state") {
    return { expr: "flow_manager.state", needsHelper: false };
  }
  const statePath = /^(?:flow_manager\.)?state((?:\.[a-zA-Z_][a-zA-Z0-9_]*)+)$/.exec(trimmed);
  if (statePath) {
    const keys = statePath[1].split(".").filter(Boolean);
    if (keys.length === 1) {
      return { expr: `flow_manager.state.get(${JSON.stringify(keys[0])})`, needsHelper: false };
    }
    const args = keys.map((k) => JSON.stringify(k)).join(", ");
    return { expr: `_get_state(flow_manager.state, ${args})`, needsHelper: true };
  }
  if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed)) {
    return { expr: trimmed, needsHelper: false };
  }
  return null;
}

// Convert a JSON body template (which may contain {{ placeholders }}) into a
// Python expression that evaluates to a JSON-serializable object. A placeholder
// in value position injects the live object; placeholders embedded inside a
// string are interpolated via an f-string. Returns null if the template isn't
// valid JSON, so the caller can fall back to a plain string body.
function jsonBodyToPyExpr(body: string): { expr: string; needsHelper: boolean } | null {
  // Private-use char: valid unescaped inside a JSON string (unlike control
  // chars) and effectively never present in a user-typed body.
  const SENT = String.fromCharCode(0xe000);
  const placeholders: {
    original: string;
    resolved: { expr: string; needsHelper: boolean } | null;
  }[] = [];

  // True if character `offset` in `s` lies inside a JSON string literal.
  const insideString = (s: string, offset: number): boolean => {
    let inStr = false;
    for (let i = 0; i < offset; i++) {
      const ch = s[i];
      if (ch === "\\") {
        i++; // skip the escaped character
        continue;
      }
      if (ch === '"') inStr = !inStr;
    }
    return inStr;
  };

  // Swap each {{...}} for a sentinel so the template parses as valid JSON. A
  // placeholder in value position becomes a quoted sentinel string; one already
  // inside a string literal is inserted bare so we don't create nested quotes.
  const substituted = body.replace(PLACEHOLDER_RE, (whole, inner, offset: number) => {
    const idx = placeholders.length;
    placeholders.push({
      original: whole as string,
      resolved: placeholderToValueExpr((inner as string).trim()),
    });
    const token = `${SENT}${idx}${SENT}`;
    return insideString(body, offset) ? token : JSON.stringify(token);
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(substituted);
  } catch {
    return null;
  }

  let needsHelper = false;
  const tokenRe = () => new RegExp(`${SENT}(\\d+)${SENT}`, "g");
  const escapeF = (str: string) =>
    str
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
      .replace(/\{/g, "{{")
      .replace(/\}/g, "}}");

  const emitString = (str: string): string => {
    const matches = [...str.matchAll(tokenRe())];
    if (matches.length === 0) return JSON.stringify(str);

    // Whole string is exactly one placeholder → inject the value object.
    if (matches.length === 1 && matches[0][0] === str) {
      const ph = placeholders[Number(matches[0][1])];
      if (ph.resolved) {
        if (ph.resolved.needsHelper) needsHelper = true;
        return ph.resolved.expr;
      }
      return JSON.stringify(ph.original);
    }

    // No recognized fields → restore the literal placeholder text.
    if (!matches.some((m) => placeholders[Number(m[1])].resolved)) {
      return JSON.stringify(str.replace(tokenRe(), (_t, i) => placeholders[Number(i)].original));
    }

    // Mixed text + placeholders → f-string interpolation.
    let out = "";
    let last = 0;
    for (const m of matches) {
      const idx = m.index ?? 0;
      out += escapeF(str.slice(last, idx));
      const ph = placeholders[Number(m[1])];
      if (ph.resolved) {
        if (ph.resolved.needsHelper) needsHelper = true;
        out += `{${ph.resolved.expr}}`;
      } else {
        out += escapeF(ph.original);
      }
      last = idx + m[0].length;
    }
    out += escapeF(str.slice(last));
    return `f"${out}"`;
  };

  const emit = (value: unknown): string => {
    if (value === null) return "None";
    if (typeof value === "boolean") return value ? "True" : "False";
    if (typeof value === "number") return String(value);
    if (typeof value === "string") return emitString(value);
    if (Array.isArray(value)) return `[${value.map(emit).join(", ")}]`;
    if (typeof value === "object") {
      const entries = Object.entries(value as Record<string, unknown>).map(
        ([k, v]) => `${emitString(k)}: ${emit(v)}`
      );
      return `{${entries.join(", ")}}`;
    }
    return "None";
  };

  return { expr: emit(parsed), needsHelper };
}

// (A) Emit lines that persist this function's properties to flow_manager.state
// so later nodes can read them via {{ state.<name> }} or flow_manager.state.get.
function generateStateSaves(props: Record<string, unknown>): string {
  const keys = Object.keys(props);
  if (keys.length === 0) return "";
  return keys.map((key) => `        flow_manager.state["${key}"] = ${key}`).join("\n") + "\n";
}

function generateTypeName(funcName: string): string {
  // Convert snake_case to PascalCase
  return (
    funcName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("") + "Result"
  );
}

function generateTypeDefinition(func: FlowFunctionJson): string {
  const typeName = generateTypeName(func.name);
  const props = func.properties || {};

  if (Object.keys(props).length === 0) {
    // No properties, use base FlowResult
    return "";
  }

  const fields = Object.entries(props).map(([key, prop]) => {
    const pyType =
      prop.type === "integer"
        ? "int"
        : prop.type === "number"
          ? "float"
          : prop.type === "boolean"
            ? "bool"
            : "str";
    const optional = func.required?.includes(key) ? "" : " | None";
    return `    ${key}: ${pyType}${optional}`;
  });

  return `class ${typeName}(FlowResult):
    """Result type for ${func.name} function"""
${fields.join("\n")}
`;
}

function formatMessage(msg: MessageJson): string {
  // Use triple quotes for multiline content, regular quotes for single line
  const contentLines = msg.content.split("\n");
  const hasNewlines = contentLines.length > 1;
  const contentStr = hasNewlines
    ? `"""${msg.content.replace(/"""/g, '\\"\\"\\"')}"""`
    : JSON.stringify(msg.content);
  return `            {\n                "role": "${msg.role}",\n                "content": ${contentStr}\n            }`;
}

function formatProperty(prop: any, indent: string = "            "): string {
  const parts: string[] = [];
  if (prop.type) parts.push(`"type": "${prop.type}"`);
  if (prop.description) parts.push(`"description": "${escapePythonString(prop.description)}"`);
  if (prop.enum) parts.push(`"enum": ${JSON.stringify(prop.enum)}`);
  if (prop.minimum !== undefined) parts.push(`"minimum": ${prop.minimum}`);
  if (prop.maximum !== undefined) parts.push(`"maximum": ${prop.maximum}`);
  if (prop.pattern) parts.push(`"pattern": "${escapePythonString(prop.pattern)}"`);
  return `{\n${indent}    ${parts.join(`,\n${indent}    `)}\n${indent}}`;
}

function generateFunction(func: FlowFunctionJson): {
  handler: string;
  schema: string;
  typeDef?: string;
} {
  const funcName = func.name;
  const handlerName = `handle_${funcName}`;
  const props = func.properties || {};
  const required = func.required || [];
  const typeName = generateTypeName(funcName);
  const hasType = Object.keys(props).length > 0;

  // FlowsFunctionSchema requires properties and required to always be set
  let propertiesBlock = "";
  if (Object.keys(props).length > 0) {
    const propLines = Object.entries(props).map(([key, prop]) => {
      return `            "${key}": ${formatProperty(prop, "            ")}`;
    });
    propertiesBlock = `,\n        properties={\n${propLines.join(",\n")}\n        }`;
  } else {
    propertiesBlock = ",\n        properties={}";
  }

  const requiredBlock = `,\n        required=${JSON.stringify(required)}`;

  // Generate schema code (used for both decision and non-decision functions)
  const schemaCode = `    ${funcName}_func = FlowsFunctionSchema(
        name="${funcName}",
        handler=handle_${funcName},
        description="${escapePythonString(func.description)}"${propertiesBlock}${requiredBlock}
    )`;

  // Generate type definition (used for both decision and non-decision functions)
  const typeDefCode = hasType ? generateTypeDefinition(func) : undefined;

  // Generate typed argument extraction
  const argExtraction =
    Object.keys(props).length > 0
      ? Object.entries(props)
          .map(([key, prop]) => {
            const pyType =
              prop.type === "integer"
                ? "int"
                : prop.type === "number"
                  ? "float"
                  : prop.type === "boolean"
                    ? "bool"
                    : "str";
            const defaultValue =
              prop.type === "integer" || prop.type === "number"
                ? "0"
                : prop.type === "boolean"
                  ? "False"
                  : '""';
            return `        ${key}: ${pyType} = args.get("${key}", ${defaultValue})`;
          })
          .join("\n") + "\n"
      : "";

  // (A) Persist this function's properties to flow_manager.state so later nodes
  // can read them (e.g. an HTTP node referencing {{ state.<name> }}).
  const stateSaves = generateStateSaves(props);

  let nextNodeRouting: string;
  let decisionCode = "";

  // Handle HTTP request functions: emit a real aiohttp call. The function's
  // properties become the request inputs (interpolated via {{ placeholder }}),
  // and the parsed response is stored in flow_manager.state and returned.
  if (func.http) {
    const http = func.http;
    const method = http.method || "GET";
    const bodyMode = http.body_mode ?? "none";
    const timeout = http.timeout_seconds && http.timeout_seconds > 0 ? http.timeout_seconds : 30;
    const responseVar =
      http.response_var && http.response_var.trim() ? http.response_var.trim() : `${funcName}_response`;

    const headerPairs = [...(http.headers ?? [])];
    // Auto-add JSON content type when sending a JSON body without an explicit one.
    if (
      bodyMode === "json" &&
      http.body &&
      !headerPairs.some((h) => h.key.toLowerCase() === "content-type")
    ) {
      headerPairs.push({ key: "Content-Type", value: "application/json" });
    }
    const queryPairs = http.query_params ?? [];
    const sendBody = bodyMode !== "none" && !!http.body;

    // Resolve the request body to a Python expression. A JSON body is built as a
    // real object — placeholders inject live values from args / flow_manager.state
    // — and serialized with json.dumps, so objects go out as proper JSON instead
    // of the Python repr of a dict embedded in a string. Raw bodies stay (f-)strings.
    let bodyExpr: string | null = null;
    let needsJsonImport = false;
    let needsStateHelper = false;
    if (sendBody) {
      if (bodyMode === "json") {
        const jsonBody = jsonBodyToPyExpr(http.body as string);
        if (jsonBody) {
          bodyExpr = `json.dumps(${jsonBody.expr}, default=str)`;
          needsJsonImport = true;
          needsStateHelper = jsonBody.needsHelper;
        } else {
          // Body isn't valid JSON (even after placeholder substitution); fall
          // back to sending it as a plain interpolated string.
          bodyExpr = toPyStringExpr(http.body as string);
        }
      } else {
        bodyExpr = toPyStringExpr(http.body as string);
      }
    }

    let body = "        import aiohttp\n";
    if (needsJsonImport) body += "        import json\n";
    body += "\n";
    if (needsStateHelper) {
      body +=
        "        def _get_state(_state, *_keys):\n" +
        "            _cur = _state\n" +
        "            for _k in _keys:\n" +
        "                _cur = _cur.get(_k) if isinstance(_cur, dict) else None\n" +
        "                if _cur is None:\n" +
        "                    break\n" +
        "            return _cur\n\n";
    }
    body += `        _url = ${toPyStringExpr(http.url || "")}\n`;

    if (headerPairs.length > 0) {
      body += "        _headers = {\n";
      headerPairs.forEach((h) => {
        body += `            ${toPyStringExpr(h.key)}: ${toPyStringExpr(h.value)},\n`;
      });
      body += "        }\n";
    } else {
      body += "        _headers = {}\n";
    }

    if (queryPairs.length > 0) {
      body += "        _params = {\n";
      queryPairs.forEach((p) => {
        body += `            ${toPyStringExpr(p.key)}: ${toPyStringExpr(p.value)},\n`;
      });
      body += "        }\n";
    } else {
      body += "        _params = {}\n";
    }

    if (sendBody && bodyExpr) {
      body += `        _data = ${bodyExpr}\n`;
    }

    const dataArg = sendBody ? ", data=_data" : "";
    body += `        _timeout = aiohttp.ClientTimeout(total=${timeout})\n`;
    body += "        async with aiohttp.ClientSession(timeout=_timeout) as _session:\n";
    body += `            async with _session.request("${method}", _url, headers=_headers, params=_params${dataArg}) as _response:\n`;
    body += "                _status = _response.status\n";
    body += "                try:\n";
    body += "                    result = await _response.json()\n";
    body += "                except Exception:\n";
    body += "                    result = await _response.text()\n";
    body += `        flow_manager.state["${responseVar}"] = result\n`;
    body += `        flow_manager.state["${responseVar}_status"] = _status\n`;

    const routing = func.next_node_id
      ? `        return result, create_${func.next_node_id}_node()\n`
      : "        return result, None\n";

    const handlerCode = `
    async def ${handlerName}(args: FlowArgs, flow_manager: FlowManager) -> tuple[Any, NodeConfig | None]:
        """Handler for ${funcName} function (HTTP ${method} request)"""
${argExtraction}${stateSaves}${body}${routing}`;

    return {
      handler: handlerCode,
      schema: schemaCode,
      typeDef: undefined,
    };
  }

  // Handle decision logic
  if (func.decision) {
    // Execute action code block (user must set result variable)
    decisionCode = `        # Execute action (must set 'result' variable)\n${func.decision.action
      .split("\n")
      .map((line) => `        ${line}`)
      .join("\n")}\n\n`;

    // Generate if/elif/else chain if there are conditions
    if (func.decision.conditions.length > 0) {
      decisionCode += "        # Conditional routing\n";
      func.decision.conditions.forEach((condition, index) => {
        const indent = index === 0 ? "if" : "elif";
        // Handle special operators like "not", "in", "not in"
        let conditionExpr: string;
        if (condition.operator === "not") {
          conditionExpr = `not result`;
        } else if (condition.operator === "in") {
          conditionExpr = `result in ${condition.value}`;
        } else if (condition.operator === "not in") {
          conditionExpr = `result not in ${condition.value}`;
        } else {
          // For comparison operators, try to parse value as appropriate type
          // For now, keep as string comparison - user can wrap in quotes if needed
          conditionExpr = `result ${condition.operator} ${condition.value}`;
        }
        decisionCode += `        ${indent} ${conditionExpr}:\n            return result, create_${condition.next_node_id}_node()\n`;
      });
      decisionCode += `        else:\n            return result, create_${func.decision.default_next_node_id}_node()\n`;
    } else {
      // No conditions, just return default
      decisionCode += `        return result, create_${func.decision.default_next_node_id}_node()\n`;
    }

    // Return type for decision: result is Any (action result)
    const returnTypeAnnotation = `tuple[Any, NodeConfig]`;

    const handlerCode = `
    async def ${handlerName}(args: FlowArgs, flow_manager: FlowManager) -> ${returnTypeAnnotation}:
        """Handler for ${funcName} function"""
${argExtraction}${stateSaves}${decisionCode}
`;

    return {
      handler: handlerCode,
      schema: schemaCode,
      typeDef: typeDefCode,
    };
  }

  // Original logic for non-decision functions
  if (!hasType) {
    // No properties, return None
    if (func.next_node_id) {
      nextNodeRouting = `        return None, create_${func.next_node_id}_node()`;
    } else {
      nextNodeRouting = "        return None, None";
    }
  } else {
    // Has properties, use named parameters
    const namedParams = Object.keys(props)
      .map((key) => `${key}=${key}`)
      .join(", ");
    if (func.next_node_id) {
      nextNodeRouting = `        return ${typeName}(${namedParams}), create_${func.next_node_id}_node()`;
    } else {
      nextNodeRouting = `        return ${typeName}(${namedParams}), None`;
    }
  }

  // Generate return type annotation
  // If no type, return type is just None (not None | None)
  const firstType = hasType ? `${typeName} | None` : "None";
  const returnTypeAnnotation = func.next_node_id
    ? `tuple[${firstType}, NodeConfig]`
    : `tuple[${firstType}, NodeConfig | None]`;

  const handlerCode = `
    async def ${handlerName}(args: FlowArgs, flow_manager: FlowManager) -> ${returnTypeAnnotation}:
        """Handler for ${funcName} function"""
${argExtraction}${stateSaves}        # TODO: Implement additional logic if needed
${nextNodeRouting}
`;

  return {
    handler: handlerCode,
    schema: schemaCode,
    typeDef: typeDefCode,
  };
}

function generateNodeFunction(node: FlowNodeJson): { nodeCode: string; typeDefs: string[] } {
  const nodeId = node.id;
  const data = node.data || {};

  const roleMessages = (data.role_messages as MessageJson[] | undefined) || [];
  const taskMessages = (data.task_messages as MessageJson[] | undefined) || [];
  const functions = (data.functions as FlowFunctionJson[] | undefined) || [];
  const preActions = data.pre_actions || [];
  const postActions = data.post_actions || [];
  const contextStrategy = data.context_strategy as
    | { strategy: "APPEND" | "RESET" | "RESET_WITH_SUMMARY"; summary_prompt?: string } // RESET_WITH_SUMMARY deprecated in 1.0
    | undefined;

  let code = `def create_${nodeId}_node() -> NodeConfig:
    """Create the ${data.label || nodeId} node."""
`;

  // Generate function handlers and collect type definitions
  const functionHandlers: string[] = [];
  const functionSchemas: string[] = [];
  const functionRefs: string[] = [];
  const typeDefs: string[] = [];

  functions.forEach((func) => {
    const funcGen = generateFunction(func);
    if (funcGen.typeDef) {
      typeDefs.push(funcGen.typeDef);
    }
    functionHandlers.push(funcGen.handler);
    functionSchemas.push(funcGen.schema);
    functionRefs.push(`${func.name}_func`);
  });

  if (functionHandlers.length > 0) {
    code += functionHandlers.join("\n");
    code += "\n";
    code += functionSchemas.join("\n");
    code += "\n";
  }

  code += `    return NodeConfig(
        name="${nodeId}",\n`;

  if (roleMessages.length > 0) {
    code += `        role_messages=[\n${roleMessages.map(formatMessage).join(",\n")}\n        ],\n`;
  }

  if (taskMessages.length > 0) {
    code += `        task_messages=[\n${taskMessages.map(formatMessage).join(",\n")}\n        ],\n`;
  }

  if (functions.length > 0) {
    code += `        functions=[${functionRefs.join(", ")}],\n`;
  }

  if (preActions.length > 0) {
    const actionStrs = preActions.map((action) => {
      if (action.type === "end_conversation") {
        return `            {"type": "end_conversation"}`;
      } else if (action.type === "function" && action.handler) {
        return `            {"type": "function", "handler": ${action.handler}}`;
      } else if (action.type === "tts_say" && action.text) {
        return `            {"type": "tts_say", "text": "${escapePythonString(action.text)}"}`;
      }
      return `            {"type": "${action.type}"}`;
    });
    code += `        pre_actions=[\n${actionStrs.join(",\n")}\n        ],\n`;
  }

  if (postActions.length > 0) {
    const actionStrs = postActions.map((action) => {
      if (action.type === "end_conversation") {
        return `            {"type": "end_conversation"}`;
      } else if (action.type === "function" && action.handler) {
        return `            {"type": "function", "handler": ${action.handler}}`;
      } else if (action.type === "tts_say" && action.text) {
        return `            {"type": "tts_say", "text": "${escapePythonString(action.text)}"}`;
      }
      return `            {"type": "${action.type}"}`;
    });
    code += `        post_actions=[\n${actionStrs.join(",\n")}\n        ],\n`;
  }

  if (contextStrategy && contextStrategy.strategy !== "APPEND") {
    if (contextStrategy.strategy === "RESET_WITH_SUMMARY") {
      const summaryPrompt = contextStrategy.summary_prompt
        ? escapePythonString(contextStrategy.summary_prompt)
        : "";
      code += `        context_strategy=ContextStrategyConfig(\n            strategy=ContextStrategy.${contextStrategy.strategy},\n            summary_prompt="${summaryPrompt}"\n        ),\n`;
    } else {
      code += `        context_strategy=ContextStrategyConfig(\n            strategy=ContextStrategy.${contextStrategy.strategy}\n        ),\n`;
    }
  }

  // Only include respond_immediately if it's False (True is the default)
  const respondImmediately = data.respond_immediately !== false;
  if (!respondImmediately) {
    code += `        respond_immediately=False,\n`;
  }

  code += `    )`;

  return { nodeCode: code, typeDefs };
}

function generateGlobalFunctions(flow: FlowJson): string {
  const globalFuncs = flow.global_functions || [];
  if (globalFuncs.length === 0) return "";

  let code = "\n# Global functions\n";
  globalFuncs.forEach((func) => {
    const props = func.properties || {};
    const required = func.required || [];
    const hasType = Object.keys(props).length > 0;
    const typeName = hasType ? generateTypeName(func.name) : "FlowResult";
    const handlerName = `handle_${func.name}`;

    // FlowsFunctionSchema requires properties and required to always be set
    let propertiesBlock = "";
    if (Object.keys(props).length > 0) {
      const propLines = Object.entries(props).map(([key, prop]) => {
        return `            "${key}": ${formatProperty(prop, "            ")}`;
      });
      propertiesBlock = `,\n        properties={\n${propLines.join(",\n")}\n        }`;
    } else {
      propertiesBlock = ",\n        properties={}";
    }

    const requiredBlock = `,\n        required=${JSON.stringify(required)}`;

    const argExtraction =
      Object.keys(props).length > 0
        ? Object.entries(props)
            .map(([key, prop]) => {
              const pyType =
                prop.type === "integer"
                  ? "int"
                  : prop.type === "number"
                    ? "float"
                    : prop.type === "boolean"
                      ? "bool"
                      : "str";
              const defaultValue =
                prop.type === "integer" || prop.type === "number"
                  ? "0"
                  : prop.type === "boolean"
                    ? "False"
                    : '""';
              return `        ${key}: ${pyType} = args.get("${key}", ${defaultValue})`;
            })
            .join("\n") + "\n"
        : "";

    // Generate result creation with named parameters
    let resultReturn: string;
    let returnTypeAnnotation: string;
    if (!hasType) {
      resultReturn = "        return None, None";
      returnTypeAnnotation = "tuple[None, None]";
    } else {
      const namedParams = Object.keys(props)
        .map((key) => `${key}=${key}`)
        .join(", ");
      resultReturn = `        return ${typeName}(${namedParams}), None`;
      // For functions with types, return type can be the type or None
      returnTypeAnnotation = `tuple[${typeName} | None, None]`;
    }

    code += `async def ${handlerName}(args: FlowArgs, flow_manager: FlowManager) -> ${returnTypeAnnotation}:
    """Global function: ${func.name}"""
${argExtraction}    # TODO: Implement ${func.name}
${resultReturn}

${func.name}_func = FlowsFunctionSchema(
    name="${func.name}",
    handler=${handlerName},
    description="${escapePythonString(func.description)}"${propertiesBlock}${requiredBlock}
)

`;
  });

  return code;
}

export function generatePythonCode(flow: FlowJson): string {
  // Check if any node uses context_strategy
  const hasContextStrategy = flow.nodes.some(
    (node) => node.data?.context_strategy && node.data.context_strategy.strategy !== "APPEND"
  );

  // Check if any function has a decision or HTTP request (both need the Any type)
  const hasDecision = flow.nodes.some((node) => {
    const functions = (node.data?.functions as FlowFunctionJson[] | undefined) || [];
    return functions.some((func) => func.decision !== undefined || func.http !== undefined);
  });

  const nodes = flow.nodes || [];
  const initialNode = nodes.find((n) => n.type === "initial");
  const globalFuncs = flow.global_functions || [];

  // Collect all type definitions first
  const allTypeDefs = new Set<string>();
  const nodeFunctions: { nodeCode: string; typeDefs: string[] }[] = [];

  nodes.forEach((node) => {
    const funcGen = generateNodeFunction(node);
    funcGen.typeDefs.forEach((td) => allTypeDefs.add(td));
    nodeFunctions.push(funcGen);
  });

  // Generate global function types
  globalFuncs.forEach((func) => {
    const props = func.properties || {};
    if (Object.keys(props).length > 0) {
      allTypeDefs.add(generateTypeDefinition(func));
    }
  });

  const initialNodeId = initialNode?.id || "initial";
  const globalFuncRefs =
    globalFuncs.length > 0 ? globalFuncs.map((f) => `${f.name}_func`).join(", ") : "";

  let code = `"""Generated Pipecat Flow: ${flow.meta.name}

This file was generated from the visual flow editor.
Customize the function handlers to implement your flow logic.
"""

${hasDecision ? "from typing import Any\n\n" : ""}from pipecat_flows import (
    FlowArgs,
    FlowManager,
    FlowResult,
    FlowsFunctionSchema,
    NodeConfig${hasContextStrategy ? ",\n    ContextStrategy,\n    ContextStrategyConfig" : ""},
)

# Type definitions
${Array.from(allTypeDefs).join("\n")}

${generateGlobalFunctions(flow)}

# Node creation functions
`;

  // Generate all node functions
  nodeFunctions.forEach((funcGen) => {
    code += funcGen.nodeCode;
    code += "\n\n";
  });

  // Generate FlowManager initialization section (commented)
  code += `# FlowManager Setup
# 
# Initialize the FlowManager in your bot setup:
#
# async def run_bot(transport: BaseTransport, runner_args: RunnerArguments):
#     stt = DeepgramSTTService(api_key=os.getenv("DEEPGRAM_API_KEY"))
#     tts = CartesiaTTSService(api_key=os.getenv("CARTESIA_API_KEY"))
#     llm = create_llm()  # Your LLM service
#     
#     context = LLMContext()
#     context_aggregator = LLMContextAggregatorPair(context)
#     
#     pipeline = Pipeline([
#         transport.input(),
#         stt,
#         context_aggregator.user(),
#         llm,
#         tts,
#         transport.output(),
#         context_aggregator.assistant(),
#     ])
#     
#     task = PipelineTask(pipeline, params=PipelineParams(allow_interruptions=True))
#     
#     # Initialize FlowManager
#     flow_manager = FlowManager(
#         task=task,
#         llm=llm,
#         context_aggregator=context_aggregator,
#         transport=transport,
#         # global_functions=[${globalFuncRefs}],
#     )
#     
#     @transport.event_handler("on_client_connected")
#     async def on_client_connected(transport, client):
#         logger.info("Client connected")
#         # Start the flow with the initial node
#         await flow_manager.initialize(create_${initialNodeId}_node())
`;

  return code;
}

