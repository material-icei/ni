/* ==========================================================
   Numeración hasta el 30 — lógica de la app
   ========================================================== */
(function () {
  'use strict';

  /* ---------- Ajuste del escenario a 16:9 sin scroll ---------- */
  var stage = document.getElementById('stage');
  function fitStage() {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var targetRatio = 16 / 9;
    var w, h;
    if (vw / vh > targetRatio) {
      h = vh;
      w = h * targetRatio;
    } else {
      w = vw;
      h = w / targetRatio;
    }
    stage.style.width = w + 'px';
    stage.style.height = h + 'px';
  }
  window.addEventListener('resize', fitStage);
  fitStage();

  /* ---------- Utilidades ---------- */
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function uniqueNumbers(count, min, max) {
    var pool = [];
    for (var n = min; n <= max; n++) pool.push(n);
    return shuffle(pool).slice(0, count).sort(function (a, b) { return a - b; });
  }
  function el(tag, className, text) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  var SHAPES = ['circle', 'square', 'triangle', 'star'];
  var COLORS = ['coral', 'sun', 'turquoise', 'grape', 'leaf', 'sky'];
  var COLOR_VAR = {
    coral: 'var(--coral)', sun: 'var(--sun)', turquoise: 'var(--turquoise)',
    grape: 'var(--grape)', leaf: 'var(--leaf)', sky: 'var(--sky)'
  };
  var COUNT_EMOJIS = ['🍎', '🍓', '🍌', '🍉', '🍇', '🐝', '🦋', '🐢', '🐬', '🐞', '🌟', '🎈', '🌈', '🌻', '🍀', '⚽', '🚗', '🎁'];

  function makeShapeEl(shapeType, colorName, sizeVh) {
    var e = el('span', 'item-shape shape-' + shapeType);
    if (shapeType === 'triangle') {
      e.style.setProperty('--tri-size', (sizeVh / 2) + 'vh');
      e.style.borderBottomColor = COLOR_VAR[colorName];
    } else {
      e.style.width = sizeVh + 'vh';
      e.style.height = sizeVh + 'vh';
      e.style.background = COLOR_VAR[colorName];
    }
    return e;
  }

  function makeEmojiEl(emoji, sizeVh) {
    var e = el('button', 'item-emoji', emoji);
    e.type = 'button';
    e.style.fontSize = sizeVh + 'vh';
    e.addEventListener('click', function () {
      e.classList.toggle('is-counted');
    });
    return e;
  }

  function sizeForCount(count) {
    if (count <= 6) return 12;
    if (count <= 10) return 10;
    if (count <= 16) return 8.2;
    if (count <= 22) return 6.6;
    return 5.4;
  }

  /* ---------- Utilidades para las actividades de arrastrar, completar y unir ---------- */

  // Emoji dentro de una caja de tamaño fijo (así el acomodo es predecible y nada se corta)
  function makeEmojiItem(emoji, sizeVh, tappable) {
    var e = el(tappable ? 'button' : 'span', 'emoji-item', emoji);
    if (tappable) e.type = 'button';
    e.style.width = sizeVh + 'vh';
    e.style.height = sizeVh + 'vh';
    e.style.fontSize = (sizeVh * 0.8) + 'vh';
    return e;
  }

  // Tamaño más grande de emoji que entra completo en un panel de (wVh x hVh)
  function fitEmojiSize(count, wVh, hVh, gapVh) {
    for (var s = 12; s >= 3; s -= 0.2) {
      var perRow = Math.floor((wVh + gapVh) / (s + gapVh));
      if (perRow < 1) continue;
      var rows = Math.ceil(count / perRow);
      if (rows * (s + gapVh) - gapVh <= hVh) return Math.round(s * 10) / 10;
    }
    return 3;
  }

  // Un número al azar dentro de cada tramo (dificultad creciente), sin repetir
  function pickFromBuckets(buckets) {
    var used = [];
    return buckets.map(function (b) {
      var n, tries = 0;
      do { n = rand(b[0], b[1]); tries++; } while (used.indexOf(n) !== -1 && tries < 40);
      used.push(n);
      return n;
    });
  }

  // 'count' números distintos, separados al menos 'gap' entre sí
  function pickSpaced(count, min, max, gap) {
    for (var attempt = 0; attempt < 200; attempt++) {
      var pool = [];
      for (var n = min; n <= max; n++) pool.push(n);
      pool = shuffle(pool);
      var picks = [];
      for (var i = 0; i < pool.length && picks.length < count; i++) {
        var ok = true;
        for (var j = 0; j < picks.length; j++) {
          if (Math.abs(picks[j] - pool[i]) < gap) { ok = false; break; }
        }
        if (ok) picks.push(pool[i]);
      }
      if (picks.length === count) return picks;
    }
    return uniqueNumbers(count, min, max);
  }

  // Marca de error / acierto compartida por todas las actividades nuevas
  function showRetry() {
    state.attemptFailed = true;
    feedbackBanner.textContent = pickRetry();
    feedbackBanner.classList.remove('is-visible');
    void feedbackBanner.offsetWidth;
    feedbackBanner.classList.add('is-visible', 'is-retry');
  }

  function succeed() {
    state.locked = true;
    // La estrella solo se gana si se resolvió sin errores
    if (!state.attemptFailed) {
      state.stars++;
      starsCount.textContent = String(state.stars);
    }
    feedbackBanner.classList.remove('is-retry');
    feedbackBanner.textContent = state.attemptFailed ? pickEncouragement() : pickPraise();
    feedbackBanner.classList.add('is-visible');
    setTimeout(advance, 1300);
  }

  // Sacude un elemento (error)
  function shake(node) {
    node.classList.remove('is-shaking');
    void node.offsetWidth;
    node.classList.add('is-shaking');
    setTimeout(function () { node.classList.remove('is-shaking'); }, 450);
  }

  // Busca el destino (casillero o zona) bajo el puntero, con un margen de tolerancia
  function findTarget(x, y, targets) {
    var pad = stage.clientHeight * 0.025;
    var best = null, bestD = Infinity;
    targets.forEach(function (t) {
      if (t.classList.contains('is-filled')) return;
      var r = t.getBoundingClientRect();
      if (x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad) {
        var d = Math.hypot(x - (r.left + r.right) / 2, y - (r.top + r.bottom) / 2);
        if (d < bestD) { bestD = d; best = t; }
      }
    });
    return best;
  }

  /* Arrastre con puntero (funciona igual con mouse, dedo o lápiz).
     opts.getTargets()        -> destinos posibles
     opts.onDrop(target,node) -> true si el elemento fue aceptado (el que llama lo acomoda)
     opts.onTap(node)         -> toque corto sin arrastrar (opcional) */
  function enableDrag(node, opts) {
    node.style.touchAction = 'none';
    node.addEventListener('pointerdown', function (ev) {
      if (state.locked || node.dataset.locked === '1') return;
      if (ev.pointerType === 'mouse' && ev.button !== 0) return;
      ev.preventDefault();
      var startX = ev.clientX, startY = ev.clientY, moved = false, hover = null;
      try { node.setPointerCapture(ev.pointerId); } catch (err) { /* ignorar */ }

      function setHover(t) {
        if (hover === t) return;
        if (hover) hover.classList.remove('is-hover');
        hover = t;
        if (hover) hover.classList.add('is-hover');
      }

      function onMove(e) {
        var dx = e.clientX - startX, dy = e.clientY - startY;
        if (!moved && Math.abs(dx) + Math.abs(dy) > 8) {
          moved = true;
          node.classList.add('is-dragging');
          node.style.transition = 'none';
        }
        if (moved) {
          node.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.1)';
          setHover(findTarget(e.clientX, e.clientY, opts.getTargets()));
        }
      }

      function onUp(e) {
        node.removeEventListener('pointermove', onMove);
        node.removeEventListener('pointerup', onUp);
        node.removeEventListener('pointercancel', onUp);
        try { node.releasePointerCapture(ev.pointerId); } catch (err) { /* ignorar */ }
        setHover(null);
        node.classList.remove('is-dragging');

        if (!moved) {
          node.style.transform = '';
          if (opts.onTap) opts.onTap(node);
          return;
        }
        var target = e.type === 'pointercancel' ? null : findTarget(e.clientX, e.clientY, opts.getTargets());
        var accepted = target ? opts.onDrop(target, node) : false;
        if (!accepted) {
          // vuelve suavemente a su lugar
          node.style.transition = 'transform .25s ease';
          node.style.transform = '';
          setTimeout(function () { node.style.transition = ''; }, 280);
        }
      }

      node.addEventListener('pointermove', onMove);
      node.addEventListener('pointerup', onUp);
      node.addEventListener('pointercancel', onUp);
    });
  }

  // Coloca una ficha dentro de un casillero
  function placeTile(tile, slot) {
    var mark = slot.querySelector('.slot-mark');
    if (mark) mark.remove();
    slot.appendChild(tile);
    tile.style.transform = '';
    tile.style.transition = '';
    tile.dataset.locked = '1';
    tile.classList.add('is-placed');
    slot.classList.add('is-filled');
  }

  function makeNumTile(value) {
    var t = el('div', 'num-tile', String(value));
    t.dataset.value = value;
    return t;
  }

  /* ==========================================================
     GENERACIÓN DE EJERCICIOS
     ========================================================== */

  // Actividad 1: conteo de colecciones (completar con el número)
  function buildActivity1() {
    var numbers = uniqueNumbers(10, 1, 30);
    return numbers.map(function (n) {
      var emoji = COUNT_EMOJIS[rand(0, COUNT_EMOJIS.length - 1)];
      var options = shuffle(distractorsNear(n, 1, 30));
      return {
        type: 'count',
        answer: n,
        emoji: emoji,
        options: options,
        question: '¿Cuántos hay? Elegí el número'
      };
    });
  }

  // Actividad 2: anterior y posterior a un número
  function buildActivity2() {
    var numbers = uniqueNumbers(10, 2, 29);
    return numbers.map(function (n, idx) {
      var mode = idx % 2 === 0 ? 'posterior' : 'anterior';
      var answer = mode === 'posterior' ? n + 1 : n - 1;
      var options = shuffle(distractorsNear(answer, 1, 30, [n]));
      return {
        type: 'neighbor',
        base: n,
        mode: mode,
        answer: answer,
        options: options
      };
    });
  }

  // Actividad 3: correspondencia número y cantidad
  function buildActivity3() {
    var numbers = uniqueNumbers(10, 1, 30);
    return numbers.map(function (n) {
      var shape = SHAPES[rand(0, SHAPES.length - 1)];
      var color = COLORS[rand(0, COLORS.length - 1)];
      var wrongQuantities = distractorsNear(n, 1, 30).filter(function (v) { return v !== n; });
      var quantities = shuffle([n, wrongQuantities[0], wrongQuantities[1]]);
      return {
        type: 'match',
        answer: n,
        shape: shape,
        color: color,
        quantities: quantities,
        question: 'Tocá el grupo que tiene ' + n + ' elementos'
      };
    });
  }

  // Actividad 4: ¿qué número va en el medio? (está entre dos números)
  function buildActivity4() {
    var starts = uniqueNumbers(10, 1, 28);
    return starts.map(function (a) {
      var answer = a + 1;
      var options = shuffle(distractorsNear(answer, 1, 30, [a, a + 2]));
      return {
        type: 'between',
        low: a,
        high: a + 2,
        answer: answer,
        options: options
      };
    });
  }

  // Actividad 5: ordenar una secuencia de 5 números consecutivos
  function buildActivity5() {
    var list = [];
    var starts = shuffle((function () {
      var pool = [];
      for (var s = 1; s <= 26; s++) pool.push(s);
      return pool;
    })()).slice(0, 3);

    starts.forEach(function (start) {
      var sorted = [start, start + 1, start + 2, start + 3, start + 4];
      var display = shuffle(sorted);
      var tries = 0;
      while (arraysEqual(display, sorted) && tries < 6) {
        display = shuffle(sorted);
        tries++;
      }
      list.push({
        type: 'sequence',
        sorted: sorted,
        shuffled: display,
        placedCount: 0
      });
    });
    return list;
  }

  function arraysEqual(a, b) {
    for (var i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  /* ---------- Actividades nuevas: arrastrar, completar y unir (5 ejercicios c/u) ---------- */

  // A) Contar y arrastrar el número al casillero
  function buildDragCount() {
    return pickFromBuckets([[2, 6], [5, 10], [9, 15], [14, 22], [20, 30]]).map(function (n) {
      return {
        type: 'countDrag',
        answer: n,
        emoji: COUNT_EMOJIS[rand(0, COUNT_EMOJIS.length - 1)],
        options: distractorsNear(n, 1, 30)
      };
    });
  }

  // B) Completar la colección: llenar la bandeja con tantos objetos como indica el número
  function buildFillCollection() {
    return pickFromBuckets([[2, 5], [4, 8], [8, 12], [12, 18], [16, 24]]).map(function (n) {
      return {
        type: 'fill',
        answer: n,
        emoji: COUNT_EMOJIS[rand(0, COUNT_EMOJIS.length - 1)],
        pileCount: Math.min(30, n + rand(2, 4))
      };
    });
  }

  // C) Arrastrar el anterior y el posterior a los casilleros de cada lado del número
  function buildNeighborDrag() {
    return shuffle(uniqueNumbers(5, 2, 29)).map(function (n) {
      var extra = [];
      [-3, -2, 2, 3].forEach(function (o) {
        var v = n + o;
        if (v >= 1 && v <= 30) extra.push(v);
      });
      var options = shuffle([n - 1, n + 1].concat(shuffle(extra).slice(0, 2)));
      return { type: 'neighborDrag', base: n, options: options };
    });
  }

  // D) Completar los números que faltan en una tira de 6 consecutivos
  function buildSequenceFill() {
    var blanksPerExercise = [1, 1, 2, 2, 3];
    return blanksPerExercise.map(function (blanks) {
      var start = rand(1, 25);
      var values = [];
      for (var i = 0; i < 6; i++) values.push(start + i);
      var blankIdx = shuffle([0, 1, 2, 3, 4, 5]).slice(0, blanks);
      var missing = blankIdx.map(function (i) { return values[i]; });
      // una ficha de más que no sirve, para pensar
      var spare = [];
      for (var v = start - 2; v <= start + 7; v++) {
        if (v >= 1 && v <= 30 && values.indexOf(v) === -1) spare.push(v);
      }
      var tiles = shuffle(missing.concat([spare[rand(0, spare.length - 1)]]));
      return { type: 'seqFill', values: values, blankIdx: blankIdx, tiles: tiles };
    });
  }

  // E) Unir cada número con el grupo que tiene esa cantidad
  function buildJoinQuantity() {
    var ranges = [[1, 8], [2, 12], [4, 16], [8, 22], [12, 30]];
    return ranges.map(function (r) {
      var nums = pickSpaced(3, r[0], r[1], 2);
      var emoji = COUNT_EMOJIS[rand(0, COUNT_EMOJIS.length - 1)];
      return {
        type: 'join',
        kind: 'quantity',
        emoji: emoji,
        left: nums.map(function (n) { return { key: n, value: n }; }),
        right: shuffle(nums.map(function (n) { return { key: n, value: n }; }))
      };
    });
  }

  // F) Unir cada número con el que sigue (▶) o con el que va antes (◀)
  function buildJoinNeighbor() {
    var modes = ['posterior', 'anterior', 'posterior', 'anterior', 'posterior'];
    return modes.map(function (mode) {
      var bases = mode === 'posterior' ? pickSpaced(3, 1, 29, 3) : pickSpaced(3, 2, 30, 3);
      var off = mode === 'posterior' ? 1 : -1;
      return {
        type: 'join',
        kind: 'neighbor',
        mode: mode,
        left: bases.slice().sort(function (a, b) { return a - b; }).map(function (n) { return { key: n, value: n }; }),
        right: shuffle(bases.map(function (n) { return { key: n, value: n + off }; }))
      };
    });
  }

  // G) Arrastrar cada número al grupo que tiene esa cantidad
  function buildDragQuantity() {
    var ranges = [[1, 8], [3, 12], [6, 16], [10, 20], [14, 30]];
    return ranges.map(function (r) {
      var nums = pickSpaced(3, r[0], r[1], 2);
      return {
        type: 'dragQty',
        emoji: COUNT_EMOJIS[rand(0, COUNT_EMOJIS.length - 1)],
        groups: shuffle(nums),
        tiles: shuffle(nums)
      };
    });
  }

  // Genera 3 opciones numéricas cercanas al valor correcto (para variar dificultad)
  function distractorsNear(correct, min, max, exclude) {
    exclude = exclude || [];
    var pool = [];
    for (var offset of [-3, -2, -1, 1, 2, 3, -4, 4]) {
      var v = correct + offset;
      if (v >= min && v <= max && v !== correct && exclude.indexOf(v) === -1 && pool.indexOf(v) === -1) {
        pool.push(v);
      }
    }
    pool = shuffle(pool).slice(0, 3);
    var set = pool.concat([correct]);
    return shuffle(set);
  }

  /* ---------- Definición de actividades ---------- */
  // Ordenadas por tema: conteo → anterior/posterior → número y cantidad → secuencia
  var ACTIVITIES = [
    { key: 'count', icon: '🔢', name: 'Contar colecciones', build: buildActivity1, count: 10 },
    { key: 'countDrag', icon: '👆', name: 'Contar y arrastrar el número', build: buildDragCount, count: 5 },
    { key: 'fill', icon: '🧺', name: 'Completar la cantidad', build: buildFillCollection, count: 5 },
    { key: 'neighbor', icon: '↔️', name: 'Anterior y posterior', build: buildActivity2, count: 10 },
    { key: 'neighborDrag', icon: '🎯', name: 'Arrastrar anterior y posterior', build: buildNeighborDrag, count: 5 },
    { key: 'seqFill', icon: '🚂', name: 'Completar la tira numérica', build: buildSequenceFill, count: 5 },
    { key: 'joinNeighbor', icon: '🖍️', name: 'Unir anterior y posterior', build: buildJoinNeighbor, count: 5 },
    { key: 'between', icon: '🧩', name: 'Número en el medio', build: buildActivity4, count: 10 },
    { key: 'match', icon: '🔗', name: 'Número y cantidad', build: buildActivity3, count: 10 },
    { key: 'joinQty', icon: '🖍️', name: 'Unir número y cantidad', build: buildJoinQuantity, count: 5 },
    { key: 'dragQty', icon: '🧲', name: 'Arrastrar número a su grupo', build: buildDragQuantity, count: 5 },
    { key: 'sequence', icon: '🪜', name: 'Ordenar números', build: buildActivity5, count: 3 }
  ];
  var TOTAL_EXERCISES = ACTIVITIES.reduce(function (sum, a) { return sum + a.count; }, 0);

  /* ---------- Estado ---------- */
  var state = {
    activityIndex: 0,
    exerciseIndex: 0,
    exercises: [],
    stars: 0,
    locked: false,
    attemptFailed: false
  };

  /* ---------- Referencias DOM ---------- */
  var screenIntro = document.getElementById('screen-intro');
  var screenActivity = document.getElementById('screen-activity');
  var screenFinal = document.getElementById('screen-final');
  var btnStart = document.getElementById('btn-start');
  var btnRestart = document.getElementById('btn-restart');
  var activityIcon = document.getElementById('activity-icon');
  var activityName = document.getElementById('activity-name');
  var progressDots = document.getElementById('progress-dots');
  var starsCount = document.getElementById('stars-count');
  var activityMain = document.getElementById('activity-main');
  var feedbackBanner = document.getElementById('feedback-banner');

  function showScreen(screen) {
    [screenIntro, screenActivity, screenFinal].forEach(function (s) {
      s.classList.toggle('is-active', s === screen);
    });
  }

  /* ---------- Flujo principal ---------- */
  function startApp() {
    state.activityIndex = 0;
    state.stars = 0;
    starsCount.textContent = '0';
    loadActivity(0);
    showScreen(screenActivity);
  }

  function loadActivity(index) {
    state.activityIndex = index;
    state.exerciseIndex = 0;
    state.exercises = ACTIVITIES[index].build();
    activityIcon.textContent = ACTIVITIES[index].icon;
    activityName.textContent = ACTIVITIES[index].name;
    buildProgressDots(ACTIVITIES[index].count);
    loadExercise();
  }

  function buildProgressDots(count) {
    progressDots.innerHTML = '';
    for (var i = 0; i < count; i++) {
      progressDots.appendChild(el('span', 'dot'));
    }
    updateProgressDots();
  }

  function updateProgressDots() {
    var dots = progressDots.children;
    for (var i = 0; i < dots.length; i++) {
      dots[i].classList.remove('is-done', 'is-current');
      if (i < state.exerciseIndex) dots[i].classList.add('is-done');
      else if (i === state.exerciseIndex) dots[i].classList.add('is-current');
    }
  }

  function loadExercise() {
    state.locked = false;
    state.attemptFailed = false;
    updateProgressDots();
    feedbackBanner.classList.remove('is-visible');
    feedbackBanner.textContent = '';
    var ex = state.exercises[state.exerciseIndex];
    renderExercise(ex);
  }

  function renderExercise(ex) {
    activityMain.innerHTML = '';

    if (ex.type === 'count') {
      var box = el('div', 'collection-box');
      var size = sizeForCount(ex.answer);
      for (var i = 0; i < ex.answer; i++) {
        box.appendChild(makeEmojiEl(ex.emoji, size));
      }
      activityMain.appendChild(box);
      activityMain.appendChild(el('p', 'question-text', ex.question));
      activityMain.appendChild(buildOptionsGrid(ex.options, ex.answer));
    }

    if (ex.type === 'neighbor') {
      var prompt = el('div', 'neighbor-prompt');
      var arrow = el('div', 'arrow-badge ' + ex.mode, ex.mode === 'anterior' ? '◀' : '▶');
      var card = el('div', 'number-card-big', String(ex.base));
      if (ex.mode === 'anterior') {
        prompt.appendChild(arrow);
        prompt.appendChild(card);
      } else {
        prompt.appendChild(card);
        prompt.appendChild(arrow);
      }
      activityMain.appendChild(prompt);
      activityMain.appendChild(buildOptionsGrid(ex.options, ex.answer));
    }

    if (ex.type === 'match') {
      var card2 = el('div', 'number-card-big', String(ex.answer));
      activityMain.appendChild(card2);
      activityMain.appendChild(el('p', 'question-text', ex.question));
      var row = el('div', 'groups-row');
      ex.quantities.forEach(function (q) {
        var panel = el('div', 'group-panel');
        panel.dataset.value = q;
        var size = sizeForCount(q);
        for (var i = 0; i < q; i++) {
          panel.appendChild(makeShapeEl(ex.shape, ex.color, size));
        }
        panel.addEventListener('click', function () { onAnswer(this.dataset.value * 1, ex.answer, this, row.children); });
        row.appendChild(panel);
      });
      activityMain.appendChild(row);
    }
    if (ex.type === 'between') {
      var betweenWrap = el('div', 'between-prompt');
      betweenWrap.appendChild(el('div', 'number-card-big', String(ex.low)));
      betweenWrap.appendChild(el('div', 'number-card-slot', '?'));
      betweenWrap.appendChild(el('div', 'number-card-big', String(ex.high)));
      activityMain.appendChild(betweenWrap);
      activityMain.appendChild(buildOptionsGrid(ex.options, ex.answer));
    }

    if (ex.type === 'sequence') {
      var seqWrap = el('div', 'sequence-wrap');
      var slotsRow = el('div', 'sequence-slots');
      ex.slotEls = [];
      for (var s = 0; s < ex.sorted.length; s++) {
        var slot = el('div', 'sequence-slot');
        slotsRow.appendChild(slot);
        ex.slotEls.push(slot);
      }
      seqWrap.appendChild(slotsRow);

      var tilesRow = el('div', 'sequence-tiles');
      ex.shuffled.forEach(function (num) {
        var tile = el('button', 'sequence-tile', String(num));
        tile.type = 'button';
        tile.addEventListener('click', function () {
          onSequenceTile(this.textContent * 1, this, ex);
        });
        tilesRow.appendChild(tile);
      });
      seqWrap.appendChild(tilesRow);
      activityMain.appendChild(seqWrap);
    }

    if (ex.type === 'countDrag') renderCountDrag(ex);
    if (ex.type === 'fill') renderFill(ex);
    if (ex.type === 'neighborDrag') renderNeighborDrag(ex);
    if (ex.type === 'seqFill') renderSeqFill(ex);
    if (ex.type === 'join') renderJoin(ex);
    if (ex.type === 'dragQty') renderDragQty(ex);
  }

  /* ==========================================================
     ACTIVIDADES DE ARRASTRAR, COMPLETAR Y UNIR
     ========================================================== */

  function makeSlot(expected) {
    var slot = el('div', 'drop-slot');
    slot.dataset.expect = expected;
    slot.appendChild(el('span', 'slot-mark', '?'));
    return slot;
  }

  // Bandeja de fichas numéricas que se arrastran a los casilleros.
  // disableWrong: la ficha equivocada queda apagada (solo si hay un único casillero).
  function buildSlotTray(values, slots, disableWrong) {
    var tray = el('div', 'tile-tray');
    values.forEach(function (v) {
      var tile = makeNumTile(v);
      tray.appendChild(tile);
      enableDrag(tile, {
        getTargets: function () { return slots; },
        onDrop: function (target, t) {
          if (t.dataset.value * 1 !== target.dataset.expect * 1) {
            if (disableWrong) {
              t.classList.add('is-used');
              t.dataset.locked = '1';
            }
            shake(target);
            showRetry();
            return false;
          }
          placeTile(t, target);
          var allFilled = slots.every(function (s) { return s.classList.contains('is-filled'); });
          if (allFilled) succeed();
          return true;
        }
      });
    });
    return tray;
  }

  // A) Contar los objetos (se pueden ir tildando) y arrastrar el número al casillero
  function renderCountDrag(ex) {
    var box = el('div', 'collection-box compact');
    var size = fitEmojiSize(ex.answer, 84, 32.5, 1.4);
    for (var i = 0; i < ex.answer; i++) {
      var item = makeEmojiItem(ex.emoji, size, true);
      item.addEventListener('click', function () { this.classList.toggle('is-counted'); });
      box.appendChild(item);
    }
    activityMain.appendChild(box);

    var slot = makeSlot(ex.answer);
    var row = el('div', 'drag-row');
    row.appendChild(buildSlotTray(ex.options, [slot], true));
    row.appendChild(el('div', 'drag-hint', '👉'));
    row.appendChild(slot);
    activityMain.appendChild(row);
  }

  // B) Llevar objetos de la pila a la bandeja hasta completar el número, y confirmar con ✔
  function renderFill(ex) {
    var top = el('div', 'fill-top');
    top.appendChild(el('div', 'number-card-big', String(ex.answer)));
    var check = el('button', 'btn-check', '✔');
    check.type = 'button';
    top.appendChild(check);
    activityMain.appendChild(top);

    var panels = el('div', 'fill-panels');
    var pile = el('div', 'fill-panel pile');
    var tray = el('div', 'fill-panel tray');
    var size = fitEmojiSize(ex.pileCount, 66, 36, 0.9);
    var zones = [pile, tray];

    function moveItem(node, zone) {
      zone.appendChild(node);
      node.style.transform = '';
      node.style.transition = '';
    }

    for (var i = 0; i < ex.pileCount; i++) {
      var it = makeEmojiItem(ex.emoji, size, true);
      pile.appendChild(it);
      enableDrag(it, {
        getTargets: function () { return zones; },
        onDrop: function (zone, node) {
          if (zone === node.parentNode) return false;
          moveItem(node, zone);
          return true;
        },
        onTap: function (node) {
          moveItem(node, node.parentNode === pile ? tray : pile);
        }
      });
    }

    panels.appendChild(pile);
    panels.appendChild(el('div', 'drag-hint', '👉'));
    panels.appendChild(tray);
    activityMain.appendChild(panels);

    check.addEventListener('click', function () {
      if (state.locked) return;
      if (tray.children.length === ex.answer) {
        check.disabled = true;
        succeed();
      } else {
        shake(tray);
        showRetry();
      }
    });
  }

  // C) Arrastrar el anterior (◀) y el posterior (▶) a los casilleros de cada lado del número
  function renderNeighborDrag(ex) {
    var slotL = makeSlot(ex.base - 1);
    var slotR = makeSlot(ex.base + 1);

    var row = el('div', 'nd-row');
    var colL = el('div', 'nd-col');
    colL.appendChild(el('div', 'arrow-badge small anterior', '◀'));
    colL.appendChild(slotL);
    var colC = el('div', 'nd-col');
    colC.appendChild(el('div', 'number-card-big', String(ex.base)));
    var colR = el('div', 'nd-col');
    colR.appendChild(el('div', 'arrow-badge small posterior', '▶'));
    colR.appendChild(slotR);
    row.appendChild(colL);
    row.appendChild(colC);
    row.appendChild(colR);
    activityMain.appendChild(row);

    activityMain.appendChild(buildSlotTray(ex.options, [slotL, slotR], false));
  }

  // D) Completar los números que faltan en la tira
  function renderSeqFill(ex) {
    var strip = el('div', 'seq-strip');
    var slots = [];
    ex.values.forEach(function (v, i) {
      if (ex.blankIdx.indexOf(i) !== -1) {
        var slot = makeSlot(v);
        slots.push(slot);
        strip.appendChild(slot);
      } else {
        strip.appendChild(el('div', 'strip-cell', String(v)));
      }
    });
    activityMain.appendChild(strip);
    activityMain.appendChild(buildSlotTray(ex.tiles, slots, false));
  }

  // G) Arrastrar cada número debajo del grupo que tiene esa cantidad
  function renderDragQty(ex) {
    var row = el('div', 'dq-row');
    var slots = [];
    // Mismo tamaño de emoji en los tres grupos (para contar, no para comparar tamaños)
    var size = Math.min.apply(null, ex.groups.map(function (n) {
      return fitEmojiSize(n, 45.5, 27.5, 0.8);
    }));
    ex.groups.forEach(function (n) {
      var col = el('div', 'dq-col');
      var panel = el('div', 'dq-panel');
      for (var i = 0; i < n; i++) {
        var item = makeEmojiItem(ex.emoji, size, true);
        item.addEventListener('click', function () { this.classList.toggle('is-counted'); });
        panel.appendChild(item);
      }
      var slot = makeSlot(n);
      slots.push(slot);
      col.appendChild(panel);
      col.appendChild(slot);
      row.appendChild(col);
    });
    activityMain.appendChild(row);
    activityMain.appendChild(buildSlotTray(ex.tiles, slots, false));
  }

  // E y F) Unir con una línea (se arrastra de un lado al otro, o se toca uno y luego el otro)
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var PAIR_COLORS = ['var(--coral)', 'var(--grape)', 'var(--turquoise)'];

  function renderJoin(ex) {
    var isNeighbor = ex.kind === 'neighbor';
    if (isNeighbor) {
      activityMain.appendChild(el('div', 'arrow-badge ' + ex.mode, ex.mode === 'anterior' ? '◀' : '▶'));
    }

    var area = el('div', 'join-area' + (isNeighbor ? ' is-nums' : ''));
    var items = [];

    // Mismo tamaño de emoji en todos los grupos: así el niño cuenta y no se guía por el tamaño
    var groupSize = isNeighbor ? 0 : Math.min.apply(null, ex.right.map(function (d) {
      return fitEmojiSize(d.value, 90, 18.5, 0.6);
    }));

    function addItem(side, data, row) {
      var item = el('div', 'join-item ' + side);
      item.dataset.side = side;
      item.dataset.key = data.key;
      item.style.gridRow = String(row + 1);
      if (side === 'right' && !isNeighbor) {
        item.classList.add('join-group');
        for (var i = 0; i < data.value; i++) item.appendChild(makeEmojiItem(ex.emoji, groupSize, false));
      } else {
        item.classList.add('join-num');
        item.appendChild(el('span', 'join-num-text', String(data.value)));
      }
      item.appendChild(el('span', 'join-dot'));
      area.appendChild(item);
      items.push(item);
    }

    ex.left.forEach(function (d, i) { addItem('left', d, i); });
    ex.right.forEach(function (d, i) { addItem('right', d, i); });

    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'join-lines');
    area.appendChild(svg);
    activityMain.appendChild(area);

    setupJoin(svg, items, ex.left.length);
  }

  function setupJoin(svg, items, total) {
    var matched = 0, pairIdx = 0, selected = null;

    function svgPoint(x, y) {
      var r = svg.getBoundingClientRect();
      return { x: x - r.left, y: y - r.top };
    }
    function dotPoint(item) {
      var d = item.querySelector('.join-dot').getBoundingClientRect();
      return svgPoint((d.left + d.right) / 2, (d.top + d.bottom) / 2);
    }
    function makeLine() {
      var ln = document.createElementNS(SVG_NS, 'line');
      ln.setAttribute('class', 'join-line');
      svg.appendChild(ln);
      return ln;
    }
    function setLine(ln, a, b) {
      ln.setAttribute('x1', a.x); ln.setAttribute('y1', a.y);
      ln.setAttribute('x2', b.x); ln.setAttribute('y2', b.y);
    }
    function candidates(item) {
      return items.filter(function (o) {
        return o.dataset.side !== item.dataset.side && !o.classList.contains('is-matched');
      });
    }
    function clearSelection() {
      if (selected) selected.classList.remove('is-selected');
      selected = null;
    }

    function attempt(a, b) {
      if (a.dataset.key !== b.dataset.key) {
        shake(a); shake(b);
        showRetry();
        return;
      }
      var color = PAIR_COLORS[pairIdx++ % PAIR_COLORS.length];
      var left = a.dataset.side === 'left' ? a : b;
      var right = left === a ? b : a;
      [a, b].forEach(function (n) {
        n.classList.add('is-matched');
        n.style.setProperty('--pair', color);
      });
      var ln = makeLine();
      ln.classList.add('is-matched');
      ln.style.stroke = color;
      setLine(ln, dotPoint(left), dotPoint(right));
      matched++;
      if (matched === total) succeed();
    }

    function handleTap(item) {
      if (!selected) {
        selected = item;
        item.classList.add('is-selected');
      } else if (selected === item) {
        clearSelection();
      } else if (selected.dataset.side === item.dataset.side) {
        clearSelection();
        selected = item;
        item.classList.add('is-selected');
      } else {
        var first = selected;
        clearSelection();
        attempt(first, item);
      }
    }

    items.forEach(function (item) {
      item.style.touchAction = 'none';
      item.addEventListener('pointerdown', function (ev) {
        if (state.locked || item.classList.contains('is-matched')) return;
        if (ev.pointerType === 'mouse' && ev.button !== 0) return;
        ev.preventDefault();
        try { item.setPointerCapture(ev.pointerId); } catch (err) { /* ignorar */ }
        var p0 = dotPoint(item), sx = ev.clientX, sy = ev.clientY;
        var moved = false, hover = null, ln = null;

        function onMove(e) {
          if (!moved && Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 8) {
            moved = true;
            ln = makeLine();
            ln.classList.add('is-drawing');
            clearSelection();
          }
          if (!moved) return;
          setLine(ln, p0, svgPoint(e.clientX, e.clientY));
          var t = findTarget(e.clientX, e.clientY, candidates(item));
          if (hover !== t) {
            if (hover) hover.classList.remove('is-hover');
            hover = t;
            if (hover) hover.classList.add('is-hover');
          }
        }

        function onUp(e) {
          item.removeEventListener('pointermove', onMove);
          item.removeEventListener('pointerup', onUp);
          item.removeEventListener('pointercancel', onUp);
          try { item.releasePointerCapture(ev.pointerId); } catch (err) { /* ignorar */ }
          if (hover) hover.classList.remove('is-hover');
          if (ln) ln.remove();
          if (!moved) { handleTap(item); return; }
          var target = e.type === 'pointercancel' ? null : findTarget(e.clientX, e.clientY, candidates(item));
          if (target) attempt(item, target);
        }

        item.addEventListener('pointermove', onMove);
        item.addEventListener('pointerup', onUp);
        item.addEventListener('pointercancel', onUp);
      });
    });
  }

  function buildOptionsGrid(options, correctAnswer) {
    var grid = el('div', 'options-grid');
    options.forEach(function (opt) {
      var btn = el('button', 'option-btn', String(opt));
      btn.type = 'button';
      btn.addEventListener('click', function () { onAnswer(opt, correctAnswer, btn, grid.children); });
      grid.appendChild(btn);
    });
    return grid;
  }

  function onAnswer(selected, correct, chosenEl, siblingEls) {
    // Ya resuelto (correcto) o ya marcado como intento fallido: ignorar clics repetidos
    if (state.locked || chosenEl.classList.contains('is-wrong') || chosenEl.classList.contains('is-correct')) return;

    var isCorrect = selected === correct;

    if (!isCorrect) {
      // Respuesta incorrecta: se marca esa opción, pero NO se avanza.
      // El resto de las opciones sigue habilitado para volver a intentar.
      chosenEl.classList.add('is-wrong');
      if (chosenEl.tagName === 'BUTTON') chosenEl.disabled = true;
      else chosenEl.classList.add('is-disabled');

      state.attemptFailed = true;
      feedbackBanner.textContent = pickRetry();
      feedbackBanner.classList.remove('is-visible');
      // reinicia la animación del banner
      void feedbackBanner.offsetWidth;
      feedbackBanner.classList.add('is-visible', 'is-retry');
      return;
    }

    // Respuesta correcta: recién ahora se bloquea y se avanza
    state.locked = true;

    for (var i = 0; i < siblingEls.length; i++) {
      var node = siblingEls[i];
      var val = node.dataset && node.dataset.value !== undefined ? node.dataset.value * 1 : (node.textContent * 1);
      if (node.tagName === 'BUTTON') node.disabled = true;
      node.classList.add('is-disabled');
      if (val === correct) node.classList.add('is-correct');
    }

    succeed();
  }

  function onSequenceTile(value, tileEl, ex) {
    if (state.locked || tileEl.classList.contains('is-placed')) return;

    var expected = ex.sorted[ex.placedCount];

    if (value !== expected) {
      // Número fuera de orden: no se acepta, se puede volver a intentar.
      state.attemptFailed = true;
      tileEl.classList.add('is-wrong');
      setTimeout(function () { tileEl.classList.remove('is-wrong'); }, 500);

      feedbackBanner.textContent = pickRetry();
      feedbackBanner.classList.remove('is-visible');
      void feedbackBanner.offsetWidth;
      feedbackBanner.classList.add('is-visible', 'is-retry');
      return;
    }

    // Número correcto: se coloca en el siguiente casillero
    tileEl.classList.add('is-placed');
    tileEl.disabled = true;
    var slot = ex.slotEls[ex.placedCount];
    slot.textContent = String(value);
    slot.classList.add('is-filled');
    ex.placedCount++;

    if (ex.placedCount === ex.sorted.length) succeed();
  }

  function pickPraise() {
    var msgs = ['¡Genial! ⭐', '¡Muy bien! 🎉', '¡Excelente! 🌟', '¡Perfecto! 👏', '¡Así se hace! 🚀'];
    return msgs[rand(0, msgs.length - 1)];
  }

  function pickRetry() {
    var msgs = ['¡Uy! Probá de nuevo 💪', '¡Casi! Intentá otra vez 🙂', '¡Esa no era! Seguí probando ✨'];
    return msgs[rand(0, msgs.length - 1)];
  }

  function pickEncouragement() {
    var msgs = ['¡Eso es! Lo lograste 🎉', '¡Muy bien, lo conseguiste! 🌟', '¡Ahí está! 👏'];
    return msgs[rand(0, msgs.length - 1)];
  }

  function advance() {
    state.exerciseIndex++;
    var currentCount = ACTIVITIES[state.activityIndex].count;
    if (state.exerciseIndex < currentCount) {
      loadExercise();
    } else if (state.activityIndex < ACTIVITIES.length - 1) {
      loadActivity(state.activityIndex + 1);
    } else {
      showFinal();
    }
  }

  /* ---------- Pantalla final ---------- */
  function showFinal() {
    var finalStars = document.getElementById('final-stars');
    var finalTitle = document.getElementById('final-title');
    var finalSubtitle = document.getElementById('final-subtitle');
    var finalMedal = document.getElementById('final-medal');
    var starsRow = document.getElementById('stars-row');

    finalStars.textContent = String(state.stars);
    starsRow.textContent = '⭐'.repeat(Math.max(state.stars, 0));
    starsRow.style.fontSize = state.stars > 40 ? '2.4vh' : '3.4vh';

    if (state.stars >= TOTAL_EXERCISES) {
      finalMedal.textContent = '🏆';
      finalTitle.textContent = '¡Perfecto! Sos un campeón de los números';
      finalSubtitle.innerHTML = 'Conseguiste <strong>' + state.stars + ' de ' + TOTAL_EXERCISES + '</strong> estrellas';
    } else if (state.stars >= Math.round(TOTAL_EXERCISES * 0.65)) {
      finalMedal.textContent = '🥈';
      finalTitle.textContent = '¡Muy bien hecho!';
      finalSubtitle.innerHTML = 'Conseguiste <strong>' + state.stars + ' de ' + TOTAL_EXERCISES + '</strong> estrellas';
    } else {
      finalMedal.textContent = '🥉';
      finalTitle.textContent = '¡Bien! Sigamos practicando';
      finalSubtitle.innerHTML = 'Conseguiste <strong>' + state.stars + ' de ' + TOTAL_EXERCISES + '</strong> estrellas';
    }

    launchConfetti();
    showScreen(screenFinal);
  }

  function launchConfetti() {
    var layer = document.getElementById('confetti-layer');
    layer.innerHTML = '';
    var colors = COLORS.map(function (c) { return COLOR_VAR[c]; });
    for (var i = 0; i < 40; i++) {
      var piece = el('span', 'confetti-piece');
      piece.style.left = rand(0, 100) + '%';
      piece.style.background = colors[rand(0, colors.length - 1)];
      piece.style.animationDuration = (2 + Math.random() * 1.8) + 's';
      piece.style.animationDelay = (Math.random() * 1.2) + 's';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      layer.appendChild(piece);
    }
  }

  /* ---------- Eventos ---------- */
  btnStart.addEventListener('click', startApp);
  btnRestart.addEventListener('click', function () {
    document.getElementById('confetti-layer').innerHTML = '';
    showScreen(screenIntro);
  });

})();
