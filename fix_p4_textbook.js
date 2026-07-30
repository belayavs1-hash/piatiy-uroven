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

var row1 = [
  ['а)', ['6 : 1,2', '&minus; 5', '&times; 0,97', '+ 3,15']],
  ['б)', ['9 : 1,5', '&minus; 5', '&times; 0,25', '+ 6']],
  ['в)', ['3 &times; 1,6', '&minus; 1,2', ': 12', '+ 1,2']],
  ['г)', ['0,6 &times; 6', '+ 1,2', ': 40', '&times; 50']]
];
var row2 = [
  ['д)', ['30 &times; 0,3', '&minus; 4,8', '&times; 0,7', '&times; 0,01']],
  ['е)', ['2 &times; 1,9', '&minus; 2,2', ': 0,8', ': 0,1']],
  ['ж)', ['7 &minus; 0,7', ': 0,9', '&times; 0,02', '+ 0,66']],
  ['з)', ['1,5 &times; 6', ': 5', '&times; 2', '+ 2,4']]
];

function buildCol(letter, lines) {
  var lineHtml = lines.map(function(l, i){
    var fw = i===0 ? ';font-weight:700' : '';
    return '<div style='+Q+'text-align:right;font-size:14px;line-height:1.6'+fw+Q+'>'+l+'</div>';
  }).join('');
  return '<div style='+Q+'display:inline-flex;flex-direction:column;min-width:80px;padding:6px 10px 4px'+Q+'>'
    + '<div style='+Q+'font-size:12px;font-weight:700;color:#6366f1;margin-bottom:2px'+Q+'>'+letter+'</div>'
    + lineHtml
    + '<div style='+Q+'border-top:1.5px solid #94a3b8;margin:3px 0 1px'+Q+'></div>'
    + '<div style='+Q+'text-align:right;font-size:14px;font-weight:700;color:#10b981'+Q+'>?</div>'
    + '</div>';
}

var rowStyle = Q+'display:flex;gap:4px;flex-wrap:nowrap;margin:4px 0'+Q;
var row1Html = '<div style='+rowStyle+'>'+row1.map(function(c){ return buildCol(c[0],c[1]); }).join('')+'</div>';
var row2Html = '<div style='+rowStyle+'>'+row2.map(function(c){ return buildCol(c[0],c[1]); }).join('')+'</div>';

var newText = 'Вычислите:'
  + row1Html
  + row2Html
  + "<span style='font-size:0;line-height:0;visibility:hidden'><br>а)<br>б)<br>в)<br>г)<br>д)<br>е)<br>ж)<br>з)</span>";

// Find П.4 boundaries by absolute position
var i4=h.indexOf('{id:"П.4"');
var i5=h.indexOf('{id:"П.5"',i4);
var p4=h.slice(i4,i5);

var ti=p4.indexOf('text:"');
var te=p4.indexOf('",type:',ti);
var oldText=p4.slice(ti+6,te);
console.log('oldText length:', oldText.length);

// Replace using absolute positions
var absTextStart = i4 + ti + 6;  // position of text content start in h
var absTextEnd = i4 + te;         // position of \" after text content

h = h.slice(0, absTextStart) + newText + h.slice(absTextEnd);
console.log('П.4 rebuilt');

if(!checkJS('p4_textbook')){process.exit(1);}
fs.writeFileSync('index.html',h);
console.log('SAVED');
