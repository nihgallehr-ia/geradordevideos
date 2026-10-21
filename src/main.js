import './style.css';
import { VIRAMIX_BRAND_IMAGE } from './brand-logo.js';
import { SUPPORT_WHATSAPP_URL } from './support.js';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import JSZip from 'jszip';
import { plans, possibilities, MAX_LAB_VIDEOS } from './combinations.js';

const root=document.querySelector('#app');
const groups={hook:[],middle:[],cta:[]};
const labels={hook:'Gancho',middle:'Desenvolvimento',cta:'Encerramento'};
let serial=1,seed=43,engine=null,loaded=false,busy=false,results=[],zipParts=[];
const LARGE_BATCH_THRESHOLD=30,ZIP_PART_SIZE=20;
let middleCount=2,ordered=false,batch=6,quality='light';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const all=()=>Object.values(groups).flat();
const sequence=p=>[p.hook,...p.middle,p.cta].filter(Boolean);
const choice=(n,value)=>Array.from({length:n},(_,i)=>'<option value="'+(i+1)+'" '+(i+1===value?'selected':'')+'>'+(i+1)+'</option>').join('');
function show(){
 const k=Math.max(1,Math.min(middleCount,groups.middle.length||1));
 const total=possibilities(groups,k,ordered);
 const wanted=batch==='all'?Math.min(MAX_LAB_VIDEOS,total):batch;
 const combos=plans(groups,k,ordered,wanted,seed);
 root.innerHTML='<header><div class="logo logo-graphic"><img alt="ViraMix" src="'+VIRAMIX_BRAND_IMAGE+'" width="220" height="74" decoding="async"></div><div class="pill">✦ Sem créditos de IA</div></header>'+
 '<main><div class="support-top"><a href="'+SUPPORT_WHATSAPP_URL+'" target="_blank" rel="noopener noreferrer" aria-label="Falar com o suporte pelo WhatsApp">💬 Precisa de ajuda? Fale com o suporte</a></div><div class="hero"><small>SEU ESTÚDIO DE CRIATIVOS</small><h1>Um conjunto de takes.<br><em>Infinitas ideias.</em></h1><p>Misture clipes já criados no Flow para TikTok Shop, Reels e Shorts. Sem enviar vídeos para um servidor.</p></div>'+
 '<div class="heading"><small>PASSO 1</small><h2>Monte sua biblioteca</h2><p>Adicione vários arquivos em cada categoria.</p></div>'+
 '<section class="grid">'+Object.keys(groups).map((key,i)=>'<article class="card"><div class="number">0'+(i+1)+'</div><h3>'+labels[key]+'</h3><p>'+({hook:'Primeiro trecho do vídeo. Use uma cena que prenda a atenção logo no começo. (Opcional)',middle:'Parte principal do vídeo. Adicione takes mostrando o produto em ação, seus detalhes e benefícios.',cta:'Último trecho do vídeo. Use uma cena de fechamento ou um gesto indicando onde clicar. (Opcional)'}[key])+'</p><label class="upload">＋ Selecionar vídeos<input type="file" data-add="'+key+'" multiple accept="video/*,.mp4,.mov,.webm,.m4v" '+(busy?'disabled':'')+'></label><div class="items">'+(groups[key].length?groups[key].map(item=>'<div class="clip"><video muted playsinline preload="metadata" src="'+esc(item.url)+'"></video><span title="'+esc(item.file.name)+'">'+esc(item.file.name)+'</span><button data-delete="'+item.id+'" '+(busy?'disabled':'')+' aria-label="Excluir clipe">×</button></div>').join(''):'<div class="empty">Nenhum clipe</div>')+'</div><div class="count">'+groups[key].length+' arquivo(s)</div></article>').join('')+'</section>'+
 '<div class="heading"><small>PASSO 2</small><h2>Configure as combinações</h2><p>Escolha quantos takes entram em cada vídeo, a ordem, a quantidade e a qualidade.</p></div><section class="controls">'+
 '<label>Takes no desenvolvimento por vídeo<select id="middle-count" '+(busy?'disabled':'')+'>'+choice(groups.middle.length||1,k)+'</select></label>'+
 '<label>Ordem<select id="ordered" '+(busy?'disabled':'')+'><option value="0" '+(!ordered?'selected':'')+'>Misturar</option><option value="1" '+(ordered?'selected':'')+'>Preservar ordem do envio</option></select></label>'+
 '<label>Quantidade<select id="batch" '+(busy?'disabled':'')+'>'+[1,2,3,4,6,8,10,12,15,20,30,40,50,60,70,80,90,100].map(n=>'<option value="'+n+'" '+(n===batch?'selected':'')+'>'+n+' vídeos</option>').join('')+'<option value="all" '+(batch==='all'?'selected':'')+'>Todas disponíveis ('+Math.min(total,MAX_LAB_VIDEOS)+')</option></select></label>'+
 '<label>Qualidade<select id="quality" '+(busy?'disabled':'')+'><option value="light" '+(quality==='light'?'selected':'')+'>480 × 854 (econômica)</option><option value="hd" '+(quality==='hd'?'selected':'')+'>720 × 1280 (HD)</option></select></label></section>'+
 '<section class="stats"><div><b>'+possibilities(groups,k,ordered).toLocaleString('pt-BR')+'</b><span>Combinações possíveis</span></div><div><b>'+combos.length+'</b><span>Vídeos neste lote</span></div><div><b>'+all().length+'</b><span>Clipes disponíveis</span></div></section>'+
 '<div class="heading"><small>PASSO 3</small><h2>Prévia das montagens</h2><p>Confira a sequência dos takes antes de gerar. Quer variar? Clique em novas combinações.</p><button class="ghost" id="shuffle" '+(busy?'disabled':'')+'>⤨ Novas combinações</button></div>'+
 '<div class="plans">'+(combos.length?combos.map((p,i)=>'<div class="plan"><b>Vídeo '+String(i+1).padStart(2,'0')+'</b><div>'+sequence(p).map(x=>'<span>'+esc(x.file.name)+'</span>').join(' <i>→</i> ')+'</div></div>').join(''):'<div class="blank">Envie pelo menos um take de desenvolvimento para começar.</div>')+'</div>'+
 '<section class="export"><div><h2>Pronta para gerar? ✨</h2><p>Os arquivos são processados localmente no navegador.</p>'+(combos.length>LARGE_BATCH_THRESHOLD?'<p class="large-batch-note">🧪 LAB: este lote grande será separado em arquivos ZIP de até '+ZIP_PART_SIZE+' vídeos para poupar memória. Baixe todos os ZIPs antes de mudar os takes.</p>':'')+'</div><button id="generate" '+(!combos.length||busy?'disabled':'')+'>▶ Gerar '+combos.length+' vídeos</button></section>'+
 '<div id="progress" class="progress" '+(!busy?'hidden':'')+'>Preparando…</div>'+
 '<section class="downloads">'+(results.length||zipParts.length?'<div class="heading"><small>PRONTOS!</small><h2>'+(zipParts.length?'Seus lotes ZIP':'Arquivos MP4')+'</h2>'+(results.length?'<button id="zip" class="ghost">↓ Baixar todos em ZIP</button>':'')+'</div>'+(zipParts.length?'<p class="zip-hint">Baixe cada parte separadamente. Cada ZIP contém até '+ZIP_PART_SIZE+' vídeos MP4 e pode ser extraído normalmente.</p>'+zipParts.map((z,i)=>'<div class="clip result">📦 Parte '+(i+1)+' · '+z.count+' vídeos <a href="'+z.url+'" download="'+z.name+'">↓ Baixar ZIP</a></div>').join(''):results.map((r,i)=>'<div class="clip result">🎬 Vídeo '+(i+1)+' <a href="'+r.url+'" download="'+r.name+'">↓ Baixar MP4</a></div>').join('')):'')+'</section><footer>ViraMix Studio · Ferramenta independente · Vídeos MP4 verticais sem áudio</footer></main>';
 root.querySelectorAll('[data-add]').forEach(input=>input.onchange=e=>{for(const file of e.target.files){if(!file.type.startsWith('video/')&&!/\.(mp4|mov|m4v|webm)$/i.test(file.name))continue;groups[input.dataset.add].push({id:serial++,file,url:URL.createObjectURL(file)});}clearResults();show();});
 root.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{for(const key in groups){const i=groups[key].findIndex(c=>c.id===Number(b.dataset.delete));if(i>=0){URL.revokeObjectURL(groups[key][i].url);groups[key].splice(i,1);break;}}clearResults();show();});
 for(const [id,fn] of [['middle-count',v=>middleCount=Number(v)],['ordered',v=>ordered=v==='1'],['batch',v=>batch=v==='all'?'all':Number(v)],['quality',v=>quality=v]])root.querySelector('#'+id).onchange=e=>{fn(e.target.value);clearResults();show();};
 root.querySelector('#shuffle').onclick=()=>{seed++;clearResults();show();};
 root.querySelector('#generate').onclick=()=>renderVideos(combos);
 root.querySelector('#zip')?.addEventListener('click',downloadZip);
}
function clearResults(){for(const x of results)URL.revokeObjectURL(x.url);for(const x of zipParts)URL.revokeObjectURL(x.url);results=[];zipParts=[];}
async function ff(){
 if(loaded)return engine;
 engine ||= new FFmpeg();
 const url='https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm';
 await engine.load({coreURL:await toBlobURL(url+'/ffmpeg-core.js','text/javascript'),wasmURL:await toBlobURL(url+'/ffmpeg-core.wasm','application/wasm')});
 loaded=true;return engine;
}
async function run(cmd){const code=await engine.exec(cmd);if(code!==0)throw Error('Erro de processamento do vídeo: '+code);}
function progress(message){const el=root.querySelector('#progress');if(el)el.textContent=message;}
async function saveZipPart(clips){
 if(!clips.length)return;
 progress('Preparando pacote ZIP '+(zipParts.length+1)+'…');
 const zip=new JSZip();
 for(const clip of clips)zip.file(clip.name,clip.blob);
 const blob=await zip.generateAsync({type:'blob',compression:'STORE'});
 const name='viramix_lote_'+String(zipParts.length+1).padStart(2,'0')+'.zip';
 zipParts.push({name,blob,count:clips.length,url:URL.createObjectURL(blob)});
}
async function renderVideos(combos){
 if(busy)return;busy=true;clearResults();show();const files=[...new Map(combos.flatMap(sequence).map(x=>[x.id,x])).values()];
 const [w,h]=quality==='hd'?[720,1280]:[480,854];
 const created=[],large=combos.length>LARGE_BATCH_THRESHOLD;
 let pending=[];
 try{
  progress('Carregando o processador de vídeo (primeira vez pode demorar)…');await ff();
  const names=new Map();
  for(let i=0;i<files.length;i++){
   const file=files[i],input='source_'+file.id+'.bin',out='clip_'+file.id+'.mp4';created.push(input,out);
   progress('Preparando take '+(i+1)+' de '+files.length+': '+file.file.name);
   await engine.writeFile(input,await fetchFile(file.file));
   const filter='fps=24,scale='+w+':'+h+':force_original_aspect_ratio=decrease,pad='+w+':'+h+':(ow-iw)/2:(oh-ih)/2:black,setsar=1,format=yuv420p';
   await run(['-i',input,'-map','0:v:0','-vf',filter,'-an','-c:v','libx264','-preset','ultrafast','-crf','30','-pix_fmt','yuv420p',out]);
   names.set(file.id,out);await engine.deleteFile(input);
  }
  for(let i=0;i<combos.length;i++){
   progress('Montando vídeo '+(i+1)+' de '+combos.length);
   const list='list_'+i+'.txt',out='ready_'+i+'.mp4';
   created.push(list,out);
   await engine.writeFile(list,new TextEncoder().encode(sequence(combos[i]).map(c=>"file '"+names.get(c.id)+"'").join('\n')+'\n'));
   await run(['-f','concat','-safe','0','-i',list,'-c','copy','-movflags','+faststart',out]);
   const data=await engine.readFile(out);if(!data.length)throw Error('Vídeo vazio');
   const blob=new Blob([new Uint8Array(data)],{type:'video/mp4'});
   const name='viramix_video_'+String(i+1).padStart(2,'0')+'.mp4';
   if(large){
    pending.push({name,blob});
    if(pending.length===ZIP_PART_SIZE||i===combos.length-1){
     await saveZipPart(pending);pending=[];
     show();
    }
   }else results.push({name,blob,url:URL.createObjectURL(blob)});
   await engine.deleteFile(out);
  }
 }catch(err){console.error(err);alert('Falha ao gerar vídeos: '+err.message+'. Os vídeos ou pacotes já finalizados continuam disponíveis abaixo. Para lotes grandes, teste qualidade econômica e clipes curtos no computador.');}
 finally{
  if(large&&pending.length){try{await saveZipPart(pending)}catch(err){console.error('Não foi possível salvar a última parte',err)}}
  for(const path of created){try{await engine?.deleteFile(path);}catch{}}
  busy=false;show();
 }
}
async function downloadZip(){
 const zip=new JSZip();for(const r of results)zip.file(r.name,r.blob);
 const blob=await zip.generateAsync({type:'blob',compression:'STORE'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='viramix-videos.zip';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
show();
