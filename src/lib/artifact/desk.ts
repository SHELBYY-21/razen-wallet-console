export function deskHtml() {
  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>RAZEN · Glass desk</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Anuphan:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap" rel="stylesheet"/>
<style>
  :root {
    color-scheme: dark;
    --bg: #0a1020;
    --ink: #f8fafc;
    --mute: #a8b4c4;
    --gold: #c9a84c;
    --teal: #2dd4bf;
    --go: #10b981;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    color: var(--ink);
    font: 15px/1.55 Anuphan, sans-serif;
    background:
      radial-gradient(42% 36% at 12% 8%, rgb(45 212 191 / .42), transparent 58%),
      radial-gradient(38% 32% at 92% 6%, rgb(201 168 76 / .38), transparent 55%),
      radial-gradient(44% 40% at 78% 92%, rgb(16 185 129 / .28), transparent 60%),
      linear-gradient(180deg, #10203a 0%, #0a1020 52%, #070d18 100%);
  }
  .wrap { max-width: 920px; margin: 0 auto; padding: 28px 18px 48px; }
  .glass {
    background: rgb(15 23 42 / .42);
    backdrop-filter: blur(20px) saturate(1.45);
    -webkit-backdrop-filter: blur(20px) saturate(1.45);
    border: 1px solid rgb(255 255 255 / .28);
    box-shadow: inset 0 1px 0 rgb(255 255 255 / .22), 0 8px 32px rgb(0 4 16 / .28);
    border-radius: 16px;
  }
  header.glass { padding: 22px 24px; display: flex; justify-content: space-between; gap: 16px; align-items: end; }
  header strong { font-family: Sora, Anuphan, sans-serif; font-size: 28px; font-weight: 600; letter-spacing: -.03em; }
  header em { font-style: normal; color: var(--gold); letter-spacing: .18em; font-size: 11px; }
  .hero { margin-top: 16px; padding: 28px 24px; }
  .hero p { margin: 0; color: var(--mute); font-size: 13px; }
  .hero b { display: block; margin-top: 8px; font-family: Sora, Anuphan, sans-serif; font-size: 44px; color: var(--gold); font-weight: 600; letter-spacing: -.03em; }
  .grid { display: grid; grid-template-columns: 1.15fr .85fr; gap: 14px; margin-top: 14px; }
  section { padding: 20px 22px; }
  h2 { margin: 0 0 12px; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: var(--gold); }
  ol { margin: 0; padding-left: 18px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 8px 8px 8px 0; border-bottom: 1px solid rgb(255 255 255 / .1); vertical-align: top; }
  th { color: var(--mute); font-weight: 500; width: 38%; }
  code { font-family: ui-monospace, monospace; color: var(--teal); font-size: 12px; }
  .path { font-family: ui-monospace, monospace; font-size: 12px; color: var(--mute); }
  .ok { color: var(--go); }
  @media (max-width: 800px) { .grid { grid-template-columns: 1fr; } header.glass { flex-direction: column; align-items: start; } .hero b { font-size: 36px; } }
  @media (prefers-reduced-transparency: reduce) {
    .glass { backdrop-filter: none; background: #111827; }
  }
</style>
</head>
<body>
<div class="wrap">
  <header class="glass">
    <div>
      <em>OPERATOR ARTIFACT</em>
      <strong>RAZEN × TMNOne</strong>
    </div>
    <div class="path">api.tmn.one → proxy.dev.php</div>
  </header>
  <div class="glass hero">
    <p>ยอดพร้อมโอน · getBalance</p>
    <b>฿ 12,680.00</b>
    <p style="margin-top:10px">กระจกฝ้าบนพื้นกรมท่า · ทองธนาคาร · ทีลสำหรับโอน</p>
  </div>
  <div class="grid">
    <section class="glass">
      <h2>1. เชื่อมกระเป๋า — setData</h2>
      <table>
        <tr><th>tmnone_keyid</th><td>Key ID จากระบบ TMNOne</td></tr>
        <tr><th>wallet_msisdn</th><td>เบอร์วอลเล็ต</td></tr>
        <tr><th>wallet_login_token</th><td>L-… จากขั้นเพิ่มเบอร์</td></tr>
        <tr><th>wallet_tmn_id</th><td>tmn.… จากขั้นเพิ่มเบอร์</td></tr>
      </table>
      <p>จากนั้น <code>loginWithPin6(pin)</code> สำเร็จเมื่อ <code>accessToken && !accessToken.error</code></p>
    </section>
    <section class="glass">
      <h2>2. ลำดับทางการ</h2>
      <ol>
        <li>new TMNOne()</li>
        <li>setData(key, msisdn, login_token, tmn_id)</li>
        <li>setProxy(ip) ถ้าคีย์ล็อก IP</li>
        <li>loginWithPin6(pin)</li>
        <li>getBalance() — ยอดบนจอ</li>
        <li>transferP2P / transferQRPromptpay</li>
      </ol>
      <p class="ok">PIN ไม่ขึ้นตอนโอน P2P / พร้อมเพย์ / ซอง</p>
    </section>
    <section class="glass">
      <h2>3. สั่งจ่าย</h2>
      <table>
        <tr><th>transferP2P</th><td>เบอร์วอลเล็ต, จำนวน, ข้อความ</td></tr>
        <tr><th>transferQRPromptpay</th><td>เบอร์หรือบัตร, จำนวน</td></tr>
        <tr><th>transferBankAC</th><td>รหัสธนาคาร, เลขบัญชี, จำนวน</td></tr>
        <tr><th>generateVoucher</th><td>จำนวน, ข้อความซอง</td></tr>
      </table>
    </section>
    <section class="glass">
      <h2>กระจกฝ้า</h2>
      <p>blur 20px · saturate 1.45 · ขอบขาว 28% · พื้นโปร่ง 42%</p>
      <p>ถ้าปิดความโปร่งใส: พื้นทึบ #111827</p>
    </section>
  </div>
</div>
</body>
</html>
`;
}
