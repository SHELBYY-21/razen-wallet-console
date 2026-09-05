import { useEffect, useState } from "react";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Glyph } from "@/components/razen/glyph";
import { useRazen } from "@/lib/razen/store";
import type { MemoryItem, MemoryKind } from "@/lib/memory/types";

export function MemoryPanel() {
  const accountId = useRazen((s) => s.activeAccountId);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [kind, setKind] = useState<MemoryKind>("semantic");

  async function load(query = q) {
    const url = `/api/memory?q=${encodeURIComponent(query)}&accountId=${encodeURIComponent(accountId)}`;
    const res = await fetch(url);
    const json = (await res.json()) as { items?: MemoryItem[] };
    setItems(json.items ?? []);
  }

  useEffect(() => {
    void load("");
  }, [accountId]);

  async function save() {
    if (!key.trim() || !value.trim()) return;
    await fetch("/api/memory", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind, key, value, accountId }),
    });
    setKey("");
    setValue("");
    await load("");
  }

  return (
    <section className="panel p-5">
      <div className="mb-3 flex items-center gap-2">
        <Glyph icon={Brain} tone="teal" />
        <div>
          <h2 className="text-sm font-medium">ความจำเอเจนต์</h2>
          <p className="text-[11px] text-subtle">semantic · episodic · procedural · กรองต่อกระเป๋า</p>
        </div>
      </div>
      <div className="mb-3 flex gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ค้นหาความจำ"
          onKeyDown={(e) => {
            if (e.key === "Enter") void load();
          }}
        />
        <Button variant="secondary" onClick={() => void load()}>
          เรียก
        </Button>
      </div>
      <ul className="mb-3 max-h-48 space-y-2 overflow-auto text-sm">
        {items.length === 0 ? (
          <li className="py-4 text-center text-xs text-muted">ยังไม่มีความจำในกระเป๋านี้</li>
        ) : (
          items.map((m) => (
            <li key={m.id} className="rounded-md bg-elevated px-3 py-2">
              <p className="font-mono text-[10px] text-cyan">
                {m.kind} · {m.key}
              </p>
              <p className="text-xs text-muted">{m.value}</p>
            </li>
          ))
        )}
      </ul>
      <div className="grid gap-2 sm:grid-cols-[7rem_1fr]">
        <select
          className="h-11 rounded-md bg-transparent px-2 text-sm shadow-[var(--shadow-border)]"
          value={kind}
          onChange={(e) => setKind(e.target.value as MemoryKind)}
        >
          <option value="semantic">semantic</option>
          <option value="episodic">episodic</option>
          <option value="procedural">procedural</option>
        </select>
        <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="key เช่น home_bank" />
      </div>
      <Input className="mt-2" value={value} onChange={(e) => setValue(e.target.value)} placeholder="value" />
      <Button className="mt-2 w-full" variant="secondary" onClick={() => void save()}>
        จำไว้
      </Button>
    </section>
  );
}
