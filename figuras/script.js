/* =====================================================================
   FORMAS Y COLORES — motor general
   ===================================================================== */
'use strict';

/* ---------- utilidades ---------- */
function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
function rand(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
function pick(arr){ return arr[rand(0,arr.length-1)]; }

const COLORS = {
  amarillo:'#FFD23F', rojo:'#FF6B6B', azul:'#3AA8E0', verde:'#4CD787',
  violeta:'#A374FF', naranja:'#FF9F45'
};
const SHAPE_COLOR = { circulo:'#FFD23F', triangulo:'#FF6B6B', cuadrado:'#3AA8E0', rectangulo:'#4CD787' };
const SHAPE_SIDES = { circulo:0, triangulo:3, cuadrado:4, rectangulo:4 };
const SHAPE_ICON  = { circulo:'⚪', triangulo:'🔺', cuadrado:'🟦', rectangulo:'🟩' };

/* Devuelve un SVG de la figura solicitada.
   type: circulo|triangulo|cuadrado|rectangulo
   Uso simple: shapeSVG(type, color, size) -> alto=size, ancho se ajusta según figura
   Uso preciso: shapeSVG(type, color, width, height, opts) -> ancho y alto independientes */
function shapeSVG(type, color, sizeOrWidth, heightOrOpts, maybeOpts){
  let w, s, opts;
  if(typeof heightOrOpts === 'number'){
    w = sizeOrWidth; s = heightOrOpts; opts = maybeOpts || {};
  } else {
    s = sizeOrWidth;
    w = type==='rectangulo' ? s*1.6 : s;
    opts = heightOrOpts || {};
  }
  const stroke = opts.stroke || 'rgba(0,0,0,.55)';
  const sw = Math.max(2, Math.min(w,s)*0.05);
  const fill = opts.noFill ? 'none' : color;
  const dash = opts.dashed ? `stroke-dasharray="${Math.max(6,sw*1.6)},${Math.max(6,sw*1.4)}"` : '';
  let inner = '';
  switch(type){
    case 'circulo':
      inner = `<ellipse cx="${w/2}" cy="${s/2}" rx="${w/2-sw}" ry="${s/2-sw}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${dash}/>`;
      break;
    case 'cuadrado':
      inner = `<rect x="${sw}" y="${sw}" width="${w-2*sw}" height="${s-2*sw}" rx="${Math.min(w,s)*0.06}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${dash}/>`;
      break;
    case 'rectangulo':
      inner = `<rect x="${sw}" y="${sw}" width="${w-2*sw}" height="${s-2*sw}" rx="${Math.min(w,s)*0.06}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${dash}/>`;
      break;
    case 'triangulo':
      inner = `<polygon points="${w/2},${sw} ${w-sw},${s-sw} ${sw},${s-sw}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" ${dash}/>`;
      break;
  }
  return `<svg width="${w}" height="${s}" viewBox="0 0 ${w} ${s}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

/* ---------- estado global ---------- */
const els = {};
window.addEventListener('DOMContentLoaded', init);

function init(){
  els.viewMenu = document.getElementById('view-menu');
  els.viewActivity = document.getElementById('view-activity');
  els.viewEnd = document.getElementById('view-end');
  els.menuGrid = document.getElementById('menu-grid');
  els.activityBody = document.getElementById('activity-body');
  els.progressDots = document.getElementById('progress-dots');
  els.starCount = document.getElementById('star-count');
  els.btnBack = document.getElementById('btn-back');
  els.endMedal = document.getElementById('end-medal');
  els.endTitle = document.getElementById('end-title');
  els.endStars = document.getElementById('end-stars');
  els.btnRetry = document.getElementById('btn-retry');
  els.btnMenu = document.getElementById('btn-menu');
  els.confetti = document.getElementById('confetti-layer');

  buildMenu();
  els.btnBack.addEventListener('click', ()=>showView('menu'));
  els.btnMenu.addEventListener('click', ()=>showView('menu'));
  els.btnRetry.addEventListener('click', ()=>{ showView('activity'); if(Engine.current) Engine.current.restart(); });
}

function showView(name){
  [els.viewMenu, els.viewActivity, els.viewEnd].forEach(v=>v.classList.remove('active'));
  if(name==='menu') els.viewMenu.classList.add('active');
  if(name==='activity') els.viewActivity.classList.add('active');
  if(name==='end') els.viewEnd.classList.add('active');
}

/* ---------- menú ---------- */
const ACTIVITIES = [
  { icon:'🔍', label:'Buscá la figura', run: startActividad2 },
  { icon:'🧩', label:'¿Dónde va?', run: startActividad3 },
  { icon:'🃏', label:'Memotest', run: startActividad5 },
  { icon:'✏️', label:'Trazá el contorno', run: startActividad6 },
  { icon:'➡️', label:'Seguí el patrón', run: startActividad7 },
  { icon:'🖐️', label:'Contá las figuras', run: startActividad8 },
  { icon:'🎨', label:'Construí con formas', run: startActividad9 },
];

function buildMenu(){
  els.menuGrid.innerHTML = '';
  ACTIVITIES.forEach((act,i)=>{
    const card = document.createElement('div');
    card.className = 'menu-card';
    card.innerHTML = `
      <div class="card-num">${i+1}</div>
      <div class="card-icon">${act.icon}</div>
      <div class="card-label">${act.label}</div>
    `;
    card.addEventListener('click', ()=> act.run());
    els.menuGrid.appendChild(card);
  });
}

/* =====================================================================
   MOTOR COMPARTIDO (progreso, estrellas, feedback, pantalla final)
   ===================================================================== */
const Engine = { current:null, stars:0, total:0 };

function engineSetup(total, restartFn){
  Engine.stars = 0;
  Engine.total = total;
  Engine.current = { restart: restartFn };
  els.starCount.textContent = '0';
  renderDots(total, 0, []);
}

function renderDots(total, currentIndex, doneArr){
  els.progressDots.innerHTML = '';
  for(let i=0;i<total;i++){
    const dot = document.createElement('div');
    dot.className = 'dot' + (doneArr[i] ? ' done' : '') + (i===currentIndex ? ' current' : '');
    els.progressDots.appendChild(dot);
  }
}

function addStar(){
  Engine.stars++;
  els.starCount.textContent = Engine.stars;
}

let feedbackTimer = null;
function showFeedback(text, ok){
  let banner = document.getElementById('feedback-banner');
  if(!banner){
    banner = document.createElement('div');
    banner.id = 'feedback-banner';
    banner.className = 'feedback-banner';
    els.activityBody.appendChild(banner);
  }
  banner.textContent = text;
  banner.className = 'feedback-banner show ' + (ok ? 'ok':'bad');
  clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(()=> banner.classList.remove('show'), 1100);
}

const PRAISE_OK = ['🎉','⭐','🥳','👏','🌟','😃'];
const PRAISE_RETRY = ['🤔','😊','💪','🔄'];

function finishActivity(restartFn){
  showView('end');
  const pct = Engine.total ? Engine.stars/Engine.total : 1;
  let medal='🥉', title='¡BIEN HECHO!';
  if(pct>=0.9){ medal='🏆'; title='¡CAMPEÓN!'; }
  else if(pct>=0.6){ medal='🥈'; title='¡MUY BIEN!'; }
  els.endMedal.textContent = medal;
  els.endTitle.textContent = title;
  els.endStars.textContent = '⭐'.repeat(Math.max(1,Engine.stars)) ;
  Engine.current = { restart: restartFn };
  launchConfetti();
}

function launchConfetti(){
  els.confetti.innerHTML = '';
  const pieces = ['🎉','⭐','🔺','🟦','🟩','⚪','🎈'];
  for(let i=0;i<24;i++){
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.textContent = pick(pieces);
    p.style.left = rand(0,98)+'vw';
    p.style.animationDuration = (rand(22,42)/10)+'s';
    p.style.animationDelay = (rand(0,15)/10)+'s';
    els.confetti.appendChild(p);
  }
}

/* =====================================================================
   ACTIVIDAD 7 — Seguí el patrón (por niveles)
   Nivel 1: completar 1 figura+color · Nivel 2: completar 2 · Nivel 3: completar 3
   ===================================================================== */
function buildExercisesAct7(){
  const levelPlan = [1,1,1,2,2,2,3,3,3];
  return levelPlan.map(level=>{
    const combos = shuffle(allCombos());
    const cycle = [combos[0], combos[1]]; // patrón simple A-B-A-B...
    const contextLen = 4; // dos vueltas completas del patrón como pista
    const context = [];
    for(let i=0;i<contextLen;i++) context.push(cycle[i%2]);
    const blanksExpected = [];
    for(let i=0;i<level;i++) blanksExpected.push(cycle[(contextLen+i)%2]);
    return { level, context, blanksExpected };
  });
}

function startActividad7(){
  showView('activity');
  let exercises = buildExercisesAct7();
  let idx=0; const done=[];
  engineSetup(exercises.length, restart);
  render();

  function restart(){ exercises = buildExercisesAct7(); idx=0; done.length=0; engineSetup(exercises.length, restart); render(); }

  function render(){
    if(idx>=exercises.length){ finishActivity(restart); return; }
    renderDots(exercises.length, idx, done);
    const ex = exercises[idx];
    let filled = [];
    let blankStep = 0;
    let attemptFailed = false;

    els.activityBody.innerHTML = `
      <div style="font-family:'Baloo 2';font-size:2vh;color:var(--card);margin-bottom:1.2vh;">NIVEL ${ex.level}</div>
      <div class="pattern-row" id="seqRow"></div>
      <div class="options-row" id="opts"></div>
    `;
    renderSequence();
    renderOptions();

    function renderSequence(){
      const slots = ex.context.concat(ex.blanksExpected.map((c,i)=> i<filled.length ? filled[i] : null));
      document.getElementById('seqRow').innerHTML = slots.map(it=>
        it ? `<div class="pattern-slot">${shapeSVG(it.shape, it.color, 70)}</div>` : `<div class="pattern-slot">❓</div>`
      ).join('<span class="pattern-arrow">→</span>');
    }

    function renderOptions(){
      if(blankStep>=ex.blanksExpected.length){
        if(!attemptFailed) addStar();
        showFeedback(pick(PRAISE_OK), true);
        done[idx]=true;
        setTimeout(()=>{ idx++; render(); }, 900);
        return;
      }
      const correct = ex.blanksExpected[blankStep];
      const distractors = shuffle(allCombos().filter(c=> !(c.shape===correct.shape && c.color===correct.color)));
      const options = shuffle([correct, distractors[0], distractors[1]]);
      const optsWrap = document.getElementById('opts');
      optsWrap.innerHTML = '';
      options.forEach(opt=>{
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.innerHTML = `<div class="shape-box">${shapeSVG(opt.shape, opt.color, 90)}</div>`;
        btn.addEventListener('click', ()=>{
          const isCorrect = opt.shape===correct.shape && opt.color===correct.color;
          if(isCorrect){
            btn.classList.add('correct');
            filled.push(correct);
            blankStep++;
            renderSequence();
            setTimeout(renderOptions, 550);
          } else {
            btn.classList.add('wrong','disabled');
            attemptFailed = true;
            showFeedback(pick(PRAISE_RETRY), false);
          }
        });
        optsWrap.appendChild(btn);
      });
    }
  }
}

/* =====================================================================
   ACTIVIDAD 2 — Buscá la figura (tocar en la escena real)
   Escena base: assets/escena-figuras.png (casa, árbol, sol, camión)
   Coordenadas en % relativas al tamaño de la imagen (1536x1024).
   ===================================================================== */
const SCENE_HOTSPOTS = [
  // más grandes primero para que las zonas pequeñas queden "encima" al hacer clic
  { type:'rectangulo', left:30.66, top:39.26, width:31.18, height:32.13 }, // pared de la casa
  { type:'rectangulo', left:68.36, top:60.64, width:25.07, height:15.43 }, // caja del camión
  { type:'rectangulo', left:16.28, top:59.08, width:3.91,  height:16.99 }, // tronco del árbol
  { type:'triangulo',  left:28.19, top:11.13, width:36.07, height:27.25 }, // techo
  { type:'cuadrado',   left:32.81, top:44.82, width:7.03,  height:10.74 }, // ventana izquierda
  { type:'cuadrado',   left:52.21, top:44.82, width:7.16,  height:10.74 }, // ventana derecha
  { type:'rectangulo', left:41.86, top:51.66, width:8.01,  height:19.82 }, // puerta
  { type:'cuadrado',   left:74.22, top:50.29, width:7.94,  height:9.57 },  // cabina del camión
  { type:'circulo',    left:69.92, top:71.78, width:7.94,  height:12.01 }, // rueda izquierda
  { type:'circulo',    left:83.66, top:71.78, width:8.01,  height:12.01 }, // rueda derecha
  { type:'circulo',    left:9.18,  top:31.93, width:17.84, height:26.66 }, // copa del árbol
  { type:'circulo',    left:82.03, top:10.25, width:9.11,  height:13.67 }, // sol
];

function buildExercisesAct2(){
  const shapes = ['circulo','triangulo','cuadrado','rectangulo'];
  const exercises = [];
  shapes.forEach(target=>{
    exercises.push({target});
    exercises.push({target});
  });
  return shuffle(exercises);
}

function startActividad2(){
  showView('activity');
  let exercises = buildExercisesAct2();
  let idx=0; const done=[];
  engineSetup(exercises.length, restart);
  render();

  function restart(){ exercises = buildExercisesAct2(); idx=0; done.length=0; engineSetup(exercises.length, restart); render(); }

  function render(){
    if(idx>=exercises.length){ finishActivity(restart); return; }
    renderDots(exercises.length, idx, done);
    const ex = exercises[idx];
    const target = ex.target;
    els.activityBody.innerHTML = `
      <div class="prompt-row">
        <div class="prompt-card"><span class="instruction-icon">👉</span><div class="shape-box">${shapeSVG(target, SHAPE_COLOR[target], 90)}</div></div>
      </div>
      <div class="scene-wrap" id="scene" style="background-image:url('assets/escena-figuras.png');background-size:100% 100%;background-repeat:no-repeat;"></div>
    `;
    const scene = document.getElementById('scene');
    SCENE_HOTSPOTS.forEach(h=>{
      const el = document.createElement('div');
      el.className = 'scene-item';
      el.style.left = h.left+'%'; el.style.top = h.top+'%';
      el.style.width = h.width+'%'; el.style.height = h.height+'%';
      el.addEventListener('click', ()=>handleTap(el, h.type===target));
      scene.appendChild(el);
    });
  }

  let attemptFailed=false;
  function handleTap(el, isCorrect){
    if(el.dataset.locked) return;
    if(isCorrect){
      el.dataset.locked = '1';
      el.classList.add('marked-correct');
      if(!attemptFailed) addStar();
      showFeedback(pick(PRAISE_OK), true);
      done[idx]=true; attemptFailed=false;
      setTimeout(()=>{ idx++; render(); }, 700);
    } else {
      el.classList.add('marked-wrong');
      el.dataset.locked = '1';
      attemptFailed = true;
      showFeedback(pick(PRAISE_RETRY), false);
    }
  }
}

/* =====================================================================
   ACTIVIDAD 8 — Contá la cantidad de figuras
   ===================================================================== */
function buildExercisesAct8(){
  const shapes = ['circulo','triangulo','cuadrado','rectangulo'];
  // bandas de dificultad progresiva hasta 30 elementos
  const bands = [[3,6],[5,9],[8,12],[10,15],[13,18],[16,22],[20,26],[24,30]];
  return bands.map(band=>{
    const shape = pick(shapes);
    const count = rand(band[0], band[1]);
    return {shape, count};
  });
}

function startActividad8(){
  showView('activity');
  let exercises = buildExercisesAct8();
  let idx=0; const done=[];
  engineSetup(exercises.length, restart);
  render();

  function restart(){ exercises = buildExercisesAct8(); idx=0; done.length=0; engineSetup(exercises.length, restart); render(); }

  function render(){
    if(idx>=exercises.length){ finishActivity(restart); return; }
    renderDots(exercises.length, idx, done);
    const ex = exercises[idx];
    const color = SHAPE_COLOR[ex.shape];
    const size = ex.count<=6 ? 90 : ex.count<=10 ? 68 : ex.count<=16 ? 52 : ex.count<=22 ? 42 : 34;
    const gap = ex.count<=10 ? '1.2vh' : ex.count<=18 ? '0.8vh' : '0.5vh';
    els.activityBody.innerHTML = `
      <div class="collection-wrap" id="coll" style="gap:${gap};"></div>
      <div class="options-row" id="opts" style="margin-top:1.6vh;"></div>
    `;
    const coll = document.getElementById('coll');
    let countedN = 0;
    for(let i=0;i<ex.count;i++){
      const item = document.createElement('div');
      item.className = 'collection-item';
      item.innerHTML = shapeSVG(ex.shape, color, size);
      item.addEventListener('click', ()=>{
        item.classList.toggle('counted');
      });
      coll.appendChild(item);
    }
    const optsWrap = document.getElementById('opts');
    const set = new Set([ex.count]);
    while(set.size<3){ set.add(rand(Math.max(1,ex.count-3), ex.count+3)); }
    shuffle([...set]).forEach(n=>{
      const btn = document.createElement('button');
      btn.className='opt-btn';
      btn.innerHTML = `<div class="opt-num">${n}</div>`;
      btn.addEventListener('click', ()=>handleAnswer(btn, n===ex.count));
      optsWrap.appendChild(btn);
    });
  }

  let attemptFailed=false;
  function handleAnswer(btn, isCorrect){
    if(isCorrect){
      btn.classList.add('correct');
      if(!attemptFailed) addStar();
      showFeedback(pick(PRAISE_OK), true);
      done[idx]=true; attemptFailed=false;
      setTimeout(()=>{ idx++; render(); }, 700);
    } else {
      btn.classList.add('wrong','disabled');
      attemptFailed = true;
      showFeedback(pick(PRAISE_RETRY), false);
    }
  }
}

/* =====================================================================
   ACTIVIDAD 3 — Asociar figura con objeto de la realidad
   ===================================================================== */
const REAL_OBJECTS = [
  {emoji:'🕐', shape:'circulo'}, {emoji:'⚽', shape:'circulo'}, {emoji:'🌕', shape:'circulo'}, {emoji:'🍪', shape:'circulo'},
  {emoji:'🍕', shape:'triangulo'}, {emoji:'⚠️', shape:'triangulo'}, {emoji:'🚩', shape:'triangulo'}, {emoji:'🍰', shape:'triangulo'},
  {emoji:'🎲', shape:'cuadrado'}, {emoji:'🖼️', shape:'cuadrado'}, {emoji:'🧇', shape:'cuadrado'}, {emoji:'♟️', shape:'cuadrado'},
  {emoji:'📖', shape:'rectangulo'}, {emoji:'🚪', shape:'rectangulo'}, {emoji:'📺', shape:'rectangulo'}, {emoji:'🪟', shape:'rectangulo'},
];
const BIN_LABELS = { circulo:'CÍRCULO', triangulo:'TRIÁNGULO', cuadrado:'CUADRADO', rectangulo:'RECTÁNGULO' };

function buildExercisesAct3(){
  const perShape = {};
  ['circulo','triangulo','cuadrado','rectangulo'].forEach(sh=>{
    perShape[sh] = shuffle(REAL_OBJECTS.filter(o=>o.shape===sh)).slice(0,2);
  });
  const items = shuffle([].concat(...Object.values(perShape)));
  return items; // 8 objetos a clasificar
}

function startActividad3(){
  showView('activity');
  let items = buildExercisesAct3();
  let placedCount = 0; const done=[];
  let selectedEl = null;
  engineSetup(items.length, restart);
  render();

  function restart(){ items = buildExercisesAct3(); placedCount=0; done.length=0; selectedEl=null; engineSetup(items.length, restart); render(); }

  function render(){
    renderDots(items.length, placedCount, done);
    els.activityBody.innerHTML = `
      <div class="sort-wrap">
        <div class="sort-tray" id="tray"></div>
        <div class="sort-bins" id="bins"></div>
      </div>
    `;
    const tray = document.getElementById('tray');
    items.forEach((obj,i)=>{
      const el = document.createElement('div');
      el.className = 'sort-item';
      el.textContent = obj.emoji;
      el.dataset.idx = i;
      el.addEventListener('click', ()=>{
        if(el.classList.contains('placed')) return;
        document.querySelectorAll('.sort-item').forEach(s=>s.style.outline='none');
        selectedEl = el;
        el.style.outline = '.5vh solid var(--purple)';
        el.style.borderRadius = '1.6vh';
      });
      tray.appendChild(el);
    });
    const bins = document.getElementById('bins');
    ['circulo','triangulo','cuadrado','rectangulo'].forEach(sh=>{
      const bin = document.createElement('div');
      bin.className='sort-bin';
      bin.innerHTML = `<div class="bin-icon">${shapeSVG(sh, SHAPE_COLOR[sh], 45)}</div><div style="font-family:'Baloo 2';font-size:1.5vh;color:var(--ink);">${BIN_LABELS[sh]}</div>`;
      bin.addEventListener('click', ()=>{
        if(!selectedEl) { bin.classList.add('flash-bad'); setTimeout(()=>bin.classList.remove('flash-bad'),400); return; }
        const i = +selectedEl.dataset.idx;
        const isCorrect = items[i].shape === sh;
        if(isCorrect){
          bin.classList.add('flash-ok');
          setTimeout(()=>bin.classList.remove('flash-ok'),400);
          selectedEl.classList.add('placed');
          addStar();
          placedCount++;
          done[placedCount-1] = true;
          showFeedback(pick(PRAISE_OK), true);
          selectedEl = null;
          renderDots(items.length, placedCount, done);
          if(placedCount>=items.length){ setTimeout(()=>finishActivity(restart), 700); }
        } else {
          bin.classList.add('flash-bad');
          setTimeout(()=>bin.classList.remove('flash-bad'),400);
          showFeedback(pick(PRAISE_RETRY), false);
        }
      });
      bins.appendChild(bin);
    });
  }
}

/* =====================================================================
   ACTIVIDAD 5 — Memotest
   ===================================================================== */
function buildCardsAct5(){
  const shapes = ['circulo','triangulo','cuadrado','rectangulo'];
  const cols = ['#FFD23F','#FF6B6B','#3AA8E0','#4CD787','#A374FF','#FF9F45'];
  const combos = [];
  shapes.forEach((sh,i)=> combos.push({shape:sh, color: cols[i]}));
  combos.push({shape:'circulo', color:'#A374FF'});
  combos.push({shape:'triangulo', color:'#FF9F45'});
  const chosen = shuffle(combos).slice(0,6);
  let cards = [];
  chosen.forEach((c,i)=>{
    cards.push({...c, pairId:i});
    cards.push({...c, pairId:i});
  });
  return shuffle(cards);
}

function startActividad5(){
  showView('activity');
  let cards = buildCardsAct5();
  let matches = 0; let flipped = []; let lock=false;
  engineSetup(6, restart); // 6 pares
  render();

  function restart(){ cards = buildCardsAct5(); matches=0; flipped=[]; lock=false; engineSetup(6, restart); render(); }

  function render(){
    els.activityBody.innerHTML = `<div class="memo-grid" id="grid" style="grid-template-columns:repeat(4,14vw);grid-template-rows:repeat(3,15vh);"></div>`;
    const grid = document.getElementById('grid');
    cards.forEach((c,i)=>{
      const el = document.createElement('div');
      el.className='memo-card';
      el.innerHTML = `<div class="memo-face">${shapeSVG(c.shape, c.color, 60)}</div>`;
      el.addEventListener('click', ()=>flip(el, c, i));
      grid.appendChild(el);
    });
  }

  function flip(el, c, i){
    if(lock || el.classList.contains('flipped') || el.classList.contains('matched')) return;
    el.classList.add('flipped');
    flipped.push({el,c,i});
    if(flipped.length===2){
      lock = true;
      const [a,b] = flipped;
      if(a.c.pairId===b.c.pairId && a.i!==b.i){
        setTimeout(()=>{
          a.el.classList.add('matched'); b.el.classList.add('matched');
          matches++; addStar();
          renderDots(6, matches, Array(matches).fill(true));
          showFeedback(pick(PRAISE_OK), true);
          flipped=[]; lock=false;
          if(matches>=6) setTimeout(()=>finishActivity(restart), 700);
        }, 400);
      } else {
        showFeedback(pick(PRAISE_RETRY), false);
        setTimeout(()=>{
          a.el.classList.remove('flipped'); b.el.classList.remove('flipped');
          flipped=[]; lock=false;
        }, 850);
      }
    }
  }
}

/* =====================================================================
   ACTIVIDAD 6 — Trazá el contorno (dibujar arrastrando sobre la línea)
   ===================================================================== */
function getOutlinePoints(shape){
  // coordenadas relativas (%) dentro de trace-wrap — polígono cerrado
  switch(shape){
    case 'triangulo': return [[50,8],[90,88],[10,88]];
    case 'cuadrado': return [[15,15],[85,15],[85,85],[15,85]];
    case 'rectangulo': return [[10,25],[90,25],[90,75],[10,75]];
    case 'circulo': {
      const pts=[]; const n=28;
      for(let i=0;i<n;i++){
        const ang = (i/n)*2*Math.PI - Math.PI/2;
        pts.push([50+40*Math.cos(ang), 50+40*Math.sin(ang)]);
      }
      return pts;
    }
  }
}

function buildExercisesAct6(){
  return ['circulo','cuadrado','triangulo','rectangulo'];
}

function startActividad6(){
  showView('activity');
  let exercises = buildExercisesAct6();
  let idx=0; const done=[];
  engineSetup(exercises.length, restart);
  render();

  function restart(){ idx=0; done.length=0; engineSetup(exercises.length, restart); render(); }

  function render(){
    if(idx>=exercises.length){ finishActivity(restart); return; }
    renderDots(exercises.length, idx, done);
    const shape = exercises[idx];
    els.activityBody.innerHTML = `
      <div class="prompt-row"><div class="prompt-card"><span class="instruction-icon">✏️</span><span style="font-family:'Baloo 2';font-size:2vh;color:var(--ink);">DIBUJÁ SIN SOLTAR EL MOUSE</span></div></div>
      <div class="trace-wrap" id="tw">
        <svg width="100%" height="100%" style="position:absolute;inset:0;overflow:visible;">
          <polygon id="guidePoly" points="" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="4" stroke-dasharray="9,10" stroke-linejoin="round"/>
          <polyline id="progressPoly" points="" fill="none" stroke="${SHAPE_COLOR[shape]}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div id="frontierDot" class="trace-dot next"></div>
      </div>
    `;
    const tw = document.getElementById('tw');
    const rect = tw.getBoundingClientRect();
    const pctPoints = getOutlinePoints(shape);
    const pxPoints = pctPoints.map(p=>[ p[0]/100*rect.width, p[1]/100*rect.height ]);
    const segLens = pxPoints.map((p,i)=>{
      const q = pxPoints[(i+1)%pxPoints.length];
      return Math.hypot(q[0]-p[0], q[1]-p[1]);
    });
    const cum = [0];
    segLens.forEach(l=> cum.push(cum[cum.length-1]+l));
    const totalLen = cum[cum.length-1];

    document.getElementById('guidePoly').setAttribute('points', pxPoints.map(p=>p.join(',')).join(' '));

    let maxS = 0, dragging = false;
    let lastX = null, lastY = null;
    const maxStepPerEvent = totalLen * 0.12; // tope de avance por evento: exige movimiento real y continuo

    function pointAtS(s){
      s = ((s % totalLen) + totalLen) % totalLen;
      for(let i=0;i<pxPoints.length;i++){
        if(s>=cum[i] && s<=cum[i+1]){
          const t = segLens[i]===0 ? 0 : (s-cum[i])/segLens[i];
          const a=pxPoints[i], b=pxPoints[(i+1)%pxPoints.length];
          return [ a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t ];
        }
      }
      return pxPoints[0];
    }

    function nearestS(px,py){
      let best = {dist:Infinity, s:0};
      for(let i=0;i<pxPoints.length;i++){
        const a=pxPoints[i], b=pxPoints[(i+1)%pxPoints.length];
        const dx=b[0]-a[0], dy=b[1]-a[1];
        const len2 = dx*dx+dy*dy;
        let t = len2===0 ? 0 : ((px-a[0])*dx+(py-a[1])*dy)/len2;
        t = Math.max(0, Math.min(1,t));
        const cx=a[0]+dx*t, cy=a[1]+dy*t;
        const dist = Math.hypot(px-cx, py-cy);
        if(dist<best.dist) best = {dist, s: cum[i]+t*segLens[i]};
      }
      return best;
    }

    function updateProgressVisual(){
      const steps = 48;
      const pts = [];
      for(let i=0;i<=steps;i++) pts.push(pointAtS(maxS*(i/steps)));
      document.getElementById('progressPoly').setAttribute('points', pts.map(p=>p.join(',')).join(' '));
      const frontier = pointAtS(maxS);
      const fd = document.getElementById('frontierDot');
      fd.style.left = (frontier[0]/rect.width*100)+'%';
      fd.style.top = (frontier[1]/rect.height*100)+'%';
    }
    updateProgressVisual();

    const tolerance = Math.min(rect.width, rect.height)*0.11;
    const startTolerance = Math.min(rect.width, rect.height)*0.14;

    function onDown(e){
      const r = tw.getBoundingClientRect();
      const px = e.clientX-r.left, py = e.clientY-r.top;
      const frontier = pointAtS(maxS);
      if(Math.hypot(px-frontier[0], py-frontier[1]) <= startTolerance){
        dragging = true;
        lastX = px; lastY = py;
        document.getElementById('frontierDot').classList.remove('next');
        tw.setPointerCapture(e.pointerId);
      }
    }
    function onMove(e){
      if(!dragging) return;
      const r = tw.getBoundingClientRect();
      const px = e.clientX-r.left, py = e.clientY-r.top;
      // distancia real que se movió el puntero desde el último evento (exige arrastre físico, no un salto)
      const moved = Math.hypot(px-lastX, py-lastY);
      lastX = px; lastY = py;
      const {dist, s} = nearestS(px,py);
      if(dist <= tolerance){
        let forward = s - (maxS % totalLen);
        if(forward < -totalLen/2) forward += totalLen;
        // el avance nunca puede superar ni el tope por evento ni la distancia real recorrida por el puntero
        forward = Math.min(forward, maxStepPerEvent, moved*1.6);
        if(forward > 0){
          maxS = Math.min(maxS + forward, totalLen);
          updateProgressVisual();
          if(maxS >= totalLen*0.96) finishShape();
        }
      }
    }
    function onUp(){
      if(!dragging) return;
      dragging = false;
      if(maxS < totalLen*0.96){
        maxS = 0;
        updateProgressVisual();
        document.getElementById('frontierDot').classList.add('next');
        showFeedback('🔄', false);
      }
    }
    tw.addEventListener('pointerdown', onDown);
    tw.addEventListener('pointermove', onMove);
    tw.addEventListener('pointerup', onUp);
    tw.addEventListener('pointercancel', onUp);
    tw.style.touchAction = 'none';

    function finishShape(){
      dragging = false;
      addStar();
      showFeedback(pick(PRAISE_OK), true);
      done[idx]=true;
      setTimeout(()=>{ idx++; render(); }, 800);
    }
  }
}

/* =====================================================================
   Utilidad de arrastre (pointer events) reutilizada en act. 9 y 10
   ===================================================================== */
function makeDraggable(el, onDrop, onTap){
  let sx=0, sy=0, ox=0, oy=0, dragging=false;
  let origPos='', origLeft='', origTop='', origZ='', origMargin='';
  el.style.touchAction = 'none';
  el.addEventListener('pointerdown', (e)=>{
    dragging = true;
    el.setPointerCapture(e.pointerId);
    origPos = el.style.position; origLeft = el.style.left; origTop = el.style.top;
    origZ = el.style.zIndex; origMargin = el.style.margin;
    const rect = el.getBoundingClientRect();
    sx = e.clientX; sy = e.clientY;
    ox = rect.left; oy = rect.top;
    el.style.position = 'fixed';
    el.style.left = ox+'px'; el.style.top = oy+'px';
    el.style.zIndex = 999;
    el.style.margin = '0';
  });
  el.addEventListener('pointermove', (e)=>{
    if(!dragging) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    el.style.left = (ox+dx)+'px';
    el.style.top = (oy+dy)+'px';
  });
  el.addEventListener('pointerup', (e)=>{
    if(!dragging) return;
    dragging = false;
    const moved = Math.hypot(e.clientX-sx, e.clientY-sy);
    if(moved < 6 && onTap){
      // toque simple: restaurar el estado previo (no fue un arrastre) y solo notificar el toque
      el.style.position = origPos; el.style.left = origLeft; el.style.top = origTop;
      el.style.zIndex = origZ; el.style.margin = origMargin;
      onTap(el);
    } else {
      onDrop(e.clientX, e.clientY, el);
    }
  });
}

/* =====================================================================
   ACTIVIDAD 9 — Construí usando las formas y colores (juego libre)
   ===================================================================== */
function startActividad9(){
  showView('activity');
  renderDots(0,0,[]);
  els.starCount.textContent='🎨';
  els.activityBody.innerHTML = `
    <div class="build-wrap">
      <div class="build-canvas" id="canvas9"></div>
      <div class="build-piece-tray" id="tray9">
        <div style="font-family:'Baloo 2';font-size:1.6vh;color:var(--card);text-align:center;">TOCÁ UNA FORMA<br>PARA AGREGARLA.<br>TOCÁ UNA PIEZA YA<br>PUESTA PARA GIRARLA<br>O CAMBIARLE EL TAMAÑO</div>
        <div id="palette9" style="display:flex;flex-wrap:wrap;gap:.8vh;justify-content:center;width:16vw;"></div>
        <button id="clear9" class="btn-big btn-retry" style="margin-top:1vh;">🧹 LIMPIAR</button>
      </div>
    </div>
  `;
  const canvas = document.getElementById('canvas9');
  const palette = document.getElementById('palette9');
  const shapes = ['circulo','triangulo','cuadrado','rectangulo'];
  const cols = Object.values(COLORS);
  shapes.forEach(sh=>{
    cols.forEach(c=>{
      const btn = document.createElement('div');
      btn.className='build-piece';
      btn.innerHTML = shapeSVG(sh, c, 34);
      btn.style.cursor='grab';
      btn.style.touchAction = 'none';
      attachPaletteDrag9(btn, sh, c);
      palette.appendChild(btn);
    });
  });

  function attachPaletteDrag9(btn, sh, color){
    let ghost=null, sx=0, sy=0, dragging=false;
    btn.addEventListener('pointerdown', (e)=>{
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      btn.setPointerCapture(e.pointerId);
      ghost = document.createElement('div');
      ghost.innerHTML = shapeSVG(sh, color, 60);
      ghost.style.position = 'fixed';
      ghost.style.left = (e.clientX-30)+'px';
      ghost.style.top = (e.clientY-30)+'px';
      ghost.style.zIndex = '2000';
      ghost.style.opacity = '0.85';
      ghost.style.pointerEvents = 'none';
      document.body.appendChild(ghost);
    });
    btn.addEventListener('pointermove', (e)=>{
      if(!dragging || !ghost) return;
      ghost.style.left = (e.clientX-30)+'px';
      ghost.style.top = (e.clientY-30)+'px';
    });
    btn.addEventListener('pointerup', (e)=>{
      if(!dragging) return;
      dragging = false;
      if(ghost){ ghost.remove(); ghost=null; }
      const r = canvas.getBoundingClientRect();
      const moved = Math.hypot(e.clientX-sx, e.clientY-sy);
      if(moved < 6){
        addPiece(sh, color, r.width*0.4, r.height*0.4);
      } else if(e.clientX>=r.left && e.clientX<=r.right && e.clientY>=r.top && e.clientY<=r.bottom){
        addPiece(sh, color, e.clientX-r.left-37.5, e.clientY-r.top-37.5);
      }
    });
    btn.addEventListener('pointercancel', ()=>{ dragging=false; if(ghost){ ghost.remove(); ghost=null; } });
  }

  let selected = null;
  let toolbar = null;

  function deselect(){
    if(selected) selected.classList.remove('selected');
    selected = null;
    if(toolbar){ toolbar.remove(); toolbar = null; }
  }

  document.getElementById('clear9').addEventListener('click', ()=>{ deselect(); canvas.innerHTML=''; });
  canvas.addEventListener('pointerdown', (e)=>{ if(e.target===canvas) deselect(); });

  function select(piece){
    if(selected===piece) return;
    deselect();
    selected = piece;
    piece.classList.add('selected');
    toolbar = document.createElement('div');
    toolbar.className = 'piece-toolbar';
    toolbar.innerHTML = `
      <button data-act="rotL">↺</button>
      <button data-act="rotR">↻</button>
      <button data-act="grow">➕</button>
      <button data-act="shrink">➖</button>
      <button data-act="del">🗑️</button>
    `;
    canvas.appendChild(toolbar);
    positionToolbar();
    toolbar.querySelectorAll('button').forEach(btn=>{
      btn.addEventListener('pointerdown', (e)=> e.stopPropagation());
      btn.addEventListener('click', (e)=>{
        e.stopPropagation();
        const act = btn.dataset.act;
        if(act==='del'){ piece.remove(); deselect(); return; }
        let rot = parseFloat(piece.dataset.rot||'0');
        let scale = parseFloat(piece.dataset.scale||'1');
        if(act==='rotL') rot -= 30;
        if(act==='rotR') rot += 30;
        if(act==='grow') scale = Math.min(2.4, scale+0.18);
        if(act==='shrink') scale = Math.max(0.4, scale-0.18);
        piece.dataset.rot = rot; piece.dataset.scale = scale;
        piece.style.transform = `rotate(${rot}deg) scale(${scale})`;
        positionToolbar();
      });
    });
  }

  function positionToolbar(){
    if(!selected || !toolbar) return;
    const r = canvas.getBoundingClientRect();
    const pr = selected.getBoundingClientRect();
    toolbar.style.left = (pr.left - r.left + pr.width/2) + 'px';
    toolbar.style.top = (pr.top - r.top) + 'px';
  }

  function addPiece(sh,color,left,top){
    const size = 75;
    const piece = document.createElement('div');
    piece.className='build-piece';
    piece.style.position='absolute';
    piece.dataset.rot = 0; piece.dataset.scale = 1;
    const rect = canvas.getBoundingClientRect();
    piece.style.left = (left!=null ? left : rect.width*0.4)+'px';
    piece.style.top = (top!=null ? top : rect.height*0.4)+'px';
    piece.innerHTML = shapeSVG(sh, color, size);
    canvas.appendChild(piece);
    makeDraggable(piece, (clientX, clientY, el)=>{
      const r = canvas.getBoundingClientRect();
      let left = clientX - r.left - el.offsetWidth/2;
      let top = clientY - r.top - el.offsetHeight/2;
      el.style.position='absolute';
      el.style.left = left+'px'; el.style.top = top+'px';
      el.style.zIndex = selected===el ? '998' : '';
      if(selected===el) positionToolbar();
    }, (el)=>{ select(el); });
  }
}

/* Combinaciones figura+color, usadas por la actividad "Seguí el patrón" */
const SHAPES4 = ['circulo','triangulo','cuadrado','rectangulo'];
const COLORS4 = ['#FFD23F','#FF6B6B','#3AA8E0','#4CD787'];
function allCombos(){
  const combos = [];
  SHAPES4.forEach(sh=> COLORS4.forEach(c=> combos.push({shape:sh,color:c})));
  return combos; // 16 combinaciones posibles
}

