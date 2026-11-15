// Kresby: dárky, pomocníci, schovávačky, stromeček a ozdoby (vše vlastní SVG).

import { BOW_HEX, COLOR_HEX, type Attr, type Gift, type HelperId } from './data';

let uid = 0;
const nextId = () => `g${++uid}`;

const STAR_PATH = (cx: number, cy: number, r: number, inner = 0.45) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join('L')}Z`;
};

const HEART_PATH = 'M50 88 C20 66 8 50 8 34 C8 20 19 10 31 10 C40 10 46 15 50 22 C54 15 60 10 69 10 C81 10 92 20 92 34 C92 50 80 66 50 88Z';

function patternDef(id: string, g: Gift): string {
  const c = COLOR_HEX[g.color];
  const fg = g.color === 'yellow' ? c.dark : '#ffffff';
  switch (g.pattern) {
    case 'dots':
      return `<pattern id="${id}" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="${c.base}"/><circle cx="8" cy="8" r="3.6" fill="${fg}" opacity=".9"/></pattern>`;
    case 'stripes':
      return `<pattern id="${id}" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="14" height="14" fill="${c.base}"/><rect width="5" height="14" fill="${fg}" opacity=".85"/></pattern>`;
    case 'stars':
      return `<pattern id="${id}" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="${c.base}"/><path d="${STAR_PATH(11, 11, 6)}" fill="${fg}" opacity=".95"/></pattern>`;
    default:
      return `<pattern id="${id}" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="${c.base}"/></pattern>`;
  }
}

function bowSVG(cx: number, cy: number, g: Gift, scale = 1): string {
  const b = BOW_HEX[g.bow];
  return `<g transform="translate(${cx} ${cy}) scale(${scale})" stroke="${b.dark}" stroke-width="2" stroke-linejoin="round">
    <path d="M0 0 C-10 -16 -26 -14 -24 -4 C-22 6 -8 4 0 0Z" fill="${b.base}"/>
    <path d="M0 0 C10 -16 26 -14 24 -4 C22 6 8 4 0 0Z" fill="${b.base}"/>
    <path d="M-2 2 L-10 14 M2 2 L10 14" stroke-width="4" stroke-linecap="round"/>
    <circle r="5" fill="${b.base}"/>
  </g>`;
}

/** Dárek ve viewBoxu 0 0 100 100. Velikost se řeší zvenku (CSS). */
export function giftSVG(g: Gift): string {
  const pid = nextId();
  const c = COLOR_HEX[g.color];
  const rib = BOW_HEX[g.bow];
  const fill = `url(#${pid})`;
  let body = '';
  switch (g.shape) {
    case 'box':
      body = `
        <rect x="14" y="36" width="72" height="56" rx="4" fill="${fill}" stroke="${c.dark}" stroke-width="3"/>
        <rect x="9" y="26" width="82" height="16" rx="4" fill="${fill}" stroke="${c.dark}" stroke-width="3"/>
        <rect x="44" y="26" width="12" height="66" fill="${rib.base}" stroke="${rib.dark}" stroke-width="2"/>
        ${bowSVG(50, 25, g)}`;
      break;
    case 'ball':
      body = `
        <circle cx="50" cy="58" r="36" fill="${fill}" stroke="${c.dark}" stroke-width="3"/>
        <path d="M50 22 V94 M14 58 H86" stroke="${rib.base}" stroke-width="9"/>
        <ellipse cx="36" cy="44" rx="9" ry="6" fill="#fff" opacity=".35"/>
        ${bowSVG(50, 22, g)}`;
      break;
    case 'star':
      body = `
        <path d="${STAR_PATH(50, 58, 42, 0.5)}" fill="${fill}" stroke="${c.dark}" stroke-width="3" stroke-linejoin="round"/>
        ${bowSVG(50, 52, g, 0.8)}`;
      break;
    case 'heart':
      body = `
        <path d="${HEART_PATH}" transform="translate(0 6)" fill="${fill}" stroke="${c.dark}" stroke-width="3"/>
        <path d="M50 30 V94" stroke="${rib.base}" stroke-width="8"/>
        ${bowSVG(50, 30, g)}`;
      break;
  }
  return `<svg viewBox="0 0 100 100" class="gift-svg" aria-hidden="true"><defs>${patternDef(pid, g)}</defs>
    <ellipse cx="50" cy="95" rx="34" ry="4" fill="#000" opacity=".15"/>${body}</svg>`;
}

