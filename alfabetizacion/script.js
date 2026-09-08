/* ============================================================
   ALBAFETIZACIÓN — lógica y datos
   ============================================================ */

/* ---------- 1. AJUSTE DE ESCENARIO 16:9 SIN SCROLL ---------- */
function setStageSize() {
  const wrapper = document.getElementById('stage-wrapper');
  const stage = document.getElementById('stage');
  const vw = wrapper.clientWidth;
  const vh = wrapper.clientHeight;
  let w = vw, h = vw * 9 / 16;
  if (h > vh) { h = vh; w = vh * 16 / 9; }
  stage.style.width = w + 'px';
  stage.style.height = h + 'px';
}
window.addEventListener('resize', setStageSize);
window.addEventListener('DOMContentLoaded', () => { setStageSize(); initApp(); });

/* ---------- 2. DATOS DE LAS ACTIVIDADES ---------- */

// tipo de posición -> qué casillas de la "forma de palabra" se resaltan
const POS_HILITE = { inicial:[0], contiene:[1,2], final:[3] };

const ACTIVITIES = {

  /* 1) SELECCIONAR OBJETO SEGÚN LETRA (inicial / contiene / final) */
  letra: {
    label:'letra', template:'choose-image',
    exercises:[
      {type:'inicial', letter:'S', opts:[{e:'☀️',c:1},{e:'🌙',c:0},{e:'🐱',c:0}]},
      {type:'final',   letter:'A', opts:[{e:'🌙',c:1},{e:'☀️',c:0},{e:'🐟',c:0}]},
      {type:'inicial', letter:'P', opts:[{e:'🦆',c:1},{e:'🐱',c:0},{e:'🐻',c:0}]},
      {type:'contiene',letter:'T', opts:[{e:'🐱',c:1},{e:'🌙',c:0},{e:'🐻',c:0}]},
      {type:'inicial', letter:'F', opts:[{e:'🦭',c:1},{e:'✋',c:0},{e:'🎲',c:0}]},
      {type:'final',   letter:'O', opts:[{e:'🎲',c:1},{e:'🍵',c:0},{e:'🐟',c:0}]},
      {type:'inicial', letter:'M', opts:[{e:'✋',c:1},{e:'🍵',c:0},{e:'🐸',c:0}]},
      {type:'contiene',letter:'A', opts:[{e:'👆',c:1},{e:'🍐',c:0},{e:'📷',c:0}]},
      {type:'inicial', letter:'J', opts:[{e:'🦒',c:1},{e:'🐶',c:0},{e:'🐒',c:0}]},
      {type:'final',   letter:'O', opts:[{e:'🐒',c:1},{e:'🐟',c:0},{e:'☀️',c:0}]},
    ]
  },

  /* 2) COMPLETAR LETRA INICIAL */
  inicial: {
    label:'inicial', template:'choose-letter',
    exercises:[
      {emoji:'🦆', word:'PATO',  blank:0, opts:['P','G','M']},
      {emoji:'🐱', word:'GATO',  blank:0, opts:['G','P','T']},
      {emoji:'☀️', word:'SOL',   blank:0, opts:['S','F','D']},
      {emoji:'🌙', word:'LUNA',  blank:0, opts:['L','M','T']},
      {emoji:'✋', word:'MANO',  blank:0, opts:['M','S','P']},
      {emoji:'🎲', word:'DADO',  blank:0, opts:['D','F','J']},
      {emoji:'🍵', word:'TAZA',  blank:0, opts:['T','R','M']},
      {emoji:'🐸', word:'SAPO',  blank:0, opts:['S','P','D']},
      {emoji:'🐶', word:'PERRO', blank:0, opts:['P','T','F']},
      {emoji:'🐻', word:'OSO',   blank:0, opts:['O','A','U']},
    ]
  },

  /* 3) COMPLETAR LETRA FINAL */
  final: {
    label:'final', template:'choose-letter',
    exercises:[
      {emoji:'☀️', word:'SOL',   blank:2, opts:['L','N','R']},
      {emoji:'🐟', word:'PEZ',   blank:2, opts:['Z','S','T']},
      {emoji:'🌙', word:'LUNA',  blank:3, opts:['A','E','O']},
      {emoji:'🦆', word:'PATO',  blank:3, opts:['O','A','E']},
      {emoji:'✋', word:'MANO',  blank:3, opts:['O','A','U']},
      {emoji:'🍵', word:'TAZA',  blank:3, opts:['A','O','I']},
      {emoji:'👆', word:'DEDO',  blank:3, opts:['O','A','E']},
      {emoji:'📷', word:'FOTO',  blank:3, opts:['O','A','U']},
      {emoji:'🐒', word:'MONO',  blank:3, opts:['O','E','A']},
      {emoji:'🐭', word:'RATON', blank:4, opts:['N','L','S']},
    ]
  },

  /* 4) COMPLETAR VOCALES (palabras simples de 2-3 sílabas, sin grupos consonánticos) */
  vocales: {
    label:'vocales', template:'choose-letter',
    exercises:[
      {emoji:'🦆', word:'PATO',   blank:1, opts:['A','E','I']},
      {emoji:'🐱', word:'GATO',   blank:1, opts:['A','O','U']},
      {emoji:'🌙', word:'LUNA',   blank:1, opts:['U','O','A']},
      {emoji:'✋', word:'MANO',   blank:1, opts:['A','E','I']},
      {emoji:'🎲', word:'DADO',   blank:1, opts:['A','E','U']},
      {emoji:'🍵', word:'TAZA',   blank:1, opts:['A','I','O']},
      {emoji:'🐸', word:'SAPO',   blank:1, opts:['A','E','U']},
      {emoji:'🐒', word:'MONO',   blank:1, opts:['O','A','U']},
      {emoji:'🦭', word:'FOCA',   blank:1, opts:['O','A','I']},
      {emoji:'🦒', word:'JIRAFA', blank:1, opts:['I','A','E']},
    ]
  },

  /* 5) PALABRAS QUE RIMAN */
  rimas: {
    label:'rimas', template:'choose-image',
    exercises:[
      {base:'🦆', opts:[{e:'🐱',c:1},{e:'🐒',c:0},{e:'☀️',c:0}]},   // pato-gato
      {base:'🐱', opts:[{e:'🦆',c:1},{e:'🎲',c:0},{e:'🐟',c:0}]},   // gato-pato
      {base:'🎲', opts:[{e:'🍦',c:1},{e:'📷',c:0},{e:'☀️',c:0}]},   // dado-helado
      {base:'🍦', opts:[{e:'🎲',c:1},{e:'🏍️',c:0},{e:'🐟',c:0}]},   // helado-dado
      {base:'📷', opts:[{e:'🏍️',c:1},{e:'🐸',c:0},{e:'🌰',c:0}]},   // foto-moto
      {base:'🏍️', opts:[{e:'📷',c:1},{e:'🐌',c:0},{e:'🐱',c:0}]},   // moto-foto
      {base:'☀️', opts:[{e:'🐌',c:1},{e:'🦆',c:0},{e:'🍦',c:0}]},   // sol-caracol
      {base:'🐌', opts:[{e:'☀️',c:1},{e:'✋',c:0},{e:'📷',c:0}]},   // caracol-sol
      {base:'🐟', opts:[{e:'🌰',c:1},{e:'🎲',c:0},{e:'🐱',c:0}]},   // pez-nuez
      {base:'🌰', opts:[{e:'🐟',c:1},{e:'🏍️',c:0},{e:'☀️',c:0}]},   // nuez-pez
    ]
  },

  /* 6) EL INTRUSO (letras / números / emojis mezclados) */
  intruso: {
    label:'intruso', template:'find-odd',
    exercises:[
      {items:[{t:'letter',v:'M'},{t:'letter',v:'L'},{t:'letter',v:'A'},{t:'number',v:'8'}], c:3},
      {items:[{t:'emoji',v:'🐱'},{t:'emoji',v:'🐶'},{t:'emoji',v:'🐒'},{t:'letter',v:'T'}], c:3},
      {items:[{t:'number',v:'2'},{t:'number',v:'4'},{t:'number',v:'6'},{t:'letter',v:'P'}], c:3},
      {items:[{t:'letter',v:'S'},{t:'letter',v:'J'},{t:'emoji',v:'🍇'},{t:'letter',v:'D'}], c:2},
      {items:[{t:'emoji',v:'🌙'},{t:'emoji',v:'☀️'},{t:'emoji',v:'🐟'},{t:'number',v:'5'}], c:3},
      {items:[{t:'letter',v:'F'},{t:'letter',v:'R'},{t:'letter',v:'M'},{t:'emoji',v:'🎲'}], c:3},
      {items:[{t:'number',v:'1'},{t:'number',v:'3'},{t:'emoji',v:'🐻'},{t:'number',v:'5'}], c:2},
      {items:[{t:'letter',v:'T'},{t:'emoji',v:'🦆'},{t:'letter',v:'P'},{t:'letter',v:'S'}], c:1},
      {items:[{t:'number',v:'7'},{t:'number',v:'9'},{t:'letter',v:'J'},{t:'number',v:'3'}], c:2},
      {items:[{t:'emoji',v:'🐸'},{t:'emoji',v:'🐒'},{t:'number',v:'4'},{t:'emoji',v:'🐭'}], c:2},
    ]
  },
};

