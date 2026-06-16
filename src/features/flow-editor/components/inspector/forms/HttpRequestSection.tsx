import { Plus, Trash2 } from "lucide-react";
import { useId } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  FlowFunctionJson,
  HttpKeyValueJson,
  HttpRequestConfigJson,
} from "@/lib/schema/flow.schema";

const HTTP_METHODS: HttpRequestConfigJson["method"][] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
];

const DEFAULT_HTTP: HttpRequestConfigJson = {
  method: "GET",
  url: "",
  headers: [],
  query_params: [],
  body_mode: "none",
  body: "",
  timeout_seconds: 30,
  response_var: "",
};

interface HttpRequestSectionProps {
  func: FlowFunctionJson;
  onChange: (updates: Partial<FlowFunctionJson>) => void;
  onFocus?: () => void;
}

// Editable list of key/value pairs (used for both headers and query params).
function KeyValueList({
  label,
  addLabel,
  pairs,
  onChange,
  onFocus,
}: {
  label: string;
  addLabel: string;
  pairs: HttpKeyValueJson[];
  onChange: (pairs: HttpKeyValueJson[]) => void;
  onFocus?: () => void;
}) {
  const update = (i: number, patch: Partial<HttpKeyValueJson>) => {
    const next = [...pairs];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const remove = (i: number) => onChange(pairs.filter((_, idx) => idx !== i));
  const add = () => onChange([...pairs, { key: "", value: "" }]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs opacity-60">{label}</div>
        <Button variant="ghost" size="sm" className="h-6 gap-1" onClick={add}>
          <Plus className="h-4 w-4" /> {addLabel}
        </Button>
      </div>
      {pairs.length === 0 ? (
        <div className="text-xs opacity-40 italic py-1">None.</div>
      ) : (
        pairs.map((pair, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={i} className="flex items-center gap-2">
            <Input
              className="h-8 text-xs flex-1"
              value={pair.key}
              onChange={(e) => update(i, { key: e.target.value })}
              onFocus={onFocus}
              placeholder="Key"
            />
            <Input
              className="h-8 text-xs flex-1"
              value={pair.value}
              onChange={(e) => update(i, { value: e.target.value })}
              onFocus={onFocus}
              placeholder="Value"
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 shrink-0"
              onClick={() => remove(i)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))
      )}
    </div>
  );
}

export function HttpRequestSection({ func, onChange, onFocus }: HttpRequestSectionProps) {
  const enabled = func.http !== undefined;
  const http = func.http ?? DEFAULT_HTTP;
  const enableId = useId();
  const methodId = useId();
  const urlId = useId();
  const bodyModeId = useId();
  const bodyId = useId();
  const timeoutId = useId();
  const responseVarId = useId();

  const updateHttp = (patch: Partial<HttpRequestConfigJson>) => {
    onChange({ http: { ...http, ...patch } });
  };

  const toggle = (checked: boolean) => {
    onChange({ http: checked ? DEFAULT_HTTP : undefined });
  };

  const bodyMode = http.body_mode ?? "none";

  return (
    <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700 space-y-3">
      <div className="flex items-center gap-2">
        <Checkbox checked={enabled} onCheckedChange={(c: boolean) => toggle(c)} id={enableId} />
        <label htmlFor={enableId} className="text-xs font-medium opacity-80 cursor-pointer">
          HTTP Request
        </label>
      </div>

      {enabled && (
        <div className="space-y-3">
          <div className="text-[11px] opacity-50 leading-relaxed">
            This function performs an API call. Use{" "}
            <code className="font-mono">{`{{ property_name }}`}</code> to insert one of this
            function&apos;s own properties, or{" "}
            <code className="font-mono">{`{{ state.key }}`}</code> to insert a value saved by an
            earlier node. In a JSON body you can also inject whole objects:{" "}
            <code className="font-mono">{`{{ flow_manager.state }}`}</code> sends the entire state,
            and dot-notation like <code className="font-mono">{`{{ state.order.id }}`}</code> sends a
            nested value — both as real JSON, not strings. The response is stored in{" "}
            <code className="font-mono">flow_manager.state</code> and returned to the LLM.
          </div>

          {/* Method + URL */}
          <div className="flex items-end gap-2">
            <div className="space-y-2 w-28 shrink-0">
              <label htmlFor={methodId} className="text-xs opacity-60">
                Method
              </label>
              <Select
                value={http.method}
                onValueChange={(v) => updateHttp({ method: v as HttpRequestConfigJson["method"] })}
                onOpenChange={(open) => open && onFocus?.()}
              >
                <SelectTrigger id={methodId} className="h-8 text-xs" onFocus={onFocus}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HTTP_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex-1">
              <label htmlFor={urlId} className="text-xs opacity-60">
                URL
              </label>
              <Input
                id={urlId}
                className="h-8 text-xs font-mono"
                value={http.url}
                onChange={(e) => updateHttp({ url: e.target.value })}
                onFocus={onFocus}
                placeholder="https://api.example.com/users/{{ user_id }}"
              />
            </div>
          </div>

          <KeyValueList
            label="Headers"
            addLabel="Add Header"
            pairs={http.headers ?? []}
            onChange={(headers) => updateHttp({ headers })}
            onFocus={onFocus}
          />

          <KeyValueList
            label="Query Params"
            addLabel="Add Param"
            pairs={http.query_params ?? []}
            onChange={(query_params) => updateHttp({ query_params })}
            onFocus={onFocus}
          />

          {/* Body */}
          <div className="space-y-2">
            <label htmlFor={bodyModeId} className="text-xs opacity-60">
              Body
            </label>
            <Select
              value={bodyMode}
              onValueChange={(v) =>
                updateHttp({ body_mode: v as HttpRequestConfigJson["body_mode"] })
              }
              onOpenChange={(open) => open && onFocus?.()}
            >
              <SelectTrigger id={bodyModeId} className="h-8 text-xs" onFocus={onFocus}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="raw">Raw</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {bodyMode !== "none" && (
            <div className="space-y-2">
              <label htmlFor={bodyId} className="text-xs opacity-60">
                {bodyMode === "json" ? "JSON body" : "Raw body"}
              </label>
              <Textarea
                id={bodyId}
                className="min-h-24 text-xs font-mono"
                value={http.body ?? ""}
                onChange={(e) => updateHttp({ body: e.target.value })}
                onFocus={onFocus}
                placeholder={
                  bodyMode === "json"
                    ? '{\n  "user_id": "{{ user_id }}",\n  "state": {{ flow_manager.state }}\n}'
                    : "raw request body"
                }
              />
            </div>
          )}

          {/* Timeout + response var */}
          <div className="flex items-end gap-2">
            <div className="space-y-2 w-28 shrink-0">
              <label htmlFor={timeoutId} className="text-xs opacity-60">
                Timeout (s)
              </label>
              <Input
                id={timeoutId}
                type="number"
                className="h-8 text-xs"
                value={http.timeout_seconds ?? ""}
                onChange={(e) =>
                  updateHttp({
                    timeout_seconds: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                onFocus={onFocus}
                placeholder="30"
              />
            </div>
            <div className="space-y-2 flex-1">
              <label htmlFor={responseVarId} className="text-xs opacity-60">
                Store response as
              </label>
              <Input
                id={responseVarId}
                className="h-8 text-xs font-mono"
                value={http.response_var ?? ""}
                onChange={(e) => updateHttp({ response_var: e.target.value })}
                onFocus={onFocus}
                placeholder={`${func.name || "function"}_response`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
