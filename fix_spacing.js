'use strict';
var fs=require('fs'),vm=require('vm');
var h=fs.readFileSync('index.html','utf8');

function checkJS(label){
  var s=h.indexOf('<script>');var e=h.indexOf('<\/script>',s);
  var code=h.slice(s+8,e);
  try{new vm.Script(code);console.log(label+': JS OK');return true;}
  catch(err){
    var m=err.message.match(/\((\d+):(\d+)\)/);
    if(m){var ln=parseInt(m[1])-1;var lines=code.split('\n');
      console.error(label+' ERR line '+m[1]+':',JSON.stringify((lines[ln]||'').slice(0,200)));}
    else console.error(label+' ERR:',err.message.slice(0,100));
    return false;
  }
}

var count=0;

// === 1. Fix autoParseTaskParts: add з to letter ranges ===
// hasAlpha check
var old1='/<br>[абвгдеж]\\)/u.test(text)';
var new1='/<br>[абвгдежз]\\)/u.test(text)';
if(h.indexOf(old1)>=0){
  h=h.replace(old1,new1);
  count++;
  console.log('Fix 1: hasAlpha regex — added з');
} else {
  console.error('Fix 1 NOT FOUND: hasAlpha');
}

// matchAll for letter parts
var old2='/([абвгдеж])\\)/gu)';
var new2='/([абвгдежз])\\)/gu)';
if(h.indexOf(old2)>=0){
  h=h.replace(old2,new2);
  count++;
  console.log('Fix 2: matchAll regex — added з');
} else {
  console.error('Fix 2 NOT FOUND: matchAll');
}

// === 2. Fix task-text margin-bottom: 12px → 6px ===
var old3='.task-text { font-size: 16px; font-weight: 700; color: var(--ink); line-height: 1.5; margin-bottom: 12px; }';
var new3='.task-text { font-size: 16px; font-weight: 700; color: var(--ink); line-height: 1.5; margin-bottom: 6px; }';
if(h.indexOf(old3)>=0){
  h=h.replace(old3,new3);
  count++;
  console.log('Fix 3: .task-text margin-bottom 12px→6px');
} else {
  console.error('Fix 3 NOT FOUND: task-text CSS');
}

// === 3. Fix task card padding: 16px 20px 20px → 12px 16px 16px ===
var old4='col.innerHTML = `<div class="white-card" style="padding:16px 20px 20px">';
var new4='col.innerHTML = `<div class="white-card" style="padding:12px 16px 16px">';
if(h.indexOf(old4)>=0){
  h=h.replace(old4,new4);
  count++;
  console.log('Fix 4: task card padding reduced');
} else {
  console.error('Fix 4 NOT FOUND: task card padding');
}

// === 4. Fix topic margin in task card: margin-bottom:12px → margin-bottom:6px ===
var old5='style="font-size:12px;color:#6366f1;font-weight:700;margin-bottom:12px">${task.topic}</div>';
var new5='style="font-size:12px;color:#6366f1;font-weight:700;margin-bottom:6px">${task.topic}</div>';
if(h.indexOf(old5)>=0){
  h=h.replace(old5,new5);
  count++;
  console.log('Fix 5: topic margin-bottom 12px→6px');
} else {
  console.error('Fix 5 NOT FOUND: topic margin');
}

// === 5. Fix P.4 columns min-width: reduce so they fit on phone ===
// Current П.4 uses min-width:95px — reduce to 70px
// Also reduce padding in columns
var old6='display:inline-flex;flex-direction:column;padding:6px 10px;background:rgba(255,255,255,0.05);border-radius:8px;min-width:95px';
var new6='display:inline-flex;flex-direction:column;padding:4px 8px;background:rgba(255,255,255,0.05);border-radius:8px;min-width:72px';
if(h.indexOf(old6)>=0){
  h=h.replace(old6,new6);
  count++;
  console.log('Fix 6: П.4 column min-width 95→72, padding reduced');
} else {
  // Maybe different style - try to find any column style in P.4 area
  var i4=h.indexOf('{id:"П.4"');
  var i5=h.indexOf('{id:"П.5"',i4);
  var p4chunk=h.slice(i4,i5);
  var mwIdx=p4chunk.indexOf('min-width');
  if(mwIdx>=0) console.log('Found min-width in P.4:', p4chunk.slice(mwIdx-20,mwIdx+60));
  else console.error('Fix 6 NOT FOUND: П.4 column min-width');
}

console.log('\nTotal fixes applied:', count);

if(!checkJS('fix_spacing')){process.exit(1);}
fs.writeFileSync('index.html',h);
console.log('SAVED');