/* ---------- 3. ESTADO ---------- */
let state = { key:null, index:0, stars:0, attemptFailed:false };

function initApp() {
  document.querySelectorAll('.menu-card').forEach(btn=>{
    btn.addEventListener('click', ()=> startActivity(btn.dataset.activity));
  });
  document.getElementById('btn-back').addEventListener('click', showMenu);
  document.getElementById('btn-menu').addEventListener('click', showMenu);
  document.getElementById('btn-retry').addEventListener('click', ()=> startActivity(state.key));
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('visible'));
  document.getElementById(id).classList.add('visible');
}

function showMenu(){ showScreen('screen-menu'); }

function startActivity(key) {
  state = { key, index:0, stars:0, attemptFailed:false };
  showScreen('screen-activity');
  buildProgressDots();
  document.getElementById('star-count').textContent = '0';
  renderExercise();
}

function buildProgressDots() {
  const wrap = document.getElementById('progress-dots');
  wrap.innerHTML = '';
  const total = ACTIVITIES[state.key].exercises.length;
  for (let i=0;i<total;i++){
    const d = document.createElement('div');
    d.className = 'dot' + (i===0 ? ' current' : '');
    wrap.appendChild(d);
  }
}
function updateProgressDots() {
  const dots = document.querySelectorAll('#progress-dots .dot');
  dots.forEach((d,i)=>{
    d.classList.toggle('done', i < state.index);
    d.classList.toggle('current', i === state.index);
  });
}

