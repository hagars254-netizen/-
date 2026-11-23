const API_FULL='https://api.alquran.cloud/v1/quran/quran-uthmani';
const API_SURAH=n=>`https://api.alquran.cloud/v1/surah/${n}/quran-uthmani`;
const $=id=>document.getElementById(id);
const MAX_RANGE=100;

/* أسماء السور وعدد آياتها ثابتة، فالقوائم بتفتح فورًا بدون إنترنت */
const NAMES=['الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام','الأعراف','الأنفال','التوبة','يونس','هود','يوسف','الرعد','إبراهيم','الحجر','النحل','الإسراء','الكهف','مريم','طه','الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء','النمل','القصص','العنكبوت','الروم','لقمان','السجدة','الأحزاب','سبأ','فاطر','يس','الصافات','ص','الزمر','غافر','فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف','محمد','الفتح','الحجرات','ق','الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد','المجادلة','الحشر','الممتحنة','الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم','الملك','القلم','الحاقة','المعارج','نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ','النازعات','عبس','التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر','البلد','الشمس','الليل','الضحى','الشرح','التين','العلق','القدر','البينة','الزلزلة','العاديات','القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر','المسد','الإخلاص','الفلق','الناس'];
const COUNTS=[7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
const SN=[null,...NAMES],AC=[null,...COUNTS];

const norm=s=>s.replace(/\u0640/g,'').replace(/\u0670/g,'ا')
  .replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED\u08D3-\u08FF]/g,'')
  .replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[^\u0621-\u064A\s]/g,' ')
  .replace(/\s+/g,' ').trim();
const num=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const label=a=>`${SN[a.s]} (${num(a.n)})`;
const phrase=(a,n)=>a.nw.slice(0,n).map(t=>t.d).join(' ')+' ...';
function opts(sel,from,to,textFn){
  sel.innerHTML='';
  for(let i=from;i<=to;i++){const o=document.createElement('option');o.value=i;o.textContent=textFn?textFn(i):i;sel.appendChild(o)}
}

/* ================= الخلفية والحركة ================= */
const SHAPES={
  star:'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16"/><rect x="4" y="4" width="16" height="16" transform="rotate(45 12 12)"/></svg>',
  starO:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="4" y="4" width="16" height="16"/><rect x="4" y="4" width="16" height="16" transform="rotate(45 12 12)"/><circle cx="12" cy="12" r="3.2"/></svg>',
  crescent:'<svg viewBox="0 0 24 24"><path d="M15.5 2.5a10 10 0 1 0 6 17.2A8.5 8.5 0 0 1 15.5 2.5z"/></svg>',
  ring:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="5.5"/></svg>',
  dot:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/></svg>',
  glyph:'<b>۞</b>'
};
function makeBg(){
  const bg=document.createElement('div');bg.className='bg';
  const rnd=(a,b)=>a+Math.random()*(b-a);
  for(let i=0;i<3;i++){
    const g=document.createElement('span'),sz=rnd(280,440);
    g.className='glow';
    g.style.cssText=`left:${rnd(-10,75)}%;top:${rnd(-10,75)}%;width:${sz}px;height:${sz}px;background:${i%2?'#f5c76b':'#5eead4'};`+
      `--d:${rnd(14,24)}s;--x:${rnd(-120,120)}px;--y:${rnd(-100,100)}px`;
    bg.appendChild(g);
  }
  const types=[['star',14,28],['starO',18,34],['crescent',14,24],['ring',10,22],['dot',3,8],['glyph',16,28],['dot',3,8]];
  for(let i=0;i<38;i++){
    const [t,mn,mx]=types[i%types.length],size=rnd(mn,mx),gold=Math.random()<.45;
    const p=document.createElement('span');
    p.className='p '+t;p.innerHTML=SHAPES[t];
    p.style.cssText=`left:${rnd(0,100)}%;width:${size}px;height:${size}px;font-size:${size}px;`+
      `color:${gold?`rgba(245,199,107,${rnd(.55,.95)})`:`rgba(255,255,255,${rnd(.4,.75)})`};`+
      `--d:${rnd(22,48)}s;--dl:${-rnd(0,48)}s;--sx:${rnd(-70,70)}px;--t:${rnd(2,5)}s;--s:${rnd(14,40)}s`;
    if(t!=='dot')p.firstElementChild.classList.add(Math.random()<.5?'cw':'ccw');
    bg.appendChild(p);
  }
  document.body.prepend(bg);
}
function stagger(){
  document.querySelectorAll('.stagger').forEach(g=>[...g.children].forEach((c,i)=>c.style.setProperty('--i',i)));
}