/** Malá ikonka pro vlastnost v bublině hádanky. */
export function attrIcon(attr: Attr, g: Gift): string {
  const grey: Gift = { color: 'blue', shape: 'box', size: 'big', pattern: 'plain', bow: 'gold' };
  switch (attr) {
    case 'color':
      return `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="${COLOR_HEX[g.color].base}" stroke="${COLOR_HEX[g.color].dark}" stroke-width="3"/></svg>`;
    case 'size':
      return g.size === 'big'
        ? `<svg viewBox="0 0 40 40"><rect x="3" y="3" width="34" height="34" rx="5" fill="#8b5a2b"/><rect x="8" y="24" width="10" height="10" rx="2" fill="#e8d5b5" opacity=".6"/></svg>`
        : `<svg viewBox="0 0 40 40"><rect x="3" y="3" width="34" height="34" rx="5" fill="none" stroke="#e8d5b5" stroke-width="2" stroke-dasharray="4 3"/><rect x="11" y="18" width="16" height="16" rx="3" fill="#8b5a2b"/></svg>`;
    case 'shape': {
      const d = { ...grey, shape: g.shape, color: 'blue' as const };
      return giftSVG(d).replace('class="gift-svg"', 'class="mono"');
    }
    case 'pattern': {
      const pid = nextId();
      return `<svg viewBox="0 0 40 40"><defs>${patternDef(pid, { ...grey, color: 'purple', pattern: g.pattern })}</defs><circle cx="20" cy="20" r="17" fill="url(#${pid})" stroke="#6a2bb8" stroke-width="2"/></svg>`;
    }
    case 'bow':
      return `<svg viewBox="-28 -20 56 40">${bowSVG(0, 0, { ...grey, bow: g.bow })}</svg>`;
  }
}

// ---------- pomocníci ----------

const EYES = (y: number, dx = 13) => `
  <g class="eyes">
    <ellipse cx="${50 - dx}" cy="${y}" rx="5" ry="6.5" fill="#2b2118"/>
    <ellipse cx="${50 + dx}" cy="${y}" rx="5" ry="6.5" fill="#2b2118"/>
    <circle cx="${48 - dx}" cy="${y - 2.5}" r="1.8" fill="#fff"/>
    <circle cx="${48 + dx}" cy="${y - 2.5}" r="1.8" fill="#fff"/>
  </g>`;

const MOUTH = (y: number) =>
  `<g class="mouth"><path class="m-closed" d="M42 ${y} Q50 ${y + 7} 58 ${y}" fill="none" stroke="#5a2d1a" stroke-width="3" stroke-linecap="round"/>
   <ellipse class="m-open" cx="50" cy="${y + 2}" rx="6" ry="5" fill="#8a2c2c"/></g>`;