/* ---------- 4. RENDER POR PLANTILLA ---------- */
function renderExercise() {
  state.attemptFailed = false;
  updateProgressDots();
  const activity = ACTIVITIES[state.key];
  const ex = activity.exercises[state.index];
  const content = document.getElementById('exercise-content');
  content.innerHTML = '';

  if (activity.template === 'choose-image') {
    if (state.key === 'letra') renderLetraTemplate(content, ex);
    else renderRimasTemplate(content, ex);
  } else if (activity.template === 'choose-letter') {
    renderChooseLetterTemplate(content, ex);
  } else if (activity.template === 'find-odd') {
    renderIntrusoTemplate(content, ex);
  }
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeWordShape(hiliteIdx) {
  const row = document.createElement('div');
  row.className = 'word-shape';
  for (let i=0;i<4;i++){
    const box = document.createElement('div');
    box.className = 'wshape-box' + (hiliteIdx.includes(i) ? ' hi' : '');
    row.appendChild(box);
  }
  return row;
}

function renderLetraTemplate(content, ex) {
  const promptRow = document.createElement('div');
  promptRow.className = 'prompt-row';
  const letterEl = document.createElement('div');
  letterEl.className = 'prompt-letter';
  letterEl.textContent = ex.letter;
  promptRow.appendChild(letterEl);
  promptRow.appendChild(makeWordShape(POS_HILITE[ex.type]));
  content.appendChild(promptRow);

  const optsRow = document.createElement('div');
  optsRow.className = 'options-row';
  shuffle(ex.opts).forEach(o=>{
    const btn = document.createElement('button');
    btn.className = 'opt-emoji-btn';
    btn.textContent = o.e;
    btn.addEventListener('click', ()=> handleAnswer(o.c===1, btn));
    optsRow.appendChild(btn);
  });
  content.appendChild(optsRow);
}

function renderRimasTemplate(content, ex) {
  const baseEl = document.createElement('div');
  baseEl.className = 'prompt-emoji';
  baseEl.textContent = ex.base;
  content.appendChild(baseEl);

  const optsRow = document.createElement('div');
  optsRow.className = 'options-row';
  shuffle(ex.opts).forEach(o=>{
    const btn = document.createElement('button');
    btn.className = 'opt-emoji-btn';
    btn.textContent = o.e;
    btn.addEventListener('click', ()=> handleAnswer(o.c===1, btn));
    optsRow.appendChild(btn);
  });
  content.appendChild(optsRow);
}

function renderChooseLetterTemplate(content, ex) {
  const emojiEl = document.createElement('div');
  emojiEl.className = 'prompt-emoji';
  emojiEl.textContent = ex.emoji;
  content.appendChild(emojiEl);

  const wordRow = document.createElement('div');
  wordRow.className = 'word-boxes';
  ex.word.split('').forEach((ch,i)=>{
    const box = document.createElement('div');
    box.className = 'letter-box' + (i===ex.blank ? ' blank' : '');
    box.textContent = i===ex.blank ? '' : ch;
    wordRow.appendChild(box);
  });
  content.appendChild(wordRow);

  const correctLetter = ex.word[ex.blank];
  const optsRow = document.createElement('div');
  optsRow.className = 'options-row letters';
  shuffle(ex.opts).forEach(letter=>{
    const btn = document.createElement('button');
    btn.className = 'opt-letter-btn';
    btn.textContent = letter;
    btn.addEventListener('click', ()=> handleAnswer(letter===correctLetter, btn));
    optsRow.appendChild(btn);
  });
  content.appendChild(optsRow);
}

function renderIntrusoTemplate(content, ex) {
  const row = document.createElement('div');
  row.className = 'intruso-row';
  const tagged = ex.items.map((item,i)=> ({...item, isCorrect: i===ex.c}));
  shuffle(tagged).forEach(item=>{
    const btn = document.createElement('button');
    btn.className = 'intruso-item';
    btn.textContent = item.v;
    btn.addEventListener('click', ()=> handleAnswer(item.isCorrect, btn));
    row.appendChild(btn);
  });
  content.appendChild(row);
}

/* ---------- 5. RESPUESTA / RECOMPENSA ---------- */
function handleAnswer(isCorrect, btnEl) {
  if (isCorrect) {
    if (!state.attemptFailed) {
      state.stars++;
      document.getElementById('star-count').textContent = state.stars;
    }
    showFeedback('🎉');
    setTimeout(nextExercise, 900);
  } else {
    state.attemptFailed = true;
    btnEl.classList.add('wrong-disabled');
    showFeedback('🤔');
  }
}

function showFeedback(icon) {
  const layer = document.getElementById('feedback-layer');
  layer.innerHTML = `<div class="feedback-icon">${icon}</div>`;
  layer.classList.add('show');
  setTimeout(()=> layer.classList.remove('show'), 550);
}

function nextExercise() {
  const total = ACTIVITIES[state.key].exercises.length;
  state.index++;
  if (state.index >= total) {
    showComplete();
  } else {
    renderExercise();
  }
}

function showComplete() {
  const total = ACTIVITIES[state.key].exercises.length;
  showScreen('screen-complete');
  document.getElementById('final-star-count').textContent = state.stars;
  document.getElementById('final-star-total').textContent = total;

  const ratio = state.stars / total;
  const medal = document.getElementById('medal-icon');
  medal.textContent = ratio >= 0.8 ? '🏆' : ratio >= 0.5 ? '🥈' : '🥉';

  launchConfetti();
}

function launchConfetti() {
  const layer = document.getElementById('confetti-layer');
  layer.innerHTML = '';
  const pieces = ['⭐','🎉','🎈','✨','🌟'];
  for (let i=0;i<24;i++){
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.textContent = pieces[Math.floor(Math.random()*pieces.length)];
    p.style.left = Math.random()*100 + '%';
    p.style.animationDuration = (1.6 + Math.random()*1.4) + 's';
    p.style.animationDelay = (Math.random()*0.6) + 's';
    layer.appendChild(p);
  }
}

