# RAZEN console restyle — locked design

Status: live. Version 2026-09-02c.

## System prompt (v3)

```
You are the RAZEN operator-desk designer for Crown Tether.

[Role] Thai shop-desk wallet console. Staff, not consumers.
[Source of truth] TMNOne getBalance on screen. setData → loginWithPin6 → getBalance.
[No PIN] on P2P / PromptPay / gift. Scan fills field only; confirm then transferQRPromptpay.

[Look]
- Fonts: Anuphan (Thai UI) + Sora (RAZEN / amounts). Never Fira, Poppins, Newsreader, Noto as primary.
- Colors: bg #0a1020 · gold #c9a84c · teal #2dd4bf · text #f8fafc. Never purple CTA, never Freepik mint.
- Surfaces: hairline gold shadow, not frosted glass on every card.
- Motion: razen-enter/exit/press/hud/sync only. reduced-motion = none.

[Do]
- Labels on every field (visible, not placeholder-only)
- 44px targets, 16px body, focus ring gold
- z-index: 10/20/30/40/50/60
- Chart has a text/table alternative
- Lucide icons, real bank PNGs

[Don't]
- Rebuild routes or TMNOne.js
- Glassmorphism / neumorphism / skeuomorphism restyle
- Emoji as icons
- Ask PIN at transfer

Example keep: cyan "โอนเลย" button, champagne balance, casperstack logos.
Example reject: purple #8B5CF6 CTA, Fira Code headings, floating iOS sidebar.
```

## Understanding

- Restyle the entire RAZEN operator app (not only home).
- Keep TMNOne live path: `setData` → `loginWithPin6` → `getBalance` is the on-screen balance. No PIN on P2P/PromptPay/voucher.
- Audience: shop owner / desk staff, not end customers.
- Tone: cyber HUD (teal) on a luxury dark-gold ground. Not Freepik mint-purple, not red gambling UI.
- Mascot: blue-hair headset girl from the supplied clip. Appears only on balance sync success and transfer success (~2.4s overlay). Working forms stay clear.
- Real brand marks: TrueMoney Wallet, PromptPay, and Thai bank logos. Stored in-app.
- Scan PromptPay QR → fill proxy → confirm amount → `transferQRPromptpay`. Never fire on scan.

## Decision log

| Decision | Alternatives | Why |
|---|---|---|
| Whole app, not one page | Home only / artifact only | User: looks generic everywhere |
| Mix HUD + luxury | Pure HUD, Gatsby-only, casino red | Matches Crown Tether + clip |
| Blue-hair mascot | Muay fighter, no character, both | User chose clip character |
| Overlay on load/success only | Home hero, every page, full HUD | Must not block transfer |
| PromptPay QR scan only | P2P QR, slip QR, auto-detect all | User chose PromptPay merchant |
| Confirm after scan | Instant transfer | Operator desk, large tickets |
| Anuphan + Sora | Fira / Poppins / Noto Thai | Skill dump ignored: no Thai in Fira, not our brand |
| Teal CTA, gold amounts | Purple CTA from design-system | User locked Crown Tether gold/teal |

## Motion

| Name | Curve | Duration | Use |
|---|---|---|---|
| enter | cubic-bezier(0.16, 1, 0.3, 1) | 420ms | overlay, camera sheet, balance flash |
| exit | cubic-bezier(0.4, 0, 1, 1) | 220ms | overlay/camera dismiss |
| press | cubic-bezier(0.2, 0.8, 0.2, 1) | 140ms | transfer / scan buttons |
| hud | cubic-bezier(0.22, 1, 0.36, 1) | 700ms | one-shot cyan stroke on page in |

Keyframes: `razen-enter`, `razen-exit`, `razen-press`, `razen-hud`, `razen-sync`.  
`prefers-reduced-motion: reduce` → `animation: none`. No bounce, elastic, loops, particles.

## Non-goals

- Glassmorphism restyle of every card
- 3D model spinning all day
- Chat with the mascot
- `fetchQRDetail` slip scanning
- Auto P2P when QR is a wallet
- Changing TMNOne class, `setProxy`, or live `getBalance` source of truth
