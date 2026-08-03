'use strict';
var fs = require('fs');
var h = fs.readFileSync('index.html', 'utf8');

// ── Новый контент для трёх пустых карточек ───────────────────────────
var newBlock = `
  // ── 8. История проверочных работ ────────────────────────────────────
  var scResults = (ST.selfCheckResults || []).slice().reverse();
  var hwHtml;
  if (scResults.length === 0) {
    hwHtml = '<div style="text-align:center;padding:20px 0">'
      + '<div style="font-size:32px;margin-bottom:8px">📝</div>'
      + '<div style="font-size:13px;color:#64748b">Проверочные работы появятся здесь после их прохождения.</div>'
      + '</div>';
  } else {
    hwHtml = '<div style="display:flex;flex-direction:column;gap:8px">'
      + scResults.slice(0, 10).map(function(r) {
          var pct = r.pct || (r.total > 0 ? Math.round(r.score / r.total * 100) : 0);
          var color = pct >= 80 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626';
          var icon = pct >= 80 ? '🟢' : pct >= 50 ? '🟡' : '🔴';
          return '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;'
            + 'background:rgba(99,102,241,.06);border-radius:8px;gap:8px">'
            + '<div style="flex:1;min-width:0">'
            + '<div style="font-size:13px;font-weight:700;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'
            + (r.title || r.para || '') + '</div>'
            + '<div style="font-size:11px;color:#94a3b8;margin-top:1px">' + (r.date || '') + '</div>'
            + '</div>'
            + '<div style="text-align:right;white-space:nowrap">'
            + '<div style="font-size:14px;font-weight:900;color:' + color + '">' + icon + ' ' + pct + '%</div>'
            + '<div style="font-size:11px;color:#94a3b8">' + (r.score || 0) + '/' + (r.total || 0) + '</div>'
            + '</div></div>';
        }).join('')
      + '</div>';
  }
  document.getElementById('par-hw-card').innerHTML =
    '<div class="par-card"><div class="par-card-title">📝 Проверочные работы</div>' + hwHtml + '</div>';

  // ── 9. Подробная статистика ───────────────────────────────────────────
  var allTrainer = ST.trainerHistory || [];
  var allTotal   = allTrainer.reduce(function(s,h){ return s+(h.total||0); }, 0);
  var allCorrect = allTrainer.reduce(function(s,h){ return s+(h.correct||0); }, 0);
  var allPct     = allTotal > 0 ? Math.round(allCorrect/allTotal*100) : 0;
  var hintsUsed  = ST.hintsUsed || 0;
  var allSolvedN = Object.keys(ST.solvedTasks||{}).length;
  var selfSolved = ST.selfSolved || 0;
  var selfPct    = allSolvedN > 0 ? Math.round(selfSolved/allSolvedN*100) : 0;

  var statHtml = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">'
    + '<div style="background:rgba(16,185,129,.08);border-radius:10px;padding:12px;text-align:center">'
    + '<div style="font-size:26px;font-weight:900;color:#10b981">' + allTotal + '</div>'
    + '<div style="font-size:11px;color:#64748b;margin-top:2px">Вопросов в тренажёрах</div></div>'
    + '<div style="background:rgba(99,102,241,.08);border-radius:10px;padding:12px;text-align:center">'
    + '<div style="font-size:26px;font-weight:900;color:#6366f1">' + allPct + '%</div>'
    + '<div style="font-size:11px;color:#64748b;margin-top:2px">Правильных ответов</div></div>'
    + '<div style="background:rgba(245,158,11,.08);border-radius:10px;padding:12px;text-align:center">'
    + '<div style="font-size:26px;font-weight:900;color:#f59e0b">' + hintsUsed + '</div>'
    + '<div style="font-size:11px;color:#64748b;margin-top:2px">Подсказок взял</div></div>'
    + '<div style="background:rgba(239,68,68,.08);border-radius:10px;padding:12px;text-align:center">'
    + '<div style="font-size:26px;font-weight:900;color:#ef4444">' + selfPct + '%</div>'
    + '<div style="font-size:11px;color:#64748b;margin-top:2px">Решил сам (без помощи)</div></div>'
    + '</div>';

  var scTotal = scResults.length;
  var scGood  = scResults.filter(function(r){ return (r.pct||0) >= 80; }).length;
  if (scTotal > 0) {
    statHtml += '<div style="padding:10px;background:rgba(99,102,241,.06);border-radius:8px">'
      + '<div style="font-size:12px;color:#64748b;margin-bottom:6px">Проверочных работ: <b>' + scTotal
      + '</b> · Отлично (≥80%): <b>' + scGood + '</b></div>'
      + '<div style="height:6px;background:rgba(99,102,241,.15);border-radius:3px">'
      + '<div style="height:100%;width:' + Math.round(scGood/scTotal*100) + '%;background:#6366f1;border-radius:3px"></div>'
      + '</div></div>';
  }

  document.getElementById('par-ach-card').innerHTML =
    '<div class="par-card"><div class="par-card-title">📊 Подробная статистика</div>' + statHtml + '</div>';

  // ── 10. Настройки ─────────────────────────────────────────────────────
  var curName = ST.studentName || (ST.user && ST.user.name) || 'Ученик';
  var curSettings = ST.parSettings || {};
  var curPin = curSettings.pin || '';

  var settingsHtml = '<div style="display:flex;flex-direction:column;gap:14px">'
    + '<div>'
    + '<div style="font-size:12px;font-weight:700;color:#64748b;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">Имя ребёнка</div>'
    + '<div style="display:flex;gap:8px;align-items:center">'
    + '<input id="par-child-name-inp" type="text" value="' + curName.replace(/"/g,'&quot;') + '"'
    + ' style="flex:1;padding:8px 12px;border:1.5px solid rgba(99,102,241,.3);border-radius:8px;background:rgba(99,102,241,.05);color:var(--ink);font-size:15px;outline:none"/>'
    + '<button onclick="parSaveChildName()" style="padding:8px 14px;border-radius:8px;border:none;background:#6366f1;color:#fff;font-weight:700;cursor:pointer;white-space:nowrap;min-height:auto">Сохранить</button>'
    + '</div></div>'
    + '<div>'
    + '<div style="font-size:12px;font-weight:700;color:#64748b;margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px">PIN-код кабинета</div>'
    + '<div style="font-size:12px;color:#94a3b8;margin-bottom:6px">4-значный код для входа в кабинет родителя</div>'
    + '<div style="display:flex;gap:8px;align-items:center">'
    + '<input id="par-pin-inp" type="number" placeholder="••••" max="9999" min="1000"'
    + ' value="' + curPin + '"'
    + ' style="width:100px;padding:8px 12px;border:1.5px solid rgba(99,102,241,.3);border-radius:8px;background:rgba(99,102,241,.05);color:var(--ink);font-size:15px;outline:none;text-align:center"/>'
    + '<button onclick="parSavePin()" style="padding:8px 14px;border-radius:8px;border:none;background:#6366f1;color:#fff;font-weight:700;cursor:pointer;min-height:auto">Сохранить</button>'
    + '</div></div>'
    + '<div>'
    + '<div style="font-size:12px;font-weight:700;color:#64748b;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">Данные</div>'
    + '<div style="display:flex;gap:8px;flex-wrap:wrap">'
    + '<button onclick="parExportData()" style="padding:8px 14px;border-radius:8px;border:1.5px solid rgba(99,102,241,.4);background:transparent;color:#6366f1;font-weight:700;cursor:pointer;font-size:13px;min-height:auto">📤 Сохранить отчёт</button>'
    + '<button onclick="parResetProgress()" style="padding:8px 14px;border-radius:8px;border:1.5px solid rgba(239,68,68,.4);background:transparent;color:#ef4444;font-weight:700;cursor:pointer;font-size:13px;min-height:auto">🗑 Сбросить прогресс</button>'
    + '</div></div>'
    + '<div id="par-settings-msg" style="font-size:13px;font-weight:700;color:#16a34a;display:none"></div>'
    + '</div>';

  document.getElementById('par-settings-card').innerHTML =
    '<div class="par-card"><div class="par-card-title">⚙️ Настройки</div>' + settingsHtml + '</div>';`;