/* ================= البيانات (تحميل كسول) ================= */
let Q=[],sim={},SURAH=[],fullReady=false,fullP=null,fullBytes=0,cur=null;
const firstJuz=[],firstHq=[];
function rubsOf(ay){
  const m=new Map();
  ay.forEach(a=>{if(!m.has(a.hq))m.set(a.hq,{hq:a.hq,from:a.n,to:a.n,first:a});m.get(a.hq).to=a.n});
  return [...m.values()];
}
const rubText=r=>`الحزب ${num(Math.ceil(r.hq/4))} · الربع ${num((r.hq-1)%4+1)} — ${phrase(r.first,3)} (آية ${num(r.from)})`;

function mk(s,n,juz,hq,text){
  let words=text.split(/\s+/);
  if(n===1&&s!==1&&s!==9&&norm(words.slice(0,4).join(' '))==='بسم الله الرحمن الرحيم')words=words.slice(4);
  const toks=words.map(w=>({d:w,n:norm(w)})).filter(t=>t.d);
  return {s,n,juz,hq,toks,nw:toks.filter(t=>t.n)};
}
async function fetchJSON(url,onProg){
  const r=await fetch(url);
  if(!r.ok)throw new Error('http');
  if(!r.body||!onProg)return r.json();
  const rd=r.body.getReader(),ch=[];let got=0;
  for(;;){const {done,value}=await rd.read();if(done)break;ch.push(value);got+=value.length;onProg(got)}
  return JSON.parse(new TextDecoder().decode(await new Blob(ch).arrayBuffer()));
}
/* سورة واحدة بس: سريع جدًا */
async function getSurah(s){
  if(SURAH[s])return SURAH[s];
  const j=await fetchJSON(API_SURAH(s));
  SURAH[s]=j.data.ayahs.map(a=>mk(s,a.numberInSurah,a.juz,a.hizbQuarter,a.text));
  return SURAH[s];
}
/* المصحف كامل: في الخلفية، ومخزن بصيغة مضغوطة */
function loadFull(){
  if(fullP)return fullP;
  fullP=(async()=>{
    let c=null;
    try{c=JSON.parse(localStorage.getItem('quranV2'))}catch(e){}
    if(!c){
      const j=await fetchJSON(API_FULL,b=>{fullBytes=b;refreshStatus()});
      c=j.data.surahs.map(s=>s.ayahs.map(a=>[a.numberInSurah,a.juz,a.hizbQuarter,a.text]));
      try{localStorage.setItem('quranV2',JSON.stringify(c))}catch(e){}
    }
    Q=[];
    c.forEach((arr,i)=>{SURAH[i+1]=arr.map(a=>mk(i+1,...a));Q.push(...SURAH[i+1])});
    Q.forEach((a,i)=>{
      if(a.nw.length>=3){const k=a.nw.slice(0,3).map(t=>t.n).join(' ');(sim[k]=sim[k]||[]).push(i);a.key=k}
    });
    Q.forEach(a=>{if(!firstJuz[a.juz])firstJuz[a.juz]=a;if(!firstHq[a.hq])firstHq[a.hq]=a});
    fullReady=true;
    fillVals();
    $('newQ').disabled=false;
    refreshStatus();
  })().catch(e=>{fullP=null;refreshStatus(true)});
  return fullP;
}

