export function deskHtml() {
  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>CE Empire · TMNOne desk</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Anuphan:wght@400;500;600;700&family=Cinzel:wght@600;700&display=swap" rel="stylesheet"/>
<style>
  :root {
    color-scheme: dark;
    --bg: #0a0f1e;
    --ink: #e6eef7;
    --mute: #9aa8c2;
    --gold: #d4af57;
    --tmn: #ff6a00;
    --go: #34d399;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; color: var(--ink);
    font: 15px/1.55 Anuphan, sans-serif;
    background:
      radial-gradient(42% 36% at 12% 8%, rgb(212 175 87 / .22), transparent 58%),
      linear-gradient(180deg, #0f1730 0%, #0a0f1e 100%);
  }
  .wrap { max-width: 960px; margin: 0 auto; padding: 28px 18px 48px; }
  .glass {
    background: rgb(10 15 30 / .55);
    border: 1px solid rgb(212 175 87 / .22);
    border-radius: 16px;
  }
  header.glass { padding: 22px 24px; display: flex; justify-content: space-between; gap: 16px; align-items: end; }
  header strong { font-family: Cinzel, Anuphan, serif; letter-spacing: .22em; font-size: 18px; color: var(--gold); }
  header em { font-style: normal; color: var(--mute); font-size: 12px; }
  .hero { margin-top: 16px; padding: 0; overflow: hidden; display: grid; grid-template-columns: 1.1fr .9fr; }
  .tmn { background: linear-gradient(160deg, #ff8a2a, #e85d04); padding: 28px 24px; color: #fff; }
  .tmn p { margin: 0; opacity: .9; font-size: 13px; }
  .tmn b { display: block; margin-top: 8px; font-size: 36px; font-weight: 600; }
  .icons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 16px; }
  .icons span { text-align: center; font-size: 12px; padding: 12px 4px; background: rgb(255 255 255 / .05); border-radius: 12px; }
  .grid { display: grid; grid-template-columns: 1.15fr .85fr; gap: 14px; margin-top: 14px; }
  section { padding: 20px 22px; }
  h2 { margin: 0 0 12px; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: var(--gold); }
  ol { margin: 0; padding-left: 18px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 8px 8px 8px 0; border-bottom: 1px solid rgb(255 255 255 / .1); vertical-align: top; }
  th { color: var(--mute); font-weight: 500; width: 38%; }
  code { font-family: ui-monospace, monospace; color: var(--gold); font-size: 12px; }
  .path { font-family: ui-monospace, monospace; font-size: 12px; color: var(--mute); }
  .ok { color: var(--go); }
  @media (max-width: 800px) {
    .hero, .grid { grid-template-columns: 1fr; }
    header.glass { flex-direction: column; align-items: start; }
    .tmn b { font-size: 28px; }
  }
</style>
</head>
<body>
<div class="wrap">
  <header class="glass">
    <div>
      <em>OPERATOR ARTIFACT</em>
      <strong>CE EMPIRE × TMNOne</strong>
    </div>
    <div class="path">api.tmn.one → proxy.dev.php</div>
  </header>
  <div class="glass hero">
    <div class="tmn">
      <p>TrueMoney Wallet · ยอดพร้อมโอน · getBalance</p>
      <b>ซิงก์จากวอลเล็ต</b>
    </div>
    <div class="icons">
      <span>โอน</span><span>สแกน</span><span>ธนาคาร</span><span>ซอง</span>
      <span>ประวัติ</span><span>กระเป๋า</span><span>ร้าน</span><span>ตั้งค่า</span>
    </div>
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
        <li>getRecipientInfo แล้ว transferP2P / transferQRPromptpay / transferBankAC</li>
        <li>getTransferP2PStatus แล้ว fetchTransactionHistory</li>
      </ol>
      <p class="ok">PIN ใช้ตอน login เท่านั้น</p>
    </section>
  </div>
</div>
</body>
</html>`;
}
