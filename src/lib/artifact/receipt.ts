export function receiptHtml(input: {
  ref: string;
  amount: string;
  counterpart: string;
  method: string;
  at: string;
  note?: string;
}) {
  const note = input.note ? `<p class="note">${escapeHtml(input.note)}</p>` : "";
  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>RAZEN ${escapeHtml(input.ref)}</title>
<style>
  :root { color-scheme: dark; }
  body { margin:0; min-height:100vh; background:#0a1020; color:#f8fafc;
    font-family: Anuphan, ui-sans-serif, system-ui, sans-serif; }
  .card { max-width: 420px; margin: 8vh auto; padding: 28px 26px;
    background: #111827; border: 1px solid rgba(148,163,184,.2); }
  .kicker { font-family: ui-monospace, monospace; letter-spacing:.18em;
    font-size:11px; color:#2dd4bf; }
  h1 { font-size: 22px; font-weight: 600; margin: 8px 0 18px; }
  .amt { font-variant-numeric: tabular-nums; font-size: 34px; color:#c9a84c; }
  dl { display:grid; grid-template-columns: 110px 1fr; gap: 8px 12px; font-size:14px; }
  dt { color:#8aa0b8; } dd { margin:0; }
  .note { margin-top:16px; font-size:13px; color:#8aa0b8; }
</style>
</head>
<body>
  <article class="card">
    <p class="kicker">RAZEN · RECEIPT</p>
    <h1>${escapeHtml(input.method)}</h1>
    <p class="amt">฿${escapeHtml(input.amount)}</p>
    <dl>
      <dt>ถึง</dt><dd>${escapeHtml(input.counterpart)}</dd>
      <dt>อ้างอิง</dt><dd>${escapeHtml(input.ref)}</dd>
      <dt>เวลา</dt><dd>${escapeHtml(input.at)}</dd>
    </dl>
    ${note}
  </article>
</body>
</html>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"]/g, (ch) => {
    if (ch === "&") return "\u0026amp;";
    if (ch === "<") return "\u0026lt;";
    if (ch === ">") return "\u0026gt;";
    return "\u0026quot;";
  });
}