export function helperSVG(id: HelperId): string {
  switch (id) {
    case 'cat':
      return `<svg viewBox="0 0 100 100" class="helper-svg helper-cat">
        <path d="M18 40 L22 8 L42 26Z" fill="#f4a259" stroke="#b5651d" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M82 40 L78 8 L58 26Z" fill="#f4a259" stroke="#b5651d" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M24 32 L25 16 L36 26Z M76 32 L75 16 L64 26Z" fill="#ffc8d2"/>
        <ellipse cx="50" cy="56" rx="38" ry="34" fill="#f4a259" stroke="#b5651d" stroke-width="2.5"/>
        <path d="M44 24 Q50 34 56 24 M36 26 Q40 32 42 26 M58 26 Q60 32 64 26" stroke="#d9822b" stroke-width="3" fill="none" stroke-linecap="round"/>
        <ellipse cx="50" cy="70" rx="20" ry="15" fill="#fff4e6"/>
        ${EYES(52)}
        <path d="M46 62 L54 62 L50 67Z" fill="#e5737f"/>
        ${MOUTH(70)}
        <path d="M30 66 L8 62 M30 70 L8 72 M70 66 L92 62 M70 70 L92 72" stroke="#7a4a20" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="28" cy="64" r="5" fill="#ff8fa3" opacity=".45"/><circle cx="72" cy="64" r="5" fill="#ff8fa3" opacity=".45"/>
      </svg>`;
    case 'elf':
      return `<svg viewBox="0 0 100 100" class="helper-svg helper-elf">
        <path d="M14 52 L2 36 L22 46Z M86 52 L98 36 L78 46Z" fill="#ffd6b8" stroke="#d29873" stroke-width="2" stroke-linejoin="round"/>
        <ellipse cx="50" cy="60" rx="34" ry="32" fill="#ffd6b8" stroke="#d29873" stroke-width="2.5"/>
        <path d="M16 46 Q50 30 84 46 L70 4 Q60 -4 52 4 Z" fill="#2a9d4b" stroke="#1b6b32" stroke-width="2.5" stroke-linejoin="round"/>
        <rect x="14" y="40" width="72" height="12" rx="6" fill="#e63946" stroke="#a4161a" stroke-width="2"/>
        <circle cx="54" cy="5" r="7" fill="#fff" stroke="#ccc" stroke-width="1.5"/>
        <circle cx="30" cy="54" r="2" fill="#c97b4a"/><circle cx="70" cy="54" r="2" fill="#c97b4a"/>
        ${EYES(62)}
        <ellipse cx="50" cy="72" rx="4" ry="3.5" fill="#f2a07b"/>
        ${MOUTH(79)}
        <circle cx="28" cy="74" r="5.5" fill="#ff8fa3" opacity=".5"/><circle cx="72" cy="74" r="5.5" fill="#ff8fa3" opacity=".5"/>
      </svg>`;
    case 'deer':
      return `<svg viewBox="0 0 100 100" class="helper-svg helper-deer">
        <path d="M30 30 L22 6 M24 18 L12 12 M26 24 L14 26 M70 30 L78 6 M76 18 L88 12 M74 24 L86 26" stroke="#8b5a2b" stroke-width="5" stroke-linecap="round" fill="none"/>
        <ellipse cx="18" cy="42" rx="12" ry="7" transform="rotate(-25 18 42)" fill="#a9713f" stroke="#6e4423" stroke-width="2"/>
        <ellipse cx="82" cy="42" rx="12" ry="7" transform="rotate(25 82 42)" fill="#a9713f" stroke="#6e4423" stroke-width="2"/>
        <ellipse cx="50" cy="56" rx="32" ry="34" fill="#b27a47" stroke="#6e4423" stroke-width="2.5"/>
        <ellipse cx="50" cy="76" rx="20" ry="14" fill="#e3c4a0"/>
        ${EYES(50, 12)}
        <circle cx="50" cy="68" r="8" fill="#e63946" stroke="#a4161a" stroke-width="2"/>
        <circle cx="47" cy="65" r="2.5" fill="#fff" opacity=".7"/>
        ${MOUTH(80)}
      </svg>`;
  }
}

// ---------- schovávačky ----------

const SPOTS: string[] = [
  // polštář
  `<path d="M8 40 Q4 20 20 18 Q50 10 80 18 Q96 20 92 40 L94 80 Q96 94 80 92 Q50 98 20 92 Q4 94 6 80Z" fill="#7aa5d6" stroke="#4a6fa0" stroke-width="3"/>
   <path d="M20 30 Q50 40 80 30 M20 80 Q50 70 80 80" stroke="#5c87bb" stroke-width="2" fill="none"/>
   <circle cx="50" cy="55" r="5" fill="#4a6fa0"/>`,
  // krabice
  `<path d="M8 30 L92 30 L92 96 L8 96Z" fill="#c8945a" stroke="#8a5d2b" stroke-width="3"/>
   <path d="M8 30 L0 14 L44 14 L50 30 M92 30 L100 14 L56 14 L50 30" fill="#ddb07a" stroke="#8a5d2b" stroke-width="3" stroke-linejoin="round"/>
   <rect x="34" y="56" width="32" height="8" fill="#e8d5b5" stroke="#8a5d2b"/>`,
  // koš
  `<path d="M6 40 L94 40 L84 96 L16 96Z" fill="#c69c5d" stroke="#7a5a2c" stroke-width="3"/>
   <path d="M10 56 L90 56 M13 72 L87 72 M15 86 L85 86 M30 40 L34 96 M50 40 L50 96 M70 40 L66 96" stroke="#7a5a2c" stroke-width="2.5"/>
   <path d="M18 40 Q50 -4 82 40" fill="none" stroke="#7a5a2c" stroke-width="6"/>`,
  // deka
  `<path d="M2 96 Q0 50 24 34 Q50 16 76 34 Q100 50 98 96Z" fill="#e85d75" stroke="#a83248" stroke-width="3"/>
   <path d="M14 70 L86 70 M10 84 L90 84 M30 40 L30 96 M50 30 L50 96 M70 40 L70 96" stroke="#fff" stroke-width="3" opacity=".6"/>`,
  // čepice
  `<path d="M10 92 Q12 40 50 22 Q88 40 90 92Z" fill="#3a86ff" stroke="#1d4ed8" stroke-width="3"/>
   <rect x="4" y="80" width="92" height="16" rx="8" fill="#fff" stroke="#bbb" stroke-width="2"/>
   <circle cx="50" cy="20" r="11" fill="#fff" stroke="#bbb" stroke-width="2"/>
   <path d="M30 50 L70 50 M24 66 L76 66" stroke="#fff" stroke-width="4" stroke-dasharray="6 6"/>`,
  // bota
  `<path d="M20 4 L60 4 L62 58 Q96 60 96 84 L96 96 L14 96 Q10 60 20 4Z" fill="#9c2f2f" stroke="#5e1717" stroke-width="3" stroke-linejoin="round"/>
   <rect x="16" y="2" width="48" height="16" rx="6" fill="#fff" stroke="#bbb" stroke-width="2"/>
   <path d="M14 90 L96 90" stroke="#5e1717" stroke-width="3"/>`,
];

