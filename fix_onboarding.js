'use strict';
var fs = require('fs');
var h = fs.readFileSync('index.html', 'utf8');
var orig = h.length;

// ══════════════════════════════════════════════════════════════════
// 1. HTML экрана онбординга — вставить перед screen-home
// ══════════════════════════════════════════════════════════════════
var homeScreenTag = '\n  <div id="screen-home"';
var homePos = h.indexOf(homeScreenTag);
if (homePos < 0) {
  homeScreenTag = '<div id="screen-home"';
  homePos = h.indexOf(homeScreenTag);
}
if (homePos < 0) { console.log('ERROR: screen-home не найден'); process.exit(1); }

var onboardHTML = `
  <!-- ══ ОНБОРДИНГ ══════════════════════════════════════════════ -->
  <div id="screen-onboarding" class="screen">
    <div class="ob-wrap">

      <!-- Шаги-индикаторы -->
      <div class="ob-dots">
        <div class="ob-dot active" id="ob-dot-0"></div>
        <div class="ob-dot" id="ob-dot-1"></div>
        <div class="ob-dot" id="ob-dot-2"></div>
        <div class="ob-dot" id="ob-dot-3"></div>
      </div>

      <!-- Слайды -->
      <div class="ob-slides" id="ob-slides">

        <!-- Слайд 0: Приветствие -->
        <div class="ob-slide">
          <div class="ob-umnik">
            <img src="umnik_prygaet.png" alt="Умник" onerror="this.outerHTML='<div style=\'font-size:80px\'>🤖</div>'">
          </div>
          <h1 class="ob-title">Привет, <span id="ob-name-hi">друг</span>!</h1>
          <p class="ob-text">Я Умник — твой личный помощник по математике 5 класса.<br>
          Буду подсказывать, объяснять и проверять решения.</p>
          <div class="ob-emoji-row">✏️ 📐 🔢 📏 🧮</div>
        </div>

        <!-- Слайд 1: Разделы приложения -->
        <div class="ob-slide">
          <div class="ob-icon-big">📚</div>
          <h2 class="ob-title">Здесь всё для учёбы</h2>
          <div class="ob-features">
            <div class="ob-feature">
              <span class="ob-feature-icon">⚡</span>
              <div>
                <b>Тренажёры</b>
                <span>Прокачай тему — задачи по уровням</span>
              </div>
            </div>
            <div class="ob-feature">
              <span class="ob-feature-icon">📖</span>
              <div>
                <b>Домашка</b>
                <span>Все задания из учебника Виленкина</span>
              </div>
            </div>
            <div class="ob-feature">
              <span class="ob-feature-icon">📋</span>
              <div>
                <b>Шпаргалки</b>
                <span>Правила и формулы под рукой</span>
              </div>
            </div>
            <div class="ob-feature">
              <span class="ob-feature-icon">✅</span>
              <div>
                <b>Проверочные</b>
                <span>Проверь себя по каждому параграфу</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Слайд 2: Умник и XP -->
        <div class="ob-slide">
          <div class="ob-icon-big">🏆</div>
          <h2 class="ob-title">Зарабатывай очки!</h2>
          <p class="ob-text">За каждую правильно решённую задачу получаешь <b>XP</b>.<br>
          Копи очки, открывай достижения и повышай уровень.</p>
          <div class="ob-xp-demo">
            <div class="ob-xp-item"><span style="font-size:28px">⭐</span><div>Новичок<br><small>0 XP</small></div></div>
            <div class="ob-arrow">→</div>
            <div class="ob-xp-item"><span style="font-size:28px">📚</span><div>Ученик<br><small>100 XP</small></div></div>
            <div class="ob-arrow">→</div>
            <div class="ob-xp-item"><span style="font-size:28px">🏆</span><div>Мастер<br><small>600 XP</small></div></div>
          </div>
          <p class="ob-hint">Умник никогда не даёт ответ сразу — только наводящие вопросы 😉</p>
        </div>

        <!-- Слайд 3: Поехали! -->
        <div class="ob-slide">
          <div class="ob-finish-umnik">
            <img src="umnik_prygaet.png" alt="Умник" onerror="this.outerHTML='<div style=\'font-size:90px\'>🚀</div>'">
          </div>
          <h2 class="ob-title">Ты готов!</h2>
          <p class="ob-text">Начни с тренажёра по первой теме или загляни в домашку.<br>
          Если застрянешь — зови меня, я всегда рядом!</p>
          <button class="ob-start-btn" onclick="finishOnboarding()">Поехали! 🚀</button>
        </div>

      </div><!-- /ob-slides -->

      <!-- Навигация -->
      <div class="ob-nav">
        <button class="ob-btn-skip" onclick="finishOnboarding()">Пропустить</button>
        <button class="ob-btn-next" id="ob-next-btn" onclick="obNext()">Далее →</button>
      </div>

    </div>
  </div>
  <!-- ══ / ОНБОРДИНГ ════════════════════════════════════════════ -->
`;

h = h.slice(0, homePos) + onboardHTML + h.slice(homePos);
console.log('✅ HTML онбординга добавлен');

