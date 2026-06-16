import { Handle, type NodeProps, Position, useNodes } from "@xyflow/react";
import { AlertTriangle, Globe } from "lucide-react";

import type { FlowFunctionJson } from "@/lib/schema/flow.schema";
import type { FlowNodeData } from "@/lib/types/flowTypes";

// Dedicated visual for HTTP request nodes. Under the hood the node carries a
// normal Pipecat function whose `http` config (Phase 1) drives the generated
// aiohttp call; this component just surfaces the method + URL on the canvas.
export default function HttpRequestNode({ data, selected }: NodeProps) {
  const allNodes = useNodes();
  const nodeData = data as FlowNodeData | undefined;
  const functions = (nodeData?.functions ?? []) as FlowFunctionJson[];
  const httpFn = functions.find((f) => f.http) ?? functions[0];
  const http = httpFn?.http;

  const nodeIds = new Set(allNodes.map((n) => n.id));
  const hasBrokenReferences = functions.some(
    (func) => func.next_node_id && !nodeIds.has(func.next_node_id)
  );

  return (
    <div
      className={`rounded-lg border-2 bg-white px-2 py-1.5 shadow-sm dark:bg-neutral-800 min-w-[140px] ${
        selected ? "border-blue-500" : "border-emerald-300 dark:border-emerald-600"
      } ${hasBrokenReferences ? "border-orange-400! dark:border-orange-500!" : ""}`}
    >
      <Handle type="target" position={Position.Top} className="bg-neutral-400!" />
      <div className="flex items-center gap-1.5">
        <Globe className="h-3 w-3 text-emerald-500 dark:text-emerald-400 shrink-0" />
        <div className="text-xs font-normal flex-1 text-nowrap">
          {nodeData?.label || "HTTP Request"}
        </div>
        {hasBrokenReferences && (
          <div title="This node has broken references (functions pointing to deleted nodes)">
            <AlertTriangle className="h-3 w-3 text-orange-500 dark:text-orange-400 shrink-0" />
          </div>
        )}
      </div>
      {http && (
        <div className="mt-1 flex items-center gap-1 max-w-[200px]">
          <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            {http.method}
          </span>
          <span className="text-[9px] opacity-60 truncate">{http.url || "no URL set"}</span>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="bg-neutral-400!" />
    </div>
  );
}
