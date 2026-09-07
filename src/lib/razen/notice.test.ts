import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { makeNotice, markOneRead, prependNotices, unreadCount } from "./notice.ts";

describe("notice inbox", () => {
  it("prepends and caps at 40", () => {
    const first = makeNotice("จ่ายแล้ว", "100 บาท", "out", 1);
    let list = prependNotices([], first);
    for (let i = 0; i < 45; i++) {
      list = prependNotices(list, makeNotice("เงินเข้า", String(i), "in", 2 + i));
    }
    assert.equal(list.length, 40);
    assert.equal(list[0].kind, "in");
    assert.equal(unreadCount(list), 40);
    assert.equal(unreadCount(list.map((n) => ({ ...n, read: true }))), 0);
  });

  it("links a pay event to its receipt", () => {
    const n = makeNotice("กำลังจ่าย", "100", "out", 1, { txId: "t-1", href: "/history" });
    assert.equal(n.txId, "t-1");
    assert.equal(n.href, "/history");
    const read = markOneRead([n], n.id);
    assert.equal(read[0].read, true);
    assert.equal(unreadCount(read), 0);
  });

  it("marks kinds for desk events", () => {
    assert.equal(makeNotice("x", "y", "fail").kind, "fail");
    assert.equal(makeNotice("x", "y", "face").kind, "face");
    assert.equal(makeNotice("x", "y", "quota").kind, "quota");
  });
});
