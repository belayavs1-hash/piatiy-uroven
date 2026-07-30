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

// Q = \\\" in file = " in HTML at runtime
var Q='\\\\\\"';

// Build П.4 as HTML table — 2 rows, 4 cols each
// Each cell: letter header + operations in column + line + ?
// Table auto-distributes width evenly, no overflow

var cols = [
  ['а)', ['6 : 1,2', '&minus; 5', '&times; 0,97', '+ 3,15']],
  ['б)', ['9 : 1,5', '&minus; 5', '&times; 0,25', '+ 6']],
  ['в)', ['3 &times; 1,6', '&minus; 1,2', ': 12', '+ 1,2']],
  ['г)', ['0,6 &times; 6', '+ 1,2', ': 40', '&times; 50']],
  ['д)', ['30 &times; 0,3', '&minus; 4,8', '&times; 0,7', '&times; 0,01']],
  ['е)', ['2 &times; 1,9', '&minus; 2,2', ': 0,8', ': 0,1']],
  ['ж)', ['7 &minus; 0,7', ': 0,9', '&times; 0,02', '+ 0,66']],
  ['з)', ['1,5 &times; 6', ': 5', '&times; 2', '+ 2,4']]
];

function buildCell(letter, lines) {
  var lineHtml = lines.map(function(l, i){
    var fw = i===0 ? ';font-weight:700' : '';
    return '<div style='+Q+'text-align:right;font-size:13px;line-height:1.7'+fw+Q+'>'+l+'</div>';
  }).join('');
  return '<td style='+Q+'vertical-align:top;padding:2px 4px;width:25%'+Q+'>'
    + '<div style='+Q+'font-size:11px;font-weight:700;color:#6366f1;margin-bottom:1px'+Q+'>'+letter+'</div>'
    + lineHtml
    + '<div style='+Q+'border-top:1.5px solid #94a3b8;margin:2px 0 1px'+Q+'></div>'
    + '<div style='+Q+'text-align:right;font-size:13px;font-weight:700;color:#10b981'+Q+'>?</div>'
    + '</td>';
}

var tableStyle = Q+'width:100%;border-collapse:collapse;margin:6px 0'+Q;
var row1 = '<tr>'+cols.slice(0,4).map(function(c){ return buildCell(c[0],c[1]); }).join('')+'</tr>';
var row2 = '<tr>'+cols.slice(4,8).map(function(c){ return buildCell(c[0],c[1]); }).join('')+'</tr>';

var newText = 'Вычислите:<table style='+tableStyle+'>'
  + row1 + row2
  + '</table>'
  + "<span style='font-size:0;line-height:0;visibility:hidden'><br>а)<br>б)<br>в)<br>г)<br>д)<br>е)<br>ж)<br>з)</span>";

// Replace П.4 text by absolute position
var i4=h.indexOf('{id:"П.4"');
var i5=h.indexOf('{id:"П.5"',i4);
var p4=h.slice(i4,i5);
var ti=p4.indexOf('text:"');
var te=p4.indexOf('",type:',ti);
var oldText=p4.slice(ti+6,te);
console.log('oldText length:', oldText.length);

var absStart = i4 + ti + 6;
var absEnd   = i4 + te;
h = h.slice(0, absStart) + newText + h.slice(absEnd);
console.log('П.4 rebuilt as table');

// === Fix spacing: remove margin-bottom from .task-text ===
var old3='.task-text { font-size: 16px; font-weight: 700; color: var(--ink); line-height: 1.5; margin-bottom: 6px; }';
var new3='.task-text { font-size: 16px; font-weight: 700; color: var(--ink); line-height: 1.5; margin-bottom: 0; }';
if(h.indexOf(old3)>=0){
  h=h.replace(old3,new3);
  console.log('Fix: .task-text margin-bottom → 0');
} else {
  // Try with 12px (maybe previous fix didn't apply)
  var old3b='.task-text { font-size: 16px; font-weight: 700; color: var(--ink); line-height: 1.5; margin-bottom: 12px; }';
  if(h.indexOf(old3b)>=0){
    h=h.replace(old3b,new3);
    console.log('Fix: .task-text margin-bottom 12px → 0');
  } else {
    console.error('task-text CSS not found, trying regex approach');
    h=h.replace(/\.task-text \{[^}]*margin-bottom:[^;]+;/, function(m){
      return m.replace(/margin-bottom:[^;]+;/, 'margin-bottom:0;');
    });
    console.log('task-text margin-bottom zeroed via regex');
  }
}

// === Fix card padding: even smaller ===
var old4='col.innerHTML = `<div class="white-card" style="padding:12px 16px 16px">';
var new4='col.innerHTML = `<div class="white-card" style="padding:10px 14px 12px">';
if(h.indexOf(old4)>=0){
  h=h.replace(old4,new4);
  console.log('Fix: card padding further reduced');
} else {
  console.error('card padding template not found');
}

if(!checkJS('fix_p4_table')){process.exit(1);}
fs.writeFileSync('index.html',h);
console.log('SAVED');
