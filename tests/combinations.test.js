import test from 'node:test';
import assert from 'node:assert/strict';
import {plans,possibilities,MAX_LAB_VIDEOS} from '../src/combinations.js';
const arr=(n,prefix)=>Array.from({length:n},(_,i)=>({id:prefix+i}));
const ids=p=>[p.hook?.id??'x',...p.middle.map(m=>m.id),p.cta?.id??'x'].join('|');
test('3 ganchos, 5 takes, 2 CTA, 2 takes por vídeo',()=>{
 const g={hook:arr(3,'H'),middle:arr(5,'M'),cta:arr(2,'C')};
 assert.equal(possibilities(g,2),120);
 const p=plans(g,2,false,30);
 assert.equal(p.length,30);assert.equal(new Set(p.map(ids)).size,30);
 for(const x of p)assert.notEqual(x.middle[0],x.middle[1]);
});
test('ordem preservada',()=>{
 const g={hook:[],middle:arr(4,'M'),cta:[]};
 assert.equal(possibilities(g,2,true),6);
 const p=plans(g,2,true,30);
 assert.equal(p.length,6);assert.equal(new Set(p.map(ids)).size,6);
 for(const x of p)assert.ok(x.middle[0].id<x.middle[1].id);
});
test('LAB: todas as 68 combinações podem ser geradas sem duplicatas',()=>{
 const g={hook:arr(17,'H'),middle:arr(2,'M'),cta:arr(2,'C')};
 assert.equal(possibilities(g,1),68);
 const p=plans(g,1,false,68,83);
 assert.equal(p.length,68);
 assert.equal(new Set(p.map(ids)).size,68);
 assert.deepEqual(plans(g,1,false,68,83),p);
});
test('LAB: 100 das 120 combinações, sem truncamento em 30',()=>{
 const g={hook:arr(3,'H'),middle:arr(5,'M'),cta:arr(2,'C')};
 const p=plans(g,2,false,100,3);
 assert.equal(p.length,100);assert.equal(new Set(p.map(ids)).size,100);
 assert.equal(plans(g,2,false,120,3).length,MAX_LAB_VIDEOS);
});
test('LAB: todas as combinações em ordem preservada e seleção completa',()=>{
 const g={hook:arr(2,'H'),middle:arr(5,'M'),cta:arr(2,'C')};
 assert.equal(possibilities(g,3,true),40);
 const p=plans(g,3,true,40,19);
 assert.equal(p.length,40);assert.equal(new Set(p.map(ids)).size,40);
 for(const x of p)assert.deepEqual(x.middle.map(m=>m.id),[...x.middle.map(m=>m.id)].sort());
});
test('sem takes de desenvolvimento não gera resultados',()=>{
 const g={hook:[],middle:[],cta:[]};
 assert.equal(possibilities(g,1),0);assert.deepEqual(plans(g,1,false,68),[]);
});