// ══════════════════════════════════════════════════════════════════
// 2. CSS онбординга — перед </style>
// ══════════════════════════════════════════════════════════════════
var scriptStart = h.indexOf('<script>');
var styleEnd = h.lastIndexOf('</style>', scriptStart);

var obCSS = `
/* ════════════════════════════════════════════
   ОНБОРДИНГ
   ════════════════════════════════════════════ */
#screen-onboarding {
  background: linear-gradient(160deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
  display: flex; align-items: center; justify-content: center;
  min-height: 100vh; padding: 0;
  overflow: hidden;
}
.ob-wrap {
  width: 100%; max-width: 480px;
  display: flex; flex-direction: column;
  align-items: center;
  padding: 24px 20px 20px;
  min-height: 100vh;
  position: relative;
}
.ob-dots {
  display: flex; gap: 8px; margin-bottom: 28px; margin-top: 8px;
}
.ob-dot {
  width: 8px; height: 8px; border-radius: 4px;
  background: rgba(255,255,255,.25);
  transition: all .3s;
}
.ob-dot.active {
  width: 24px; background: #818cf8;
}
.ob-slides {
  width: 100%; flex: 1;
  overflow: hidden; position: relative;
}
.ob-slide {
  display: none;
  flex-direction: column; align-items: center;
  text-align: center; padding: 0 8px;
  animation: obFadeIn .35s ease;
}
.ob-slide.active { display: flex; }
@keyframes obFadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.ob-umnik img { width: 120px; height: 120px; object-fit: contain; margin-bottom: 16px; }
.ob-finish-umnik img { width: 130px; height: 130px; object-fit: contain; margin-bottom: 16px; }
.ob-icon-big { font-size: 72px; margin-bottom: 12px; line-height: 1; }
.ob-title {
  font-size: clamp(22px, 6vw, 28px);
  font-weight: 900; color: #fff;
  margin: 0 0 12px; line-height: 1.2;
}
.ob-text {
  font-size: 15px; color: rgba(255,255,255,.75);
  line-height: 1.6; margin: 0 0 16px;
}
.ob-emoji-row {
  font-size: 28px; letter-spacing: 8px; margin-top: 8px;
  animation: obFloat 3s ease-in-out infinite;
}
@keyframes obFloat {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}
.ob-features {
  display: flex; flex-direction: column; gap: 12px;
  width: 100%; margin-top: 8px; margin-bottom: 8px;
}
.ob-feature {
  display: flex; align-items: center; gap: 14px;
  background: rgba(255,255,255,.07);
  border-radius: 12px; padding: 12px 14px;
  text-align: left;
}
.ob-feature-icon { font-size: 24px; flex-shrink: 0; }
.ob-feature b { display: block; color: #fff; font-size: 14px; }
.ob-feature span { font-size: 12px; color: rgba(255,255,255,.55); }
.ob-xp-demo {
  display: flex; align-items: center; gap: 8px;
  flex-wrap: wrap; justify-content: center;
  margin: 12px 0;
}
.ob-xp-item {
  display: flex; flex-direction: column; align-items: center;
  gap: 4px; font-size: 12px; color: rgba(255,255,255,.7);
}
.ob-xp-item small { color: rgba(255,255,255,.45); }
.ob-arrow { font-size: 18px; color: rgba(255,255,255,.4); }
.ob-hint {
  font-size: 13px; color: rgba(255,255,255,.5);
  margin-top: 12px; font-style: italic;
}
.ob-start-btn {
  margin-top: 16px;
  padding: 16px 40px;
  border-radius: 16px; border: none;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff; font-size: 18px; font-weight: 900;
  cursor: pointer; box-shadow: 0 8px 32px rgba(99,102,241,.5);
  transition: transform .15s, box-shadow .15s;
}
.ob-start-btn:active { transform: scale(.96); box-shadow: 0 4px 16px rgba(99,102,241,.4); }
.ob-nav {
  display: flex; justify-content: space-between; align-items: center;
  width: 100%; padding-top: 20px; margin-top: auto;
}
.ob-btn-skip {
  background: transparent; border: none;
  color: rgba(255,255,255,.35); font-size: 14px;
  cursor: pointer; padding: 8px 4px;
}
.ob-btn-next {
  background: rgba(99,102,241,.2);
  border: 1.5px solid rgba(99,102,241,.5);
  color: #a5b4fc; font-size: 15px; font-weight: 700;
  border-radius: 10px; padding: 10px 22px;
  cursor: pointer; transition: background .2s;
}
.ob-btn-next:hover { background: rgba(99,102,241,.35); }
`;

h = h.slice(0, styleEnd) + obCSS + '\n' + h.slice(styleEnd);
console.log('✅ CSS онбординга добавлен');

