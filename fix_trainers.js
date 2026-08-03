'use strict';
var fs = require('fs');
var h = fs.readFileSync('index.html', 'utf8');
var orig = h.length;

// ══════════════════════════════════════════════════════════════════
// 1. Новые case в genOne: decmul2 (×дес.), decdiv2 (÷дес.), fracprop (осн.св.), angles (углы)
// ══════════════════════════════════════════════════════════════════
var defaultCase = h.indexOf("    default: { const x=rnd(1,100),y=rnd(1,100); q=`${x} + ${y} = ?`; a=String(x+y); }");
if (defaultCase < 0) {
  console.log('ERROR: default case не найден');
  process.exit(1);
}

var newCases = `
    case 'decmul2': {
      // Умножение десятичной дроби на десятичную
      const variants = [
        () => { const a=rnd(1,9),b=rnd(1,9); return {q:\`0.\${a} × 0.\${b} = ?\`,a:String(+(0.1*a*(0.1*b)).toFixed(2))}; },
        () => { const a=rnd(1,9),b=rnd(11,19); return {q:\`0.\${a} × \${b} = ?\`,a:String(+(0.1*a*b).toFixed(1))}; },
        () => { const a=rnd(11,39),b=rnd(2,9); return {q:\`\${(a/10).toFixed(1)} × \${b} = ?\`,a:String(+(a/10*b).toFixed(1))}; }
      ];
      const v = variants[rnd(0,2)](); q=v.q; a=v.a; break;
    }
    case 'decdiv2': {
      // Деление на десятичную дробь (умножаем оба на 10/100)
      const variants2 = [
        () => { const d=rnd(2,9),n=rnd(1,9)*d; return {q:\`\${n} ÷ 0.\${d} = ?\`,a:String(Math.round(n/(d/10)))}; },
        () => { const d=rnd(2,9),k=rnd(2,8); return {q:\`\${(d*k/10).toFixed(1)} ÷ 0.\${d} = ?\`,a:String(k)}; },
        () => { const a=rnd(2,9),b=rnd(2,9); return {q:\`\${(a*b/10).toFixed(1)} ÷ \${(b/10).toFixed(1)} = ?\`,a:String(a)}; }
      ];
      const v2 = variants2[rnd(0,2)](); q=v2.q; a=v2.a; break;
    }
    case 'fracprop': {
      // Основное свойство дроби: умножение/деление числителя и знаменателя
      const tp=rnd(1,3);
      if(tp===1){
        // Найти эквивалентную дробь
        const num=rnd(1,6),den=rnd(num+1,10),k=rnd(2,5);
        q=\`\${num}/\${den} = ?/\${den*k}\`; a=String(num*k);
      } else if(tp===2){
        // Сократить дробь
        const k=rnd(2,6),num=rnd(1,5)*k,den=rnd(num/k+1,8)*k;
        q=\`Сократи: \${num}/\${den} = ?\`; a=\`\${num/k}/\${den/k}\`;
      } else {
        // Нахождение части от числа
        const num=rnd(1,5),den=rnd(num+1,8),whole=den*rnd(2,6);
        q=\`\${num}/\${den} от \${whole} = ?\`; a=String(whole/den*num);
      }
      break;
    }
    case 'angles': {
      // Виды углов и транспортир
      const tp=rnd(1,4);
      if(tp===1){
        const degs=[30,45,60,90,120,150,180];
        const d=degs[rnd(0,degs.length-1)];
        const type=d<90?'острый':d===90?'прямой':d<180?'тупой':'развёрнутый';
        q=\`Угол \${d}° — какой это угол?\`;
        a=type; choices=[type,...['острый','прямой','тупой','развёрнутый'].filter(x=>x!==type).slice(0,2)];
        choices=arrShuffle(choices);
      } else if(tp===2){
        const a1=rnd(20,80),a2=rnd(20,80);
        q=\`Сумма углов \${a1}° и \${a2}° = ?\`; a=String(a1+a2);
      } else if(tp===3){
        const whole=rnd(100,170),part=rnd(20,whole-20);
        q=\`От \${whole}° отложили \${part}°. Остаток = ?\`; a=String(whole-part);
      } else {
        q=\`Смежные углы в сумме дают ?\`; a='180'; choices=['90','180','360','270']; choices=arrShuffle(choices);
      }
      break;
    }
`;

