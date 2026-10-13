// Generates intro.svg, the animated terminal on the profile README. Run: node assets/intro.mjs
import { writeFileSync } from 'node:fs';

const FS = 16, CW = FS * 0.602, LH = 28, PAD = 16, X = PAD + 30, Y0 = PAD + 74;
const cps = 0.05; // seconds per typed character

// ['cmd', text]                      typed by hand, cursor follows
// ['out', text | [[text, cls], …], delay?]   printed after the command
// ['wait', seconds]                 blinking marker, replaced by the next line
const lines = [
  ['cmd', 'whoami'],
  ['out', [['caiqianha', 'w'], [' · 前端开发者', 'o']]],
  ['cmd', 'cat ~/.正在用'],
  ['out', [['vue 3', 'w'], [' · ', 'o'], ['typescript', 'w'], [' · ', 'o'], ['小程序', 'w'], [' · ', 'o'], ['node', 'w'], [' · ', 'o'], ['claude code', 'w']]],
  ['cmd', 'tail -f ~/.关注'],
  ['out', 'AI 编程 agent', 0.7],
  ['out', 'Agent Skills', 0.9],
  ['wait', 1.4],
  ['out', [['^C', 'dim']], 0.5],
  ['cmd', 'git log --oneline -3'],
  ['out', [['a3f9c1e ', 'y'], ['把重复的活交给 agent', 'w']]],
  ['out', [['7b2d04e ', 'y'], ['学了个新东西，还没想好用在哪', 'w']]],
  ['out', [['e51c8aa ', 'y'], ['删掉两百行，功能不变', 'w']]],
  ['cmd', 'ls ~/项目'],
  ['out', [['几个小而完整的工具/', 'b']]],
  ['cmd', ''],
];

const width = (text) => [...text].reduce((w, ch) => w + (ch.codePointAt(0) > 0x2e7f ? FS : CW), 0);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const segs = (t) => (Array.isArray(t) ? t : [[t, 'o']]).map(([s, c]) => `<tspan class="${c}">${esc(s)}</tspan>`).join('');
const plain = (t) => (Array.isArray(t) ? t.map(([s]) => s).join('') : t);

const rows = lines.filter(([k]) => k !== 'wait').length;
const W = 880, H = Y0 + LH * rows - 4 + PAD;
let t = 0.6, body = '', defs = '', row = 0;
lines.forEach(([kind, text, delay], i) => {
  const y = Y0 + LH * row;
  if (kind === 'wait') {
    body += `<text class="m dim" x="${X}" y="${y}" opacity="0"><set attributeName="opacity" to="1" begin="${t.toFixed(2)}s"/><set attributeName="opacity" to="0" begin="${(t + text).toFixed(2)}s"/>▍</text>\n`;
    t += text;
    return;
  }
  row++;
  if (kind === 'cmd') {
    const promptW = 4 * CW;
    const tw = Math.ceil(width(text)) + 2;
    const dur = Math.max(0.3, text.length * cps);
    const start = t.toFixed(2);
    const last = i === lines.length - 1;
    defs += `<clipPath id="k${i}"><rect x="${X + promptW}" y="${y - FS - 4}" width="0" height="${LH}"><animate attributeName="width" from="0" to="${tw}" begin="${start}s" dur="${dur}s" fill="freeze"/></rect></clipPath>\n`;
    body += `<g opacity="0"><set attributeName="opacity" to="1" begin="${start}s"/>` +
      `<text class="m" x="${X}" y="${y}"><tspan class="dir">~</tspan> <tspan class="p">❯</tspan></text>` +
      `<text class="m cmd" x="${X + promptW}" y="${y}" clip-path="url(#k${i})">${esc(text)}</text>` +
      `<rect class="cur" x="${X + promptW}" y="${y - FS + 1}" width="${CW}" height="${FS + 3}">` +
      (last ? '' : `<animate attributeName="x" from="${X + promptW}" to="${X + promptW + tw}" begin="${start}s" dur="${dur}s" fill="freeze"/><set attributeName="opacity" to="0" begin="${(t + dur + 0.3).toFixed(2)}s"/>`) +
      `</rect></g>\n`;
    t += dur + 0.45;
  } else {
    body += `<text class="m" x="${X}" y="${y}" opacity="0"><set attributeName="opacity" to="1" begin="${t.toFixed(2)}s"/>${segs(text)}</text>\n`;
    t += delay ?? 0.5;
  }
});

const label = lines.filter(([k]) => k === 'out').map(([, tx]) => plain(tx)).filter((s) => !/^\^/.test(s)).join('；');
console.log('alt:', label);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">
<defs>
<linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#2dd4bf"/><stop offset="0.5" stop-color="#60a5fa"/><stop offset="1" stop-color="#c084fc"/>
</linearGradient>
<filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
  <feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#000" flood-opacity="0.35"/>
</filter>
<clipPath id="win"><rect x="${PAD}" y="${PAD}" width="${W - 2 * PAD}" height="${H - 2 * PAD}" rx="12"/></clipPath>
<style>
  .m   { font: ${FS}px ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; fill: #c9d1d9; white-space: pre; }
  .p   { fill: #3fb950; font-weight: 700; }
  .dir { fill: #58a6ff; font-weight: 700; }
  .cmd { fill: #e6edf3; }
  .o   { fill: #8b949e; }
  .w   { fill: #e6edf3; }
  .b   { fill: #58a6ff; font-weight: 700; }
  .y   { fill: #d29922; }
  .dim { fill: #484f58; }
  .cur { fill: #58a6ff; animation: blink 1.1s steps(1) infinite; }
  .ttl { font: 12px -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; fill: #8b949e; }
  @keyframes blink { 50% { opacity: 0 } }
</style>
${defs}</defs>
<g filter="url(#shadow)">
  <rect x="${PAD}" y="${PAD}" width="${W - 2 * PAD}" height="${H - 2 * PAD}" rx="12" fill="#0d1117"/>
  <rect x="${PAD}" y="${PAD}" width="${W - 2 * PAD}" height="40" clip-path="url(#win)" fill="#161b22"/>
  <rect x="${PAD}" y="${PAD}" width="${W - 2 * PAD}" height="${H - 2 * PAD}" rx="12" fill="none" stroke="url(#edge)" stroke-opacity="0.6"/>
</g>
<circle cx="${PAD + 22}" cy="${PAD + 21}" r="6" fill="#ff5f57"/><circle cx="${PAD + 42}" cy="${PAD + 21}" r="6" fill="#febc2e"/><circle cx="${PAD + 62}" cy="${PAD + 21}" r="6" fill="#28c840"/>
<text class="ttl" x="${W / 2}" y="${PAD + 25}" text-anchor="middle">caiqianha — zsh</text>
${body}</svg>`;
writeFileSync(new URL('./intro.svg', import.meta.url), svg);
console.log('height', H, 'total seconds', t.toFixed(1));
