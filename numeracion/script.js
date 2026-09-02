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

  /* ==========================================================
     GENERACIÓN DE EJERCICIOS — 3 actividades x 10 ejercicios
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
  var ACTIVITIES = [
    { key: 'count', icon: '🔢', name: 'Contar colecciones', build: buildActivity1, count: 10 },
    { key: 'neighbor', icon: '↔️', name: 'Anterior y posterior', build: buildActivity2, count: 10 },
    { key: 'between', icon: '🧩', name: 'Número en el medio', build: buildActivity4, count: 10 },
    { key: 'match', icon: '🔗', name: 'Número y cantidad', build: buildActivity3, count: 10 },
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

    state.stars++;
    starsCount.textContent = String(state.stars);
    feedbackBanner.classList.remove('is-retry');
    feedbackBanner.textContent = state.attemptFailed ? pickEncouragement() : pickPraise();
    feedbackBanner.classList.add('is-visible');

    setTimeout(advance, 1300);
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

    if (ex.placedCount === ex.sorted.length) {
      state.locked = true;
      state.stars++;
      starsCount.textContent = String(state.stars);
      feedbackBanner.classList.remove('is-retry');
      feedbackBanner.textContent = state.attemptFailed ? pickEncouragement() : pickPraise();
      feedbackBanner.classList.add('is-visible');
      setTimeout(advance, 1300);
    }
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
