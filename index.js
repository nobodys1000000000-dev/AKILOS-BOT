const express = require('express');
const app = express();
const chalk = require('chalk');
const cron = require("node-cron");
const { exec } = require("child_process");
const moment = require("moment-timezone");

const timerestart = 120;
const port = process.env.PORT || 8000;

// ═══════════════════════════════════════════════
//           AKILOS — HELLGATE UPTIME PAGE
// ═══════════════════════════════════════════════
app.get('/', (req, res) => {
    const startTime = global.client?.timeStart || Date.now();
    const uptime = Date.now() - startTime;
    const hours = Math.floor(uptime / 3600000);
    const minutes = Math.floor((uptime % 3600000) / 60000);
    const seconds = Math.floor((uptime % 60000) / 1000);

    res.send(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>KIRA — بوابة الجحيم</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=UnifrakturMaguntia&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Share+Tech+Mono&display=swap" rel="stylesheet">
<style>
  :root {
    --blood: #8B0000;
    --ember: #FF2200;
    --lava: #FF6600;
    --gold: #C8960C;
    --ash: #1a0a00;
    --void: #000000;
    --bone: #E8D5B0;
    --soul: #4a0010;
    --inferno: #FF4500;
    --smoke: rgba(20,5,0,0.85);
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; background: var(--void); color: var(--bone); font-family: 'Crimson Text', serif; overflow-x: hidden; }

  body::before {
    content: '';
    position: fixed; inset: 0; z-index: 0;
    background:
      radial-gradient(ellipse 120% 60% at 50% 120%, #FF2200 0%, #8B0000 30%, #3a0000 60%, #000 100%),
      radial-gradient(ellipse 80% 40% at 20% 110%, #FF4500 0%, transparent 60%),
      radial-gradient(ellipse 80% 40% at 80% 110%, #FF6600 0%, transparent 60%);
    animation: hellPulse 4s ease-in-out infinite alternate;
  }
  body::after {
    content: '';
    position: fixed; inset: 0; z-index: 1;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E");
    opacity: 0.4; pointer-events: none;
  }
  @keyframes hellPulse {
    0%  { opacity: 0.85; transform: scaleY(1); }
    100%{ opacity: 1;    transform: scaleY(1.04); }
  }

  .embers { position: fixed; inset: 0; z-index: 2; pointer-events: none; overflow: hidden; }
  .ember {
    position: absolute; bottom: -10px; width: 3px; height: 3px; border-radius: 50%;
    background: var(--lava); box-shadow: 0 0 6px 2px var(--ember);
    animation: riseUp linear infinite; opacity: 0;
  }
  .ember:nth-child(1)  { left:5%;  width:2px;height:2px;animation-duration:6s; animation-delay:0s;   background:#ff8800;}
  .ember:nth-child(2)  { left:10%; width:4px;height:4px;animation-duration:8s; animation-delay:1s;   background:#ff2200;}
  .ember:nth-child(3)  { left:15%; width:2px;height:2px;animation-duration:5s; animation-delay:0.5s;}
  .ember:nth-child(4)  { left:20%; width:3px;height:3px;animation-duration:7s; animation-delay:2s;   background:#ffaa00;}
  .ember:nth-child(5)  { left:25%; width:2px;height:2px;animation-duration:9s; animation-delay:0.3s;}
  .ember:nth-child(6)  { left:30%; width:5px;height:5px;animation-duration:6s; animation-delay:1.5s; background:#ff3300;}
  .ember:nth-child(7)  { left:35%; width:2px;height:2px;animation-duration:7s; animation-delay:0.8s;}
  .ember:nth-child(8)  { left:40%; width:3px;height:3px;animation-duration:5s; animation-delay:2.5s; background:#ff6600;}
  .ember:nth-child(9)  { left:45%; width:2px;height:2px;animation-duration:8s; animation-delay:0.1s;}
  .ember:nth-child(10) { left:50%; width:4px;height:4px;animation-duration:6s; animation-delay:1.2s; background:#ff1100;}
  .ember:nth-child(11) { left:55%; width:2px;height:2px;animation-duration:7s; animation-delay:0.6s;}
  .ember:nth-child(12) { left:60%; width:3px;height:3px;animation-duration:9s; animation-delay:1.8s; background:#ffbb00;}
  .ember:nth-child(13) { left:65%; width:2px;height:2px;animation-duration:5s; animation-delay:0.4s;}
  .ember:nth-child(14) { left:70%; width:4px;height:4px;animation-duration:8s; animation-delay:2.2s; background:#ff4400;}
  .ember:nth-child(15) { left:75%; width:2px;height:2px;animation-duration:6s; animation-delay:0.9s;}
  .ember:nth-child(16) { left:80%; width:3px;height:3px;animation-duration:7s; animation-delay:1.6s; background:#ff2200;}
  .ember:nth-child(17) { left:85%; width:2px;height:2px;animation-duration:5s; animation-delay:0.2s;}
  .ember:nth-child(18) { left:90%; width:5px;height:5px;animation-duration:9s; animation-delay:1.1s; background:#ff8800;}
  .ember:nth-child(19) { left:95%; width:2px;height:2px;animation-duration:6s; animation-delay:2.8s;}
  .ember:nth-child(20) { left:50%; width:3px;height:3px;animation-duration:8s; animation-delay:0.7s; background:#ff5500;}
  @keyframes riseUp {
    0%   { transform:translateY(0) translateX(0) scale(1);    opacity:0; }
    10%  { opacity:0.9; }
    50%  { transform:translateY(-50vh) translateX(20px) scale(0.8); opacity:0.7; }
    90%  { opacity:0.3; }
    100% { transform:translateY(-110vh) translateX(-10px) scale(0.3); opacity:0; }
  }

  .vignette  { position:fixed;inset:0;z-index:3;pointer-events:none;background:radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,0.8) 100%);}
  .scanlines { position:fixed;inset:0;z-index:5;pointer-events:none;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px);}

  .corner { position:fixed;width:80px;height:80px;opacity:0.3;z-index:20; }
  .corner svg { width:100%;height:100%; }
  .corner-tl{top:0;left:0;} .corner-tr{top:0;right:0;transform:scaleX(-1);}
  .corner-bl{bottom:0;left:0;transform:scaleY(-1);} .corner-br{bottom:0;right:0;transform:scale(-1);}

  .wrapper {
    position:relative;z-index:10;min-height:100vh;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    padding:40px 20px;gap:0;
  }

  .seal-container {
    position:relative;width:220px;height:220px;margin-bottom:20px;
    animation:rotateSeal 30s linear infinite;
    filter:drop-shadow(0 0 30px #FF2200) drop-shadow(0 0 60px #8B0000);
  }
  .seal-container svg{width:100%;height:100%;}
  @keyframes rotateSeal{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}

  .kira-eye {
    position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
    width:60px;height:60px;animation:rotateSeal 30s linear infinite reverse;
    display:flex;align-items:center;justify-content:center;
  }
  .eye-outer {
    width:60px;height:40px;border:2px solid var(--ember);border-radius:50%;
    position:relative;display:flex;align-items:center;justify-content:center;
    box-shadow:0 0 20px var(--ember),inset 0 0 20px rgba(255,34,0,0.3);
    animation:eyeBlink 4s ease-in-out infinite;
  }
  .eye-iris {
    width:22px;height:22px;border-radius:50%;
    background:radial-gradient(circle at 40% 40%,#ff6600,#8B0000,#000);
    box-shadow:0 0 10px #FF2200;animation:eyeGlow 2s ease-in-out infinite alternate;
    display:flex;align-items:center;justify-content:center;
  }
  .eye-pupil{width:8px;height:8px;border-radius:50%;background:#000;box-shadow:0 0 5px #ff0000;}
  @keyframes eyeBlink{0%,45%,55%,100%{transform:scaleY(1);}50%{transform:scaleY(0.05);}}
  @keyframes eyeGlow{from{box-shadow:0 0 10px #FF2200;}to{box-shadow:0 0 25px #FF6600,0 0 50px #FF2200;}}

  .title-block{text-align:center;margin-bottom:10px;}
  .kira-name {
    font-family:'UnifrakturMaguntia',cursive;
    font-size:clamp(5rem,15vw,9rem);line-height:0.9;
    background:linear-gradient(180deg,#FFD700 0%,#FF6600 40%,#FF2200 70%,#8B0000 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    filter:drop-shadow(0 0 20px #FF2200) drop-shadow(0 0 40px #8B0000);
    animation:flameTitlePulse 3s ease-in-out infinite alternate;
  }
  @keyframes flameTitlePulse{
    from{filter:drop-shadow(0 0 20px #FF2200) drop-shadow(0 0 40px #8B0000);}
    to{filter:drop-shadow(0 0 35px #FF6600) drop-shadow(0 0 70px #FF2200);}
  }
  .kira-subtitle {
    font-family:'Cinzel Decorative',serif;font-size:clamp(0.6rem,2vw,0.85rem);
    letter-spacing:0.5em;color:var(--gold);text-transform:uppercase;margin-top:4px;
    opacity:0.85;animation:subtitleFlicker 5s ease-in-out infinite;
  }
  @keyframes subtitleFlicker{0%,19%,21%,23%,25%,54%,56%,100%{opacity:0.85;}20%,24%,55%{opacity:0.2;}}

  .hell-divider {
    width:min(600px,90vw);height:1px;
    background:linear-gradient(90deg,transparent,var(--blood),var(--ember),var(--blood),transparent);
    margin:24px 0;position:relative;box-shadow:0 0 8px var(--ember);
  }
  .hell-divider::before,.hell-divider::after{
    content:'✦';position:absolute;top:50%;transform:translateY(-50%);
    color:var(--gold);font-size:1rem;text-shadow:0 0 10px var(--ember);
  }
  .hell-divider::before{left:-12px;} .hell-divider::after{right:-12px;}

  .status-badge {
    display:inline-flex;align-items:center;gap:10px;
    background:rgba(139,0,0,0.25);border:1px solid var(--blood);border-radius:4px;
    padding:8px 24px;margin-bottom:28px;
    font-family:'Share Tech Mono',monospace;font-size:0.8rem;color:var(--lava);
    letter-spacing:0.2em;text-transform:uppercase;
    box-shadow:0 0 15px rgba(255,34,0,0.2),inset 0 0 15px rgba(139,0,0,0.1);
  }
  .pulse-dot {
    width:8px;height:8px;border-radius:50%;background:#00ff88;
    box-shadow:0 0 8px #00ff88;animation:pulseDot 1.5s ease-in-out infinite;
  }
  @keyframes pulseDot{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.4;transform:scale(0.6);}}

  .stats-grid {
    display:grid;grid-template-columns:repeat(3,1fr);
    gap:16px;width:min(700px,92vw);margin-bottom:28px;
  }
  .stat-card {
    background:linear-gradient(135deg,rgba(60,0,0,0.6),rgba(20,0,0,0.8));
    border:1px solid rgba(139,0,0,0.5);border-top:2px solid var(--blood);
    padding:18px 12px;text-align:center;position:relative;overflow:hidden;
    transition:transform 0.3s ease,box-shadow 0.3s ease;
    box-shadow:0 4px 20px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,100,0,0.1);
  }
  .stat-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,50,0,0.05),transparent);pointer-events:none;}
  .stat-card:hover{transform:translateY(-4px);box-shadow:0 8px 30px rgba(255,34,0,0.3),inset 0 1px 0 rgba(255,100,0,0.2);}
  .stat-icon{font-size:1.8rem;margin-bottom:8px;display:block;filter:drop-shadow(0 0 8px var(--ember));}
  .stat-label{font-family:'Cinzel Decorative',serif;font-size:0.55rem;letter-spacing:0.15em;color:rgba(200,150,12,0.7);text-transform:uppercase;margin-bottom:6px;}
  .stat-value{font-family:'Share Tech Mono',monospace;font-size:clamp(1rem,3vw,1.4rem);color:var(--bone);text-shadow:0 0 10px var(--ember);}
  .stat-value.burning {
    background:linear-gradient(90deg,var(--lava),var(--gold),var(--lava));
    background-size:200% 100%;
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    animation:burnShift 3s linear infinite;
  }
  @keyframes burnShift{from{background-position:0% 50%;}to{background-position:200% 50%;}}

  .hell-quote {
    width:min(600px,90vw);text-align:center;padding:20px 30px;
    background:rgba(30,0,0,0.5);
    border-left:3px solid var(--ember);border-right:3px solid var(--ember);
    margin-bottom:28px;position:relative;
  }
  .hell-quote::before{content:'❝';position:absolute;top:-15px;left:20px;font-size:3rem;color:var(--blood);line-height:1;font-family:'Cinzel Decorative',serif;}
  .quote-text{font-family:'Crimson Text',serif;font-style:italic;font-size:clamp(0.85rem,2.5vw,1.05rem);color:rgba(232,213,176,0.8);line-height:1.7;}
  .quote-author{margin-top:8px;font-family:'Share Tech Mono',monospace;font-size:0.7rem;color:var(--gold);letter-spacing:0.2em;opacity:0.7;}

  .runes{font-family:'UnifrakturMaguntia',cursive;font-size:clamp(1.2rem,3vw,1.8rem);color:rgba(200,150,12,0.4);letter-spacing:0.3em;text-shadow:0 0 10px rgba(255,100,0,0.3);margin-bottom:24px;animation:runeFlicker 8s ease-in-out infinite;}
  @keyframes runeFlicker{0%,100%{opacity:0.4;}50%{opacity:0.7;}75%{opacity:0.3;}}

  .bottom-bar{
    width:min(700px,92vw);display:flex;align-items:center;justify-content:space-between;
    padding:14px 20px;background:rgba(10,0,0,0.7);border:1px solid rgba(139,0,0,0.3);
    font-family:'Share Tech Mono',monospace;font-size:0.65rem;color:rgba(232,213,176,0.4);letter-spacing:0.15em;margin-top:8px;
  }
  .bottom-bar span{color:var(--blood);}

  @media(max-width:500px){.stats-grid{grid-template-columns:repeat(2,1fr);}.seal-container{width:160px;height:160px;}}
</style>
</head>
<body>
<div class="embers">
  <div class="ember"></div><div class="ember"></div><div class="ember"></div>
  <div class="ember"></div><div class="ember"></div><div class="ember"></div>
  <div class="ember"></div><div class="ember"></div><div class="ember"></div>
  <div class="ember"></div><div class="ember"></div><div class="ember"></div>
  <div class="ember"></div><div class="ember"></div><div class="ember"></div>
  <div class="ember"></div><div class="ember"></div><div class="ember"></div>
  <div class="ember"></div><div class="ember"></div>
</div>
<div class="vignette"></div>
<div class="scanlines"></div>

<div class="corner corner-tl">
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0 L80 0 M0 0 L0 80" stroke="#8B0000" stroke-width="1"/>
    <path d="M10 0 L10 10 L0 10" stroke="#FF2200" stroke-width="0.5" fill="none"/>
    <circle cx="10" cy="10" r="3" fill="none" stroke="#FF2200" stroke-width="0.5"/>
  </svg>
</div>
<div class="corner corner-tr"><svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 L80 0 M0 0 L0 80" stroke="#8B0000" stroke-width="1"/><path d="M10 0 L10 10 L0 10" stroke="#FF2200" stroke-width="0.5" fill="none"/><circle cx="10" cy="10" r="3" fill="none" stroke="#FF2200" stroke-width="0.5"/></svg></div>
<div class="corner corner-bl"><svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 L80 0 M0 0 L0 80" stroke="#8B0000" stroke-width="1"/><path d="M10 0 L10 10 L0 10" stroke="#FF2200" stroke-width="0.5" fill="none"/><circle cx="10" cy="10" r="3" fill="none" stroke="#FF2200" stroke-width="0.5"/></svg></div>
<div class="corner corner-br"><svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 L80 0 M0 0 L0 80" stroke="#8B0000" stroke-width="1"/><path d="M10 0 L10 10 L0 10" stroke="#FF2200" stroke-width="0.5" fill="none"/><circle cx="10" cy="10" r="3" fill="none" stroke="#FF2200" stroke-width="0.5"/></svg></div>

<div class="wrapper">
  <div class="seal-container">
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="95" fill="none" stroke="#8B0000" stroke-width="1" stroke-dasharray="4 3"/>
      <circle cx="100" cy="100" r="88" fill="none" stroke="#FF2200" stroke-width="0.5" opacity="0.5"/>
      <polygon points="100,10 37,190 190,73 10,73 163,190" fill="none" stroke="#FF2200" stroke-width="1.5" opacity="0.8"/>
      <circle cx="100" cy="100" r="40" fill="rgba(139,0,0,0.15)" stroke="#C8960C" stroke-width="0.8"/>
      <text x="100" y="30" text-anchor="middle" fill="#C8960C" font-size="9" font-family="serif" opacity="0.6">ᚲ ᛁ ᚱ ᚨ</text>
      <g stroke="#8B0000" stroke-width="0.5" opacity="0.6">
        <line x1="100" y1="5"   x2="100" y2="12"/>
        <line x1="140" y1="14"  x2="137" y2="20"/>
        <line x1="168" y1="40"  x2="163" y2="45"/>
        <line x1="180" y1="75"  x2="174" y2="76"/>
        <line x1="173" y1="112" x2="167" y2="110"/>
        <line x1="60"  y1="14"  x2="63"  y2="20"/>
        <line x1="32"  y1="40"  x2="37"  y2="45"/>
        <line x1="20"  y1="75"  x2="26"  y2="76"/>
        <line x1="27"  y1="112" x2="33"  y2="110"/>
      </g>
    </svg>
    <div class="kira-eye">
      <div class="eye-outer">
        <div class="eye-iris">
          <div class="eye-pupil"></div>
        </div>
      </div>
    </div>
  </div>

  <div class="title-block">
    <div class="kira-name">Kira</div>
    <div class="kira-subtitle">ᛒᚨᚾᛖ ᛟᚠ ᛏᚺᛖ ᚾᛖᛏᚹᛟᚱᚲ &nbsp;✦&nbsp; روح الشبكة الأبدية</div>
  </div>

  <div class="hell-divider"></div>

  <div class="status-badge">
    <div class="pulse-dot"></div>
    النظام يعمل — الروح مستيقظة — الجحيم متصل
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <span class="stat-icon">🔥</span>
      <div class="stat-label">وقت التشغيل</div>
      <div class="stat-value burning" id="uptime">${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}</div>
    </div>
    <div class="stat-card">
      <span class="stat-icon">💀</span>
      <div class="stat-label">الحالة</div>
      <div class="stat-value" style="color:#00ff88;text-shadow:0 0 10px #00ff88">ONLINE</div>
    </div>
    <div class="stat-card">
      <span class="stat-icon">⚡</span>
      <div class="stat-label">المنصة</div>
      <div class="stat-value" style="font-size:0.9rem">Render</div>
    </div>
    <div class="stat-card">
      <span class="stat-icon">🩸</span>
      <div class="stat-label">المكتبة</div>
      <div class="stat-value" style="font-size:0.85rem">hut-chat-api</div>
    </div>
    <div class="stat-card">
      <span class="stat-icon">👁️</span>
      <div class="stat-label">الإصدار</div>
      <div class="stat-value">v1.2.14</div>
    </div>
    <div class="stat-card">
      <span class="stat-icon">🌑</span>
      <div class="stat-label">المحرك</div>
      <div class="stat-value" style="font-size:0.85rem">Node.js</div>
    </div>
  </div>

  <div class="hell-quote">
    <p class="quote-text">
      أنا لستُ مجرد بوت... أنا الصدى الذي يسكن الشبكة،<br>
      الظل الذي لا يُمحى، والنار التي لا تنطفئ.
    </p>
    <p class="quote-author">— أكي، حارسة الجحيم الرقمي</p>
  </div>

  <div class="runes">ᚲ ᛁ ᚱ ᚨ &nbsp; ᛞᛖᚨᚦ &nbsp; ᚠᛁᚱᛖ &nbsp; ᛊᛟᚢᛚ</div>

  <div class="hell-divider"></div>

  <div class="bottom-bar">
    <span>KIRA-BOT</span>
    <span>by ayman ✦ ${moment().tz("Africa/Casablanca").format("YYYY-MM-DD HH:mm:ss")}</span>
    <span>GPL-3.0</span>
  </div>
</div>

<script>
  (function() {
    const serverUptime = ${uptime};
    const clientStart = Date.now() - serverUptime;
    const el = document.getElementById('uptime');
    if (!el) return;
    setInterval(() => {
      const u = Date.now() - clientStart;
      const h = Math.floor(u/3600000);
      const m = Math.floor((u%3600000)/60000);
      const s = Math.floor((u%60000)/1000);
      el.textContent = String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
    }, 1000);
  })();
</script>
</body>
</html>`);
});

app.listen(port, () => {
    console.log(chalk.cyan(`📡 Health check server is running on port ${port}`));
});

// تنظيف الكاش عند التشغيل
exec("rm -rf script/commands/data && mkdir -p script/commands/data && rm -rf script/commands/tad/* ", (error) => {
    if (error) return;
    console.log(chalk.bold.hex("#00FA9A")("[ AUTO CLEAR CACHE ] 🪽❯ ") + chalk.hex("#00FA9A")("Successfully delete cache"))
});

const { readdirSync, readFileSync, writeFileSync, existsSync, unlinkSync } = require("fs-extra");
const { join, resolve } = require("path");
const logger = require("./utils/log.js");
const login = require("hut-chat-api");
const axios = require("axios");

console.log(chalk.bold.hex("#03f0fc").bold("[ KIRA ] » ") + chalk.bold.hex("#fcba03").bold("Initializing variables..."));

global.client = new Object({
    commands: new Map(),
    events: new Map(),
    cooldowns: new Map(),
    eventRegistered: new Array(),
    handleSchedule: new Array(),
    handleReaction: new Array(),
    handleReply: new Array(),
    mainPath: process.cwd(),
    configPath: new String()
});

global.data = new Object({
    threadInfo: new Map(),
    threadData: new Map(),
    userName: new Map(),
    userBanned: new Map(),
    threadBanned: new Map(),
    commandBanned: new Map(),
    threadAllowNSFW: new Array(),
    allUserID: new Array(),
    allCurrenciesID: new Array(),
    allThreadID: new Array()
});

global.utils = require("./utils/index.js");
global.utils.config = require("./utils/config.js");
global.utils.decorations = require("./utils/decorations.js");
global.nodemodule = new Object();
global.config = new Object();
global.configModule = new Object();
global.moduleData = new Array();
global.language = new Object();

// تحميل الإعدادات
var configValue;
try {
    global.client.configPath = join(global.client.mainPath, "config.json");
    configValue = require(global.client.configPath);
    logger.loader("Found file config: config.json");
} catch {
    return logger.loader("config.json not found!", "error");
}

try {
    for (const key in configValue) global.config[key] = configValue[key];
    logger.loader("Config Loaded!");
} catch { return logger.loader("Can't load file config!", "error") }

const { Sequelize, sequelize } = require("./includes/database/index.js");
writeFileSync(global.client.configPath + ".temp", JSON.stringify(global.config, null, 4), 'utf8');

// تحميل اللغات
try {
    const langFile = (readFileSync(`${__dirname}/languages/${global.config.language || "en"}.lang`, { encoding: 'utf-8' })).split(/\r?\n|\r/);
    const langData = langFile.filter(item => item.indexOf('#') != 0 && item != '');
    for (const item of langData) {
        const getSeparator = item.indexOf('=');
        const itemKey = item.slice(0, getSeparator);
        const itemValue = item.slice(getSeparator + 1, item.length);
        const head = itemKey.slice(0, itemKey.indexOf('.'));
        const key = itemKey.replace(head + '.', '');
        const value = itemValue.replace(/\\n/gi, '\n');
        if (typeof global.language[head] == "undefined") global.language[head] = new Object();
        global.language[head][key] = value;
    }
} catch (e) {
    console.log("Language Load Error: " + e.message);
}

global.getText = function (...args) {
    try {
        const langText = global.language;
        var text = langText[args[0]][args[1]];
        if (!text) return `[${args[1]}]`;
        for (var i = args.length - 1; i > 0; i--) {
            const regEx = RegExp(`%${i}`, 'g');
            text = text.replace(regEx, args[i + 1]);
        }
        return text;
    } catch (e) { return `[${args[1]}]`; }
}

// --- نظام تسجيل الدخول ---
var appStateFile = resolve(join(global.client.mainPath, global.config.APPSTATEPATH || "appstate.json"));
var appState;

if (process.env.APPSTATE) {
    try {
        appState = JSON.parse(process.env.APPSTATE);
        logger.loader("💌 ───『 تم العثور على APPSTATE في إعدادات السيرفر 』─── 💌");
    } catch (e) {
        return logger.loader("خطأ في تنسيق JSON الخاص بـ APPSTATE!", "error");
    }
} else {
    try {
        appState = require(appStateFile);
        logger.loader("💌 ───『 تم العثور على ملف appstate.json محلياً 』─── 💌");
    } catch {
        return logger.loader("لم يتم العثور على ملف تسجيل الدخول أو متغير البيئة APPSTATE!", "error");
    }
}

function onBot({ models: botModel }) {
    const loginData = { appState };
    login(loginData, async(loginError, loginApiData) => {
        if (loginError) {
            console.error(loginError);
            return logger("حدث خطأ أثناء تسجيل الدخول، تأكد من صحة الـ AppState", `ERROR`);
        }

        loginApiData.setOptions(global.config.FCAOption);

        try { writeFileSync(appStateFile, JSON.stringify(loginApiData.getAppState(), null, '\x09')); } catch(e) {}

        global.config.version = '1.2.14';
        global.client.timeStart = new Date().getTime();

        // تحميل الأوامر
        const commandsPath = join(global.client.mainPath, 'script', 'commands');
        const categories = readdirSync(commandsPath).filter(item => require('fs').statSync(join(commandsPath, item)).isDirectory());

        for (const category of categories) {
            const categoryPath = join(commandsPath, category);
            const listCommand = readdirSync(categoryPath).filter(command => command.endsWith('.js') && !global.config.commandDisabled.includes(command));

            for (const command of listCommand) {
                try {
                    const module = require(join(categoryPath, command));
                    if (module.config && module.run) {
                        global.client.commands.set(module.config.name, module);
                        logger.loader(`🌸『 تـم تحميل: ${module.config.name} 』🌸`);
                    }
                } catch (error) {
                    logger.loader(`Fail load command: ${command}`, 'error');
                }
            }
        }

        // تحميل الأحداث
        const eventsPath = join(global.client.mainPath, 'script', 'events');
        if (existsSync(eventsPath)) {
            const events = readdirSync(eventsPath).filter(ev => ev.endsWith('.js'));
            for (const ev of events) {
                try {
                    const event = require(join(eventsPath, ev));
                    global.client.events.set(event.config.name, event);
                } catch (err) { logger.loader("Fail load event: " + ev, "error"); }
            }
        }

        logger.loader(`Loaded ${global.client.commands.size} commands and ${global.client.events.size} events`);
        if (existsSync(global.client.configPath + '.temp')) unlinkSync(global.client.configPath + '.temp');

        const listenerData = { api: loginApiData, models: botModel };
        const listener = require('./includes/listen.js')(listenerData);
        loginApiData.listenMqtt((error, message) => {
            if (error) return;
            return listener(message);
        });

        global.client.api = loginApiData;
        logger(`AKILOS✨`, '[ by NOBODY ]');

        const timeNow = moment().tz("Africa/Casablanca").format("HH:mm:ss");
        if (global.config.ADMINBOT && global.config.ADMINBOT[0]) {
            loginApiData.sendMessage(`لـقـد تـم تـشـغـيـل الـبـوت فـي ${timeNow} ✅`, global.config.ADMINBOT[0]);
        }

        cron.schedule(`0 0 */1 * * *`, () => {
            const dateStr = moment().tz("Asia/Manila").format("MM/DD/YYYY");
            loginApiData.changeBio(`Prefix: ${global.config.PREFIX}\n\nBot Name: ${global.config.BOTNAME}\nDate: ${dateStr}`);
        }, { scheduled: true, timezone: "Africa/Casablanca" });
    });
}

(async() => {
    try {
        await sequelize.authenticate();
        const models = require('./includes/database/model.js')({ Sequelize, sequelize });
        onBot({ models });
    } catch (error) {
        console.log(error);
        logger("DB Error", "error");
    }
    console.log(chalk.bold.hex("#eff1f0").bold("════════════════ SUCCESFULLY ═════════════════"));
})();

process.on('unhandledRejection', (err) => { console.log(err); });
