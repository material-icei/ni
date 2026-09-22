/**
 * game.js — Lógica del Bingo de las Letras (1º grado)
 * Depende de: data.js (WORDS, ALPHABET, FREE_CELL, constantes)
 */

'use strict';

// =============================================
// ESTADO GLOBAL
// =============================================

let selectedPlayer  = null;
let boards          = {};
let markedState     = {};
let celebrationShown = { linea: false, bingo: false };

// =============================================
// UTILIDADES
// =============================================

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// =============================================
// GENERACIÓN DE TABLEROS
// =============================================

function generateBoard(playerId) {
  const allLetters = shuffle([...ALPHABET]);
  let pool = [];

  for (const letter of allLetters) {
    const words = shuffle(WORDS[letter] || []);
    const take = Math.random() > 0.5 ? 2 : 1;
    pool.push(...words.slice(0, take).map(w => ({ ...w, letter })));
    if (pool.length >= WORD_CELLS + 8) break;
  }

  if (pool.length < WORD_CELLS) {
    for (const letter of allLetters) {
      const words = shuffle(WORDS[letter] || []);
      pool.push(...words.slice(0, 3).map(w => ({ ...w, letter })));
      if (pool.length >= WORD_CELLS + 4) break;
    }
  }

  pool = shuffle(pool).slice(0, WORD_CELLS);

  const positions     = shuffle([...Array(TOTAL_CELLS).keys()]);
  const wordPositions = new Set(positions.slice(0, WORD_CELLS));

  const cells  = [];
  let wordIdx  = 0;

  for (let i = 0; i < TOTAL_CELLS; i++) {
    if (wordPositions.has(i)) {
      cells.push({ ...pool[wordIdx++], isFree: false });
    } else {
      cells.push({ ...FREE_CELL });
    }
  }

  return cells;
}

function initBoards() {
  for (let i = 1; i <= TOTAL_BOARDS; i++) {
    boards[i]      = generateBoard(i);
    markedState[i] = boards[i].map(cell => cell.isFree);
  }
}

// =============================================
// LÓGICA DE LÍNEA Y BINGO
// =============================================

function checkLinea(playerId) {
  const m     = markedState[playerId];
  const cells = boards[playerId];

  for (let r = 0; r < GRID_ROWS; r++) {
    let rowComplete = true;
    let hasObjects  = false;

    for (let c = 0; c < GRID_COLS; c++) {
      const idx  = r * GRID_COLS + c;
      const cell = cells[idx];
      if (!cell.isFree) {
        hasObjects = true;
        if (!m[idx]) { rowComplete = false; break; }
      }
    }
    if (hasObjects && rowComplete) return true;
  }
  return false;
}

function checkBingo(playerId) {
  const m     = markedState[playerId];
  const cells = boards[playerId];
  return cells.every((cell, i) => cell.isFree || m[i]);
}

function getBoardState(playerId) {
  if (checkBingo(playerId)) return 'bingo';
  if (checkLinea(playerId)) return 'linea';
  return null;
}

function toggleMark(playerId, idx) {
  markedState[playerId][idx] = !markedState[playerId][idx];
  renderBoard(playerId);
  checkAndCelebrate(playerId);
}

// =============================================
// CELEBRACIÓN — tarjeta flotante
// =============================================

const CONFETTI_COLORS = [
  '#FFD93D','#FF6B35','#FF9F1C','#74C7EC','#3A86FF',
  '#6BCB77','#FF6B9D','#C77DFF','#ffffff','#f5a623'
];

function spawnConfetti() {
  const container = document.getElementById('celebrationConfetti');
  container.innerHTML = '';
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.setProperty('--x',     Math.random() * 100 + '%');
    p.style.setProperty('--col',   CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]);
    p.style.setProperty('--dur',   (0.9 + Math.random() * 0.8) + 's');
    p.style.setProperty('--delay', (Math.random() * 0.6) + 's');
    p.style.setProperty('--rot0',  (Math.random() * 60 - 30) + 'deg');
    p.style.setProperty('--rot1',  (Math.random() * 720 - 360) + 'deg');
    p.style.width  = (7 + Math.random() * 8) + 'px';
    p.style.height = (7 + Math.random() * 8) + 'px';
    p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    container.appendChild(p);
  }
}

