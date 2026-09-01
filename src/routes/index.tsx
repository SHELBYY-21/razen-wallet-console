import { createFileRoute, Link } from "@tanstack/react-router";
import { TxTable } from "@/components/razen/tx-table";
import { baht } from "@/lib/razen/format";
import { useRazen } from "@/lib/razen/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const accounts = useRazen((s) => s.accounts);
  const activeId = useRazen((s) => s.activeAccountId);
  const getBalance = useRazen((s) => s.balance);
  const getStats = useRazen((s) => s.stats);
  const getSeries = useRazen((s) => s.chartSeries);
  const txs = useRazen((s) => s.txs);
  const setReceipt = useRazen((s) => s.setLastReceipt);
  const mode = useRazen((s) => s.settings.mode);
  const balance = getBalance();
  const stats = getStats();
  const series = getSeries();
  const acc = accounts.find((a) => a.id === activeId) ?? accounts[0];
  const recent = txs.filter((t) => t.accountId === activeId);
  const synced = acc?.walletBalance != null;

  return (
    <div className="space-y-2">
      <div className="dense-toolbar">
        <div className="dense-cell" style={{ flex: "1 1 140px" }}>
          <span className="k">BAL · getBalance</span>
          <span className="v">{synced ? baht(balance) : "—"}</span>
        </div>
        <div className="dense-cell" style={{ flex: "1 1 90px" }}>
          <span className="k">IN</span>
          <span className="v pos">{baht(stats.incoming)}</span>
        </div>
        <div className="dense-cell" style={{ flex: "1 1 90px" }}>
          <span className="k">OUT</span>
          <span className="v neg">{baht(stats.outgoing)}</span>
        </div>
        <div className="dense-cell" style={{ flex: "0 0 72px" }}>
          <span className="k">PEND</span>
          <span className="v">{stats.pending}</span>
        </div>
        <div className="dense-cell" style={{ flex: "1 1 160px" }}>
          <span className="k">ACCT</span>
          <span className="v">
            {acc?.masked ?? "—"} · {mode.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        <Link to="/transfer" search={{ method: "p2p" }} className="dense-btn">
          P2P
        </Link>
        <Link to="/transfer" search={{ method: "promptpay" }} className="dense-btn">
          PPAY
        </Link>
        <Link to="/transfer" search={{ method: "bank" }} className="dense-btn">
          BANK
        </Link>
        <Link to="/gifts" className="dense-btn">
          GIFT
        </Link>
        <Link to="/tools" className="dense-btn">
          {synced ? "SYNC" : "CONNECT"}
        </Link>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th className="left">D</th>
            {series.map((d) => (
              <th key={d.day}>{d.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="left pos">IN</td>
            {series.map((d) => (
              <td key={`i-${d.day}`} className="pos">
                {d.inn ? baht(d.inn) : ""}
              </td>
            ))}
          </tr>
          <tr>
            <td className="left neg">OUT</td>
            {series.map((d) => (
              <td key={`o-${d.day}`} className="neg">
                {d.out ? baht(d.out) : ""}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <TxTable rows={recent} onOpen={setReceipt} />
    </div>
  );
}
