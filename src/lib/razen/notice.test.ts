import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { makeNotice, prependNotices, unreadCount } from "./notice.ts";

describe("notice inbox", () => {
  it("prepends and caps at 40", () => {
    const first = makeNotice("โอนสำเร็จ", "100 บาท", "out", 1);
    let list = prependNotices([], first);
    for (let i = 0; i < 45; i++) {
      list = prependNotices(list, makeNotice("รับเงินแล้ว", String(i), "in", 2 + i));
    }
    assert.equal(list.length, 40);
    assert.equal(list[0].kind, "in");
    assert.equal(unreadCount(list), 40);
    assert.equal(unreadCount(list.map((n) => ({ ...n, read: true }))), 0);
  });

  it("marks kinds for desk events", () => {
    assert.equal(makeNotice("x", "y", "fail").kind, "fail");
    assert.equal(makeNotice("x", "y", "face").kind, "face");
  });
});