/* ================= التنقل بين الشاشتين ================= */
let view='rec';
const viewFromHash=()=>location.hash==='#similar'?'sim':'rec';
function setStatus(t){$('status').textContent=t}
function refreshStatus(failed){
  if($('qBox')&&!$('qBox').classList.contains('hide'))return;
  if(view==='rec'){setStatus('اختاري السورة والآيات ثم اضغطي «ابدأ الاختبار».');return}
  if(fullReady)setStatus('اختاري النطاق ثم اضغطي «سؤال جديد».');
  else if(failed)setStatus('تعذر تحميل المصحف الكامل. تأكدي من الإنترنت ثم أعيدي فتح الصفحة.');
  else setStatus(`جارِ تحميل المصحف كاملًا (مرة واحدة فقط)${fullBytes?' — '+Math.round(fullBytes/1024)+' ك.ب':''}`);
}
function apply(v){
  view=v;
  const rec=v==='rec';
  document.body.classList.toggle('theme-a',rec);document.body.classList.toggle('theme-b',!rec);
  $('viewRec').classList.toggle('hide',!rec);$('viewSim').classList.toggle('hide',rec);
  $('navRec').classList.toggle('on',rec);$('navSim').classList.toggle('on',!rec);
  $('hTitle').textContent=rec?'التسميع الصوتي':'المواضع والمتشابهات';
  $('hSub').textContent=rec?'اختاري السورة والآيات، وسمّعي من حفظك':'اختاري النطاق، والتطبيق يختار لك مواضع عشوائية تسمّعيها';
  document.title=$('hTitle').textContent;
  (rec?$('viewRec'):$('viewSim')).appendChild($('panel'));
  stopRec();
  $('qBox').classList.add('hide');
  refreshStatus();
  if(!rec)loadFull();
}
function go(v){
  if(v===view)return;
  document.body.classList.add('leaving');
  setTimeout(()=>{apply(v);document.body.classList.remove('leaving')},350);
}

/* ================= التسميع العادي ================= */
let rubList=[],rubToken=0;
function setRange(f,t){
  const s=+$('nSurah').value;
  opts($('nFrom'),1,AC[s]);$('nFrom').value=f;
  opts($('nTo'),f,Math.min(AC[s],f+MAX_RANGE-1));
  $('nTo').value=Math.min(t,AC[s],f+MAX_RANGE-1);
}
async function onSurah(){
  const s=+$('nSurah').value;
  setRange(1,3);
  const sel=$('nRub'),token=++rubToken;
  sel.innerHTML='<option value="">جارِ تحميل أرباع السورة...</option>';sel.disabled=true;
  try{
    const ay=await getSurah(s);
    if(token!==rubToken)return;
    rubList=rubsOf(ay);
    sel.innerHTML='<option value="">— اختيار الآيات يدويًا —</option>';
    rubList.forEach((r,i)=>{
      const o=document.createElement('option');o.value=i;o.textContent=rubText(r);sel.appendChild(o);
    });
    sel.disabled=false;
  }catch(e){sel.innerHTML='<option value="">تعذر تحميل الأرباع (اختاري الآيات يدويًا)</option>'}
}
function onRub(){
  const i=$('nRub').value;
  if(i==='')return;
  const r=rubList[+i];
  setRange(r.from,r.to);
}
function onFrom(){
  const s=+$('nSurah').value,f=+$('nFrom').value;
  opts($('nTo'),f,Math.min(AC[s],f+MAX_RANGE-1));
  $('nTo').value=Math.min(AC[s],f+2);
  $('nRub').value='';
}
async function startNormal(){
  const s=+$('nSurah').value,f=+$('nFrom').value,t=+$('nTo').value;
  $('qBox').classList.add('hide');setStatus('جارِ تحميل السورة...');
  try{
    const ay=await getSurah(s);
    showQuestion(ay.filter(a=>a.n>=f&&a.n<=t),'تسميع — سورة '+SN[s]);
  }catch(e){setStatus('تعذر تحميل السورة، تأكدي من الإنترنت وحاولي تاني.')}
}