h = h.slice(0, defaultCase) + newCases + h.slice(defaultCase);
console.log('✅ genOne: 4 новых case добавлены (decmul2, decdiv2, fracprop, angles)');

// ══════════════════════════════════════════════════════════════════
// 2. Добавить 4 новых тренажёра в TRAINERS_DEF
// ══════════════════════════════════════════════════════════════════
var lastTrainer = h.indexOf('{id:"dice"');
var lastTrainerEnd = h.indexOf('}', lastTrainer) + 1;
var newTrainerDefs = `,
  {id:"decmul2", icon:"🔸", name:"Десятичные: × ÷ ★",  desc:"Умножение и деление дробей",     shell:"archer"},
  {id:"decdiv2", icon:"🔹", name:"Деление на дес. дробь", desc:"Переносим запятую в делителе", shell:"archer"},
  {id:"fracprop",icon:"🔑", name:"Свойство дроби",       desc:"Сокращение, эквивалентность",   shell:"umnik"},
  {id:"angles",  icon:"📐", name:"Углы",                  desc:"Виды, сложение, вычитание",     shell:"umnik"}`;

h = h.slice(0, lastTrainerEnd) + newTrainerDefs + h.slice(lastTrainerEnd);
console.log('✅ TRAINERS_DEF: 4 тренажёра добавлены');

// ══════════════════════════════════════════════════════════════════
// 3. Исправить TOPIC_TRAINER_MAP — 4 темы без маппинга + 2 слабых
// ══════════════════════════════════════════════════════════════════
var ttmEnd = h.indexOf('\n};', h.indexOf('const TOPIC_TRAINER_MAP'));
// Вставить перед закрывающей скобкой
var addMappings = `
  // Новые тренажёры
  "Основное свойство дроби": "fracprop",
  "Умножение на десятичную дробь": "decmul2",
  "Деление на десятичную дробь": "decdiv2",
  "Виды углов. Чертёжный треугольник": "angles",
  // Исправленные маппинги
  "Шкалы и координатная прямая": "add",
  "Сравнение натуральных чисел": "cmp"`;

// Найти последний маппинг перед }; и вставить после него
var kalcPos = h.indexOf('"Калькулятор": "chain"');
var kalcEnd = h.indexOf('\n', kalcPos) + 1;
h = h.slice(0, kalcEnd) + addMappings + '\n' + h.slice(kalcEnd);
console.log('✅ TOPIC_TRAINER_MAP: 6 маппингов добавлены/исправлены');

// ══════════════════════════════════════════════════════════════════
// 4. Автостарт — topicTrain сразу открывает экран старта тренажёра
// ══════════════════════════════════════════════════════════════════
var topicTrainFn = h.indexOf('function topicTrain(id)');
var topicTrainEnd = h.indexOf('\n}', topicTrainFn) + 2;
var oldTopicTrain = h.slice(topicTrainFn, topicTrainEnd);

var newTopicTrain = `function topicTrain(id) {
  if (!ST.mapProgress) ST.mapProgress = {};
  if ((ST.mapProgress[id] || 0) < 3) { ST.mapProgress[id] = 3; lsSave(); }
  // Найти название темы по id
  var ruleKey = '';
  for (var b = 0; b < TOPICS_MAP.length; b++) {
    var t = TOPICS_MAP[b].topics.find(function(t){ return t.id === id; });
    if (t) { ruleKey = t.name; break; }
  }
  var trainerId = TOPIC_TRAINER_MAP[ruleKey] || 'add';
  // Сохраняем откуда пришли — чтобы кнопка «К теме» знала куда вернуться
  _trainerFromTopic = id;
  showScreen('screen-trainers');
  // Автостарт: сразу открываем экран выбора тренажёра (не список)
  startTrainer(trainerId);
}
`;

h = h.slice(0, topicTrainFn) + newTopicTrain + h.slice(topicTrainEnd);
console.log('✅ topicTrain: автостарт добавлен');