function showCelebration(type) {
  const overlay = document.getElementById('celebrationOverlay');
  const card    = document.getElementById('celebrationCard');
  const emoji   = document.getElementById('celebrationEmoji');
  const title   = document.getElementById('celebrationTitle');
  const msg     = document.getElementById('celebrationMsg');

  // Resetear clases
  card.classList.remove('is-bingo', 'is-linea');

  if (type === 'bingo') {
    card.classList.add('is-bingo');
    emoji.textContent = '🏆';
    title.textContent = '¡BINGO!';
    msg.textContent   = '¡Completaste todo el tablero! ¡Sos un campeón!';
    spawnConfetti();
  } else {
    card.classList.add('is-linea');
    emoji.textContent = '🌟';
    title.textContent = '¡LÍNEA!';
    msg.textContent   = '¡Muy bien! ¡Completaste una fila entera!';
  }

  overlay.classList.remove('hidden');
}

function hideCelebration() {
  document.getElementById('celebrationOverlay').classList.add('hidden');
}

function checkAndCelebrate(playerId) {
  const state = getBoardState(playerId);

  if (state === 'bingo' && !celebrationShown.bingo) {
    celebrationShown.bingo = true;
    celebrationShown.linea = true; // linea ya fue o se omite
    setTimeout(() => showCelebration('bingo'), 180);
  } else if (state === 'linea' && !celebrationShown.linea) {
    celebrationShown.linea = true;
    setTimeout(() => showCelebration('linea'), 180);
  }
}

// =============================================
// RENDERIZADO DEL TABLERO
// =============================================

function renderBoard(playerId) {
  const board  = document.getElementById('bingoBoard');
  const cells  = boards[playerId];
  const marked = markedState[playerId];

  board.innerHTML = '';

  cells.forEach((cell, idx) => {
    const div = document.createElement('div');

    let cls = 'cell';
    if (cell.isFree)       cls += ' free-space';
    else if (marked[idx])  cls += ' marked';

    div.className = cls;
    div.setAttribute('role', 'gridcell');
    div.setAttribute('aria-label', cell.w);

    if (cell.isFree) {
      div.innerHTML = `<span style="font-size:1.8rem">⭐</span>`;
    } else {
      div.innerHTML = `
        <span class="cell-emoji" aria-hidden="true">${cell.e}</span>
        <span class="cell-word">${cell.w.toUpperCase()}</span>
      `;
      div.addEventListener('click', () => toggleMark(playerId, idx));
    }

    board.appendChild(div);
  });
}

// =============================================
// PANTALLA DE CONFIGURACIÓN
// =============================================

function buildPlayerGrid() {
  const grid = document.getElementById('playerGrid');
  grid.innerHTML = '';

  for (let i = 1; i <= TOTAL_BOARDS; i++) {
    const btn = document.createElement('button');
    btn.className   = 'player-btn';
    btn.textContent = `${i}`;
    btn.setAttribute('aria-label', `Tablero ${i}`);

    btn.addEventListener('click', () => {
      document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedPlayer = i;
      document.getElementById('startBtn').disabled = false;
    });

    grid.appendChild(btn);
  }
}

// =============================================
// NAVEGACIÓN
// =============================================

function startGame(playerId) {
  selectedPlayer = playerId;
  celebrationShown = { linea: false, bingo: false };

  document.getElementById('setup-screen').style.display = 'none';
  document.getElementById('game-screen').classList.remove('hidden');
  document.getElementById('boardTitle').textContent = `Tablero ${playerId}`;

  hideCelebration();
  renderBoard(playerId);
}

function goBack() {
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('setup-screen').style.display = 'flex';
  hideCelebration();
  selectedPlayer = null;
}

// =============================================
// INICIALIZACIÓN
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  initBoards();
  buildPlayerGrid();

  document.getElementById('startBtn').addEventListener('click', () => {
    if (selectedPlayer !== null) startGame(selectedPlayer);
  });

  document.getElementById('backBtn').addEventListener('click', goBack);

  document.getElementById('celebrationClose').addEventListener('click', hideCelebration);
  document.getElementById('celebrationBtn').addEventListener('click', hideCelebration);

  document.getElementById('celebrationOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) hideCelebration();
  });
});