/* ================= المواضع والمتشابهات ================= */
function fillVals(){
  const sc=$('scope').value,prev=$('val').value;
  $('valBox').classList.toggle('hide',sc==='all');
  $('subBox').classList.toggle('hide',sc!=='surah'||!fullReady);
  const cfg={surah:['السورة',114],juz:['الجزء',30],hizb:['الحزب',60],rub:['الربع',240]}[sc];
  if(cfg){
    $('valLbl').textContent=cfg[0];
    const nm=fullReady?{
      surah:i=>`${i} - ${SN[i]}`,
      juz:i=>{const a=firstJuz[i];return `الجزء ${num(i)} — ${phrase(a,3)} (${label(a)})`},
      hizb:i=>{const a=firstHq[(i-1)*4+1];return `الحزب ${num(i)} — ${phrase(a,3)} (${label(a)})`},
      rub:i=>{const a=firstHq[i];return `الحزب ${num(Math.ceil(i/4))} · الربع ${num((i-1)%4+1)} — ${phrase(a,3)} (${label(a)})`}
    }[sc]:(sc==='surah'?i=>`${i} - ${SN[i]}`:null);
    opts($('val'),1,cfg[1],nm);
    if(prev&&+prev<=cfg[1])$('val').value=prev;
  }
  if(sc==='surah')fillSub();
}
function fillSub(){
  const sel=$('subRub'),v=+$('val').value;
  sel.innerHTML='<option value="">كل السورة</option>';
  if(!fullReady||!SURAH[v])return;
  rubsOf(SURAH[v]).forEach(r=>{
    const o=document.createElement('option');o.value=r.hq;o.textContent=rubText(r);sel.appendChild(o);
  });
}
function inScope(a){
  const sc=$('scope').value,v=+$('val').value;
  if(sc==='all')return true;
  if(sc==='surah'){
    if(a.s!==v)return false;
    const q=$('subRub').value;
    return q===''||a.hq===+q;
  }
  if(sc==='juz')return a.juz===v;
  if(sc==='hizb')return Math.ceil(a.hq/4)===v;
  return a.hq===v;
}
function newQuestion(){
  if(!fullReady)return;
  const N=+$('cnt').value,mode=$('mode').value;
  let pool=[];
  Q.forEach((a,i)=>{
    const last=Q[i+N-1];
    if(!inScope(a)||!last||last.s!==a.s)return;
    if(mode==='sim'&&!(a.key&&sim[a.key].length>1))return;
    pool.push(i);
  });
  let note='';
  if(!pool.length&&mode==='sim'){
    note=' (مفيش متشابهات في النطاق ده، اخترت آية عادية)';
    Q.forEach((a,i)=>{const l=Q[i+N-1];if(inScope(a)&&l&&l.s===a.s)pool.push(i)});
  }
  if(!pool.length){$('qBox').classList.add('hide');setStatus('النطاق ده صغير على عدد الآيات المطلوب، جرّبي عدد أقل.');return}
  const i=pool[Math.floor(Math.random()*pool.length)];
  showQuestion(Q.slice(i,i+N),(mode==='sim'?'مواضع متشابهة':'آيات عشوائية')+' — '+label(Q[i]),note);
}

/* ================= عرض السؤال ================= */
function showQuestion(ayahs,tag,note=''){
  stopRec();
  cur={ayahs,toks:ayahs.flatMap(a=>[...a.toks,{d:'﴿'+num(a.n)+'﴾',n:''}])};
  const first=ayahs[0],last=ayahs[ayahs.length-1],box=$('qBox');
  setStatus('');
  box.classList.remove('hide','pop');void box.offsetWidth;box.classList.add('pop');
  $('tag').textContent=tag+note;
  $('from').textContent=phrase(first,4);
  $('toWrap').classList.toggle('hide',ayahs.length===1);
  $('to').textContent=phrase(last,3)+` (${label(last)})`;
  $('chips').innerHTML='';
  $('live').textContent='سيظهر كلامك هنا أثناء التسميع...';
  $('typed').value='';$('result').innerHTML='';$('score').textContent='';
  base='';heard='';
  setTimeout(()=>box.scrollIntoView({behavior:'smooth',block:'start'}),50);
}