export const spotSVG = (i: number) =>
  `<svg viewBox="0 0 100 100" class="spot-svg" aria-hidden="true">${SPOTS[i % SPOTS.length]}</svg>`;

// ---------- stromeček a ozdoby ----------

export const TREE_VIEWBOX = '0 0 300 400';
export const TREE_TOP = { x: 150, y: 34 };

export function treeSVG(): string {
  return `
    <path d="M150 40 L250 160 L210 160 L270 260 L220 260 L290 350 L10 350 L80 260 L30 260 L90 160 L50 160Z"
      fill="#2d8a4e" stroke="#1b5e33" stroke-width="5" stroke-linejoin="round"/>
    <path d="M150 60 L120 120 M150 60 L185 130 M90 200 L140 230 M210 190 L170 230 M70 300 L130 320 M230 300 L180 320"
      stroke="#3fae66" stroke-width="5" stroke-linecap="round" opacity=".6"/>
    <rect x="128" y="350" width="44" height="40" rx="4" fill="#7a4a24" stroke="#4e2e13" stroke-width="4"/>`;
}

export function lightsSVG(): string {
  const strands = [
    'M95 150 Q150 185 205 150',
    'M70 250 Q150 295 230 250',
    'M50 340 Q150 380 250 340',
  ];
  const colors = ['#ffd23f', '#ff70a6', '#3a86ff', '#7fd59a', '#ff8a3d'];
  let bulbs = '';
  const pts = [
    [95, 150], [122, 163], [150, 168], [178, 163], [205, 150],
    [70, 250], [100, 266], [130, 274], [170, 274], [200, 266], [230, 250],
    [50, 340], [85, 354], [125, 362], [175, 362], [215, 354], [250, 340],
  ];
  pts.forEach(([x, y], i) => {
    bulbs += `<circle class="bulb" style="animation-delay:${(i % 5) * 0.3}s" cx="${x}" cy="${y + 4}" r="6" fill="${colors[i % colors.length]}"/>`;
  });
  return `<g class="lights">${strands.map((d) => `<path d="${d}" stroke="#333" stroke-width="2" fill="none"/>`).join('')}${bulbs}</g>`;
}

const ball = (base: string, dark: string) =>
  `<rect x="-5" y="-22" width="10" height="7" rx="2" fill="#c9a227"/>
   <circle r="16" fill="${base}" stroke="${dark}" stroke-width="2.5"/>
   <path d="M-12 -2 Q0 6 12 -2" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/>
   <ellipse cx="-6" cy="-7" rx="4.5" ry="3" fill="#fff" opacity=".55"/>`;

