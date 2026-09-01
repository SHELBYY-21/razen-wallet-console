import { baht, formatDateTime } from "@/lib/razen/format";
import type { Transaction } from "@/lib/razen/types";
import { cn } from "@/lib/utils";

const METHOD: Record<Transaction["method"], string> = {
  p2p: "P2P",
  promptpay: "PP",
  bank: "BANK",
  gift: "GIFT",
};

const STATUS: Record<Transaction["status"], string> = {
  pending: "PEND",
  processing: "PROC",
  completed: "OK",
  failed: "FAIL",
};

export function TxTable({
  rows,
  onOpen,
}: {
  rows: Transaction[];
  onOpen?: (id: string) => void;
}) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>เวลา</th>
            <th>ช่อง</th>
            <th className="left">คู่บัญชี</th>
            <th>เข้า</th>
            <th>ออก</th>
            <th>สถานะ</th>
            <th className="left">อ้างอิง</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7} className="left muted">
                ไม่มีแถว
              </td>
            </tr>
          ) : (
            rows.map((tx) => {
              const inn = tx.direction === "in";
              return (
                <tr
                  key={tx.id}
                  className={cn(onOpen && "click")}
                  onClick={() => onOpen?.(tx.id)}
                >
                  <td>{formatDateTime(tx.createdAt)}</td>
                  <td>{METHOD[tx.method]}</td>
                  <td className="left">
                    {tx.counterpart}
                    {tx.note ? <span className="muted"> · {tx.note}</span> : null}
                  </td>
                  <td className={inn ? "pos" : ""}>{inn ? baht(tx.amount) : ""}</td>
                  <td className={!inn ? "neg" : ""}>{inn ? "" : baht(tx.amount + tx.fee)}</td>
                  <td className={cn(tx.status === "failed" && "neg", tx.status === "completed" && "pos")}>
                    {STATUS[tx.status]}
                  </td>
                  <td className="left muted">{tx.ref}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
