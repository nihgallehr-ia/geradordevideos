// Planejador de vídeos do LAB. Capacidade ajustada para até 100 por geração.
// A versão oficial não importa este arquivo até a aprovação dos testes.
export const MAX_LAB_VIDEOS = 100;

function variations(n,k){
  let v=1;
  for(let i=0;i<k;i++)v*=n-i;
  return v;
}
function combinations(n,k){
  if(k<0||k>n)return 0;
  const smaller=Math.min(k,n-k);
  let v=1;
  for(let i=1;i<=smaller;i++)v=v*(n-smaller+i)/i;
  return Math.round(v);
}
export function possibilities(groups,k,ordered=false){
  const m=groups.middle.length;
  if(k<1||k>m)return 0;
  const sequences=ordered?combinations(m,k):variations(m,k);
  return sequences*Math.max(1,groups.hook.length)*Math.max(1,groups.cta.length);
}
function random(seed){
  let s=seed>>>0;
  return()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};
}
function permutationAt(n,k,rank){
  const pool=Array.from({length:n},(_,i)=>i),picked=[];
  for(let i=0;i<k;i++){
    const block=variations(n-i-1,k-i-1);
    const position=Math.floor(rank/block);
    picked.push(pool.splice(position,1)[0]);
    rank=rank%block;
  }
  return picked;
}
function combinationAt(n,k,rank){
  const picked=[];
  let first=0;
  for(let i=0;i<k;i++){
    for(let x=first;x<=n-(k-i);x++){
      const block=combinations(n-x-1,k-i-1);
      if(rank>=block){rank-=block;continue;}
      picked.push(x);first=x+1;break;
    }
  }
  return picked;
}
function legacyRandomPlans(groups,k,ordered,wanted,seed){
  const rand=random(seed),result=[],seen=new Set();
  const hooks=groups.hook.length?groups.hook:[null],ctas=groups.cta.length?groups.cta:[null];
  // Apenas para totais maiores que Number.MAX_SAFE_INTEGER: não cabe rank exato.
  for(let attempts=0;result.length<wanted&&attempts<wanted*500;attempts++){
    const ids=groups.middle.map((_,i)=>i);
    for(let i=ids.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}
    const pick=ids.slice(0,k);
    if(ordered)pick.sort((a,b)=>a-b);
    const h=Math.floor(rand()*hooks.length),c=Math.floor(rand()*ctas.length);
    const key=h+'|'+pick.join(',')+'|'+c;
    if(seen.has(key))continue;
    seen.add(key);
    result.push({hook:hooks[h],middle:pick.map(i=>groups.middle[i]),cta:ctas[c]});
  }
  return result;
}
export function plans(groups,k,ordered=false,limit=6,seed=42){
  const total=possibilities(groups,k,ordered);
  if(!total)return [];
  const wanted=Math.min(MAX_LAB_VIDEOS,Math.max(0,Math.floor(Number(limit)||0)),total);
  if(!wanted)return [];
  if(!Number.isSafeInteger(total))return legacyRandomPlans(groups,k,ordered,wanted,seed);
  const rand=random(seed),selected=new Set();
  // Amostragem de Floyd: produz exatamente a quantidade desejada,
  // inclusive quando todas as combinações são solicitadas.
  for(let j=total-wanted;j<total;j++){
    const t=Math.floor(rand()*(j+1));
    selected.add(selected.has(t)?j:t);
  }
  const hooks=groups.hook.length?groups.hook:[null],ctas=groups.cta.length?groups.cta:[null];
  const perMiddle=ordered?combinations(groups.middle.length,k):variations(groups.middle.length,k);
  const block=perMiddle*ctas.length;
  return [...selected].map(rank=>{
    const h=Math.floor(rank/block),rest=rank%block;
    const middleRank=Math.floor(rest/ctas.length),c=rest%ctas.length;
    const indices=ordered?combinationAt(groups.middle.length,k,middleRank):permutationAt(groups.middle.length,k,middleRank);
    return {hook:hooks[h],middle:indices.map(i=>groups.middle[i]),cta:ctas[c]};
  });
}