const DECOR_SVG: Record<string, string> = {
  'ball-red': ball('#e63946', '#a4161a'),
  'ball-blue': ball('#3a86ff', '#1d4ed8'),
  'ball-gold': ball('#f7b801', '#a87400'),
  'ball-purple': ball('#9b5de5', '#6a2bb8'),
  'ball-pink': ball('#ff70a6', '#d63d7a'),
  'ball-green': ball('#7fd59a', '#2a9d4b'),
  'ball-silver': ball('#d6dde5', '#7d8a99'),
  'star-top': `<path d="${STAR_PATH(0, 0, 30)}" fill="#ffd23f" stroke="#d19b00" stroke-width="3" stroke-linejoin="round"/>`,
  lights: `<path d="M-22 -6 Q0 10 22 -6" stroke="#333" stroke-width="2" fill="none"/>
    <circle cx="-16" cy="0" r="6" fill="#ffd23f"/><circle cx="0" cy="4" r="6" fill="#ff70a6"/><circle cx="16" cy="0" r="6" fill="#3a86ff"/>`,
  bell: `<path d="M-15 10 Q-15 -16 0 -16 Q15 -16 15 10 L19 14 L-19 14Z" fill="#f7b801" stroke="#a87400" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cy="17" r="4.5" fill="#a87400"/><path d="M-6 -20 Q0 -26 6 -20" stroke="#e63946" stroke-width="4" fill="none"/>`,
  cane: `<path d="M6 20 L6 -10 Q6 -20 -2 -20 Q-10 -20 -10 -12" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M6 20 L6 -10 Q6 -20 -2 -20 Q-10 -20 -10 -12" stroke="#e63946" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="5 5"/>`,
  snowflake: `<g stroke="#bfe6ff" stroke-width="3.5" stroke-linecap="round">
    <path d="M0 -18 V18 M-16 -9 L16 9 M-16 9 L16 -9"/>
    <path d="M-5 -14 L0 -9 L5 -14 M-5 14 L0 9 L5 14" fill="none"/></g>`,
  gingerbread: `<g fill="#c47a3a" stroke="#8a4f1f" stroke-width="2">
    <circle cy="-12" r="8"/><path d="M-8 -4 L-18 2 L-15 7 L-6 3 L-9 18 L-3 20 L0 10 L3 20 L9 18 L6 3 L15 7 L18 2 L8 -4Z" stroke-linejoin="round"/></g>
    <circle cx="-3" cy="-13" r="1.4" fill="#fff"/><circle cx="3" cy="-13" r="1.4" fill="#fff"/>
    <circle cy="2" r="1.6" fill="#e63946"/><circle cy="8" r="1.6" fill="#2a9d4b"/>`,
  heart: `<path d="${HEART_PATH}" transform="translate(-18 -18) scale(.36)" fill="#e63946" stroke="#a4161a" stroke-width="6"/>`,
  teddy: `<g stroke="#6e4423" stroke-width="2">
    <circle cx="-13" cy="-26" r="7" fill="#b27a47"/><circle cx="13" cy="-26" r="7" fill="#b27a47"/>
    <ellipse cy="8" rx="20" ry="22" fill="#b27a47"/><circle cy="-18" r="15" fill="#b27a47"/>
    <ellipse cy="-13" rx="7" ry="5" fill="#e3c4a0"/></g>
    <circle cx="-5" cy="-21" r="2" fill="#2b2118"/><circle cx="5" cy="-21" r="2" fill="#2b2118"/><circle cy="-14" r="2.2" fill="#2b2118"/>`,
  snowman: `<g fill="#fff" stroke="#9fb3c8" stroke-width="2"><circle cy="14" r="18"/><circle cy="-14" r="13"/></g>
    <rect x="-11" y="-36" width="22" height="10" fill="#333"/><rect x="-15" y="-27" width="30" height="4" fill="#333"/>
    <circle cx="-4" cy="-16" r="1.8" fill="#333"/><circle cx="4" cy="-16" r="1.8" fill="#333"/>
    <path d="M0 -12 L9 -10 L0 -9Z" fill="#ff8a3d"/><path d="M-12 -3 Q0 3 12 -3" stroke="#e63946" stroke-width="5" fill="none"/>`,
  present: `<rect x="-20" y="-12" width="40" height="30" rx="2" fill="#9b5de5" stroke="#6a2bb8" stroke-width="2"/>
    <rect x="-23" y="-18" width="46" height="9" rx="2" fill="#9b5de5" stroke="#6a2bb8" stroke-width="2"/>
    <rect x="-4" y="-18" width="8" height="36" fill="#f7b801"/>
    <path d="M0 -18 C-6 -28 -16 -26 -14 -20 C-12 -14 -4 -16 0 -18Z M0 -18 C6 -28 16 -26 14 -20 C12 -14 4 -16 0 -18Z" fill="#f7b801" stroke="#a87400" stroke-width="1.5"/>`,
  bird: `<ellipse rx="16" ry="11" fill="#e63946" stroke="#a4161a" stroke-width="2"/>
    <circle cx="11" cy="-7" r="8" fill="#e63946" stroke="#a4161a" stroke-width="2"/>
    <path d="M18 -8 L25 -6 L18 -4Z" fill="#f7b801"/><circle cx="13" cy="-9" r="1.8" fill="#222"/>
    <path d="M-14 -2 L-26 -8 L-24 4Z" fill="#a4161a"/><path d="M-6 -2 Q2 -10 6 2" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/>`,
};

export const decorInner = (id: string) => DECOR_SVG[id] ?? '';

export const decorIcon = (id: string) =>
  `<svg viewBox="-32 -32 64 64" aria-hidden="true">${decorInner(id)}</svg>`;