// ══════════════════════════════════════════════════════════════════
// 5. Переменная _trainerFromTopic + кнопка «← К теме» в tr-done-view
// ══════════════════════════════════════════════════════════════════
// Добавить переменную рядом с currentTopicTrainerId
var ctVar = h.indexOf('var currentTopicTrainerId = null;');
h = h.slice(0, ctVar) + 'var currentTopicTrainerId = null;\nvar _trainerFromTopic = null;\n' + h.slice(ctVar);

// Добавить кнопку в финиш тренажёра — после кнопки "К тренажёрам"
var toTrainersBtn = h.indexOf('<button class="tg-finish-btn sec" onclick="showTrainerList()">⚡ К тренажёрам</button>');
if (toTrainersBtn >= 0) {
  var backToTopicBtn = `\n        <button class="tg-finish-btn sec" id="tr-btn-to-topic" onclick="trBackToTopic()" style="display:none">🗺 К теме</button>`;
  h = h.slice(0, toTrainersBtn) + h.slice(toTrainersBtn, toTrainersBtn + '<button class="tg-finish-btn sec" onclick="showTrainerList()">⚡ К тренажёрам</button>'.length) + backToTopicBtn + h.slice(toTrainersBtn + '<button class="tg-finish-btn sec" onclick="showTrainerList()">⚡ К тренажёрам</button>'.length);
  console.log('✅ кнопка «К теме» добавлена в tr-done-view');
}

// ══════════════════════════════════════════════════════════════════
// 6. JS: функция trBackToTopic + показывать кнопку при наличии _trainerFromTopic
// ══════════════════════════════════════════════════════════════════
// Найти функцию trainersBack или showTrainerDone
var trDone = h.indexOf('function repeatErrors()');
var backFn = `
function trBackToTopic() {
  var tid = _trainerFromTopic;
  _trainerFromTopic = null;
  showScreen('screen-map');
  if (tid) {
    // Прокрутить к теме
    setTimeout(function(){
      var el = document.querySelector('[data-id="' + tid + '"]');
      if (el) el.scrollIntoView({behavior:'smooth', block:'center'});
    }, 300);
  }
}
`;
h = h.slice(0, trDone) + backFn + h.slice(trDone);

// Показывать кнопку «К теме» в финише если пришли с карты тем
// Найти функцию финиша тренажёра — tgFinish или trFinish
var trFinish = h.indexOf('function tgFinish(');
if (trFinish < 0) trFinish = h.indexOf('function trFinish(');
if (trFinish >= 0) {
  var finEnd = h.indexOf('\n}', trFinish) + 2;
  var finFn = h.slice(trFinish, finEnd);
  // Добавить в конец функции показ/скрытие кнопки
  var showBtnCode = `
  // Показать кнопку «К теме» если пришли с карты тем
  var toTopicBtn = document.getElementById('tr-btn-to-topic');
  if (toTopicBtn) toTopicBtn.style.display = _trainerFromTopic ? 'block' : 'none';
`;
  // Вставить перед последней } функции
  var lastBrace = finFn.lastIndexOf('\n}');
  finFn = finFn.slice(0, lastBrace) + showBtnCode + finFn.slice(lastBrace);
  h = h.slice(0, trFinish) + finFn + h.slice(finEnd);
  console.log('✅ tgFinish: кнопка «К теме» показывается при наличии _trainerFromTopic');
} else {
  // Альтернатива: найти tr-done-view показ
  var trDoneShow = h.indexOf("'tr-done-view').style.display = 'block'");
  if (trDoneShow >= 0) {
    var lineEnd = h.indexOf('\n', trDoneShow) + 1;
    h = h.slice(0, lineEnd)
      + "  var _ttBtn = document.getElementById('tr-btn-to-topic'); if(_ttBtn) _ttBtn.style.display = _trainerFromTopic ? 'block' : 'none';\n"
      + h.slice(lineEnd);
    console.log('✅ tr-done-view: кнопка показывается через display');
  }
}

// ══════════════════════════════════════════════════════════════════
// Сохранить
// ══════════════════════════════════════════════════════════════════
fs.writeFileSync('index.html', h);
console.log('\nSAVED:', orig, '->', h.length, '(+' + (h.length-orig) + ')');
var jsS = h.indexOf('<script>'), jsE = h.lastIndexOf('</script>');
try { new Function(h.slice(jsS+8, jsE)); console.log('JS syntax: OK'); }
catch(e) { console.log('JS ERROR:', e.message); }