/* ================= التعرف على الصوت ================= */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let rec=null,listening=false,base='',heard='';
function startRec(){
  if(!SR){alert('المتصفح لا يدعم التعرف على الصوت. استخدمي Chrome أو اكتبي التسميع في الخانة.');return}
  base='';heard='';
  rec=new SR();rec.lang='ar-SA';rec.continuous=true;rec.interimResults=true;
  rec.onresult=e=>{
    let t='';
    for(let k=0;k<e.results.length;k++)t+=e.results[k][0].transcript+' ';
    heard=t;$('live').textContent=(base+heard)||'...';
  };
  rec.onend=()=>{if(listening){base+=heard+' ';heard='';try{rec.start()}catch(e){}}};
  rec.onerror=e=>{if(e.error==='not-allowed'){listening=false;alert('اسمحي للمتصفح باستخدام الميكروفون.')}};
  listening=true;rec.start();
  $('start').disabled=true;$('start').classList.add('rec');$('stop').disabled=false;
  $('start').textContent='🎤 بسمّع...';
}
function stopRec(){
  listening=false;
  if(rec){try{rec.stop()}catch(e){}}
  const s=$('start');
  s.disabled=false;s.classList.remove('rec');s.textContent='🎤 ابدأ التسميع';
  $('stop').disabled=true;
}

/* ================= التصحيح ================= */
function lev(a,b){
  const m=a.length,n=b.length,d=[...Array(m+1)].map((_,i)=>[i,...Array(n).fill(0)]);
  for(let j=0;j<=n;j++)d[0][j]=j;
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)
    d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  return d[m][n];
}
function same(a,b){
  if(a===b)return true;
  const L=Math.max(a.length,b.length);
  return L>=4&&lev(a,b)<=(L>6?2:1);
}
function grade(){
  stopRec();
  if(!cur)return;
  const text=$('typed').value.trim()||(base+heard);
  const sp=norm(text).split(' ').filter(Boolean);
  const ex=cur.toks.filter(t=>t.n);
  const m=ex.length,n=sp.length;
  const dp=[...Array(m+1)].map(()=>Array(n+1).fill(0));
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)
    dp[i][j]=same(ex[i-1].n,sp[j-1])?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);
  const ok=new Set();
  let i=m,j=n;
  while(i>0&&j>0){
    if(same(ex[i-1].n,sp[j-1])&&dp[i][j]===dp[i-1][j-1]+1){ok.add(ex[i-1]);i--;j--}
    else if(dp[i-1][j]>=dp[i][j-1])i--;else j--;
  }
  let k=0;
  $('result').innerHTML=cur.toks.map(t=>t.n
    ?`<span class="w ${ok.has(t)?'ok':'miss'}" style="animation-delay:${Math.min(k++*.04,2)}s">${t.d}</span>`
    :`<span>${t.d}</span>`).join(' ');
  const pct=m?Math.round(ok.size/m*100):0;
  $('score').textContent=`الصح: ${ok.size} من ${m} كلمة (${pct}%) — الأخضر صح، الأحمر ناقص أو غلط`;
  showSimilar();
  $('result').scrollIntoView({behavior:'smooth',block:'center'});
}
function reveal(){
  if(!cur)return;
  $('result').innerHTML=cur.toks.map(t=>t.d).join(' ');
  $('score').textContent='';
  showSimilar();
}
function showSimilar(){
  const a=cur.ayahs[0];
  if(!fullReady||!a.key){$('chips').innerHTML='';return}
  const list=sim[a.key].filter(x=>Q[x].s!==a.s||Q[x].n!==a.n);
  $('chips').innerHTML=list.length?'نفس البداية موجودة في: '+list.slice(0,8).map(x=>`<span>${label(Q[x])}</span>`).join(''):'';
}

/* ================= التشغيل ================= */
makeBg();stagger();
opts($('nSurah'),1,114,i=>`${i} - ${SN[i]}`);
onSurah();fillVals();
$('nSurah').onchange=onSurah;
$('nFrom').onchange=onFrom;
$('nRub').onchange=onRub;
$('nGo').onclick=startNormal;$('nGo').disabled=false;
$('scope').onchange=fillVals;
$('val').onchange=()=>{if($('scope').value==='surah')fillSub()};
$('newQ').onclick=newQuestion;
$('start').onclick=startRec;$('stop').onclick=grade;$('reveal').onclick=reveal;
window.addEventListener('hashchange',()=>go(viewFromHash()));
if(viewFromHash()==='sim')apply('sim');else refreshStatus();
setTimeout(loadFull,1500); /* تحميل المصحف كاملًا في الخلفية بعد ما الصفحة تظهر */
window.__tasmeeReady=true;