// ── Найти и заменить три пустые карточки ─────────────────────────────
var hwPos = h.indexOf("document.getElementById('par-hw-card').innerHTML = '';");
if (hwPos < 0) {
  console.log('ERROR: par-hw-card не найдена');
  process.exit(1);
}
var commentPos = h.lastIndexOf('// карточки', hwPos);
var lineStart = commentPos >= 0 && commentPos > hwPos - 120 ? commentPos : h.lastIndexOf('\n', hwPos) + 1;
var settingsLine = h.indexOf("document.getElementById('par-settings-card').innerHTML = '';", hwPos);
var blockEnd = h.indexOf('\n', settingsLine) + 1;
console.log('Блок с', lineStart, 'по', blockEnd);
h = h.slice(0, lineStart) + newBlock + '\n' + h.slice(blockEnd);
console.log('✅ Три карточки заполнены');

// ── Добавить вспомогательные функции ─────────────────────────────────
if (h.indexOf('function parSaveChildName') < 0) {
  var parToggle = h.indexOf('\nfunction parToggleTopic(');
  var helpers = `
function parSaveChildName() {
  var inp = document.getElementById('par-child-name-inp');
  if (!inp) return;
  var val = inp.value.trim();
  if (!val) return;
  ST.studentName = val;
  if (ST.user) ST.user.name = val;
  lsSave();
  var msg = document.getElementById('par-settings-msg');
  if (msg) { msg.textContent = '✓ Имя обновлено'; msg.style.display='block'; setTimeout(function(){ msg.style.display='none'; }, 2500); }
}
function parSavePin() {
  var inp = document.getElementById('par-pin-inp');
  if (!inp) return;
  var val = ('' + inp.value).replace(/\D/g,'').slice(0,4);
  if (val.length !== 4) { alert('Введи 4-значный PIN'); return; }
  if (!ST.parSettings) ST.parSettings = {};
  ST.parSettings.pin = val;
  lsSave();
  var msg = document.getElementById('par-settings-msg');
  if (msg) { msg.textContent = '✓ PIN сохранён'; msg.style.display='block'; setTimeout(function(){ msg.style.display='none'; }, 2500); }
}
function parExportData() {
  var data = {
    name: ST.studentName || 'Ученик',
    date: new Date().toLocaleDateString('ru'),
    xp: ST.xp || 0,
    solved: Object.keys(ST.solvedTasks || {}).length,
    streak: ST.streak || 0,
    checkResults: ST.selfCheckResults || [],
    trainerHistory: (ST.trainerHistory || []).slice(0, 100)
  };
  var blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'progress_' + (ST.studentName || 'uchenk') + '_' + new Date().toLocaleDateString('ru').replace(/\./g,'-') + '.json';
  a.click();
  URL.revokeObjectURL(url);
}
function parResetProgress() {
  if (!confirm('Сбросить весь прогресс ребёнка? Это нельзя отменить.')) return;
  var pin = ST.parSettings && ST.parSettings.pin;
  var name = ST.studentName || 'Ученик';
  ST.xp = 0; ST.solvedTasks = {}; ST.topicProgress = {}; ST.mistakes = [];
  ST.achievements = []; ST.hintsUsed = 0; ST.selfSolved = 0;
  ST.trainerHistory = []; ST.ruleHistory = []; ST.selfCheckResults = [];
  ST.streak = 0; ST.history = [];
  ST.studentName = name;
  if (pin) { if (!ST.parSettings) ST.parSettings = {}; ST.parSettings.pin = pin; }
  lsSave();
  renderParent();
}
`;
  h = h.slice(0, parToggle) + helpers + h.slice(parToggle);
  console.log('✅ Функции parSaveChildName/parSavePin/parExportData/parResetProgress добавлены');
}

// ── Сохранить ─────────────────────────────────────────────────────────
fs.writeFileSync('index.html', h);
console.log('SAVED, size:', h.length);
var jsS = h.indexOf('<script>'), jsE = h.lastIndexOf('</script>');
try { new Function(h.slice(jsS+8, jsE)); console.log('JS syntax: OK'); }
catch(e) { console.log('JS ERROR:', e.message); }