// ══════════════════════════════════════════════════════════════════
// 3. JS функции онбординга
// ══════════════════════════════════════════════════════════════════
var obJsFns = `
// ── Онбординг ─────────────────────────────────────────────────────
var _obStep = 0;
var _obTotal = 4;

function showOnboarding(name) {
  _obStep = 0;
  var hi = document.getElementById('ob-name-hi');
  if (hi) hi.textContent = name || 'друг';
  obRender();
  showScreen('screen-onboarding');
}
function obRender() {
  var slides = document.querySelectorAll('.ob-slide');
  slides.forEach(function(s, i) { s.classList.toggle('active', i === _obStep); });
  var dots = document.querySelectorAll('.ob-dot');
  dots.forEach(function(d, i) { d.classList.toggle('active', i === _obStep); });
  var nextBtn = document.getElementById('ob-next-btn');
  if (nextBtn) nextBtn.style.display = (_obStep >= _obTotal - 1) ? 'none' : 'inline-block';
}
function obNext() {
  if (_obStep < _obTotal - 1) { _obStep++; obRender(); }
}
function finishOnboarding() {
  ST.onboardingDone = true;
  lsSave();
  renderHome();
  showScreen('screen-home');
}
`;

// Добавить перед doLogin
var doLoginPos = h.indexOf('\nfunction doLogin()');
h = h.slice(0, doLoginPos) + '\n' + obJsFns + h.slice(doLoginPos);
console.log('✅ JS онбординга добавлен');

// ══════════════════════════════════════════════════════════════════
// 4. В doLogin — для нового ученика показывать онбординг
// ══════════════════════════════════════════════════════════════════
var doLoginFn = h.indexOf('function doLogin()');
var renderHomeCall = h.indexOf('renderHome();\n    showScreen(\'screen-home\')', doLoginFn);
if (renderHomeCall < 0) renderHomeCall = h.indexOf("renderHome();\n    showScreen('screen-home')", doLoginFn);
if (renderHomeCall < 0) {
  // попробуем поиск с другим отступом
  var p = h.indexOf('renderHome()', doLoginFn);
  var p2 = h.indexOf("showScreen('screen-home')", p);
  if (p >= 0 && p2 >= 0 && p2 - p < 80) renderHomeCall = p;
}

if (renderHomeCall >= 0) {
  var before = h.slice(renderHomeCall - 5, renderHomeCall + 80);
  console.log('Найдено место:', before);
  // Заменить: вместо renderHome + showScreen-home → проверка онбординга
  var origCall = h.slice(renderHomeCall, renderHomeCall + 80);
  var newCall = origCall.replace(
    /renderHome\(\);\s*\n\s*showScreen\('screen-home'\)/,
    "if (!ST.onboardingDone) { showOnboarding(name); } else { renderHome(); showScreen('screen-home'); }"
  );
  if (newCall !== origCall) {
    h = h.slice(0, renderHomeCall) + newCall + h.slice(renderHomeCall + 80);
    console.log('✅ doLogin: онбординг для первого входа');
  } else {
    // Попробуем regex по всему doLogin блоку
    var doLoginEnd = h.indexOf('\n}function ', doLoginFn);
    if (doLoginEnd < 0) doLoginEnd = h.indexOf('\n}\n', doLoginFn + 100) + 3;
    var fnBlock = h.slice(doLoginFn, doLoginEnd);
    var newFnBlock = fnBlock.replace(
      /renderHome\(\);\s*\n\s*showScreen\(['"]screen-home['"]\)/,
      "if (!ST.onboardingDone) { showOnboarding(name); } else { renderHome(); showScreen('screen-home'); }"
    );
    if (newFnBlock !== fnBlock) {
      h = h.slice(0, doLoginFn) + newFnBlock + h.slice(doLoginEnd);
      console.log('✅ doLogin (regex): онбординг для первого входа');
    } else {
      console.log('WARN: не удалось найти renderHome в doLogin, патч вручную');
    }
  }
} else {
  console.log('WARN: renderHome call не найден в doLogin');
}

// ══════════════════════════════════════════════════════════════════
// 5. Добавить onboardingDone в freshST / дефолтный ST
// ══════════════════════════════════════════════════════════════════
var freshST = h.indexOf('onboardingDone');
if (freshST < 0) {
  // Добавить поле в freshST()
  var freshFn = h.indexOf('function freshST()');
  if (freshFn < 0) freshFn = h.indexOf('freshST =');
  if (freshFn >= 0) {
    // Найти history: [] или последнее поле
    var histField = h.indexOf("history: []", freshFn);
    if (histField >= 0 && histField < freshFn + 800) {
      h = h.slice(0, histField + 11) + ',\n  onboardingDone: false' + h.slice(histField + 11);
      console.log('✅ freshST: поле onboardingDone добавлено');
    }
  }
}

// ══════════════════════════════════════════════════════════════════
// Сохранить
// ══════════════════════════════════════════════════════════════════
fs.writeFileSync('index.html', h);
console.log('\nSAVED:', orig, '->', h.length, '(+' + (h.length - orig) + ')');
var jsS = h.indexOf('<script>'), jsE = h.lastIndexOf('</script>');
try { new Function(h.slice(jsS+8, jsE)); console.log('JS syntax: OK'); }
catch(e) { console.log('JS ERROR:', e.message); }
