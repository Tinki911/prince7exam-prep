
const Q=(window.PP_DATA&&window.PP_DATA.questions)||[];
const OFF=(window.PP_OFFICIAL&&window.PP_OFFICIAL.papers)||[];
const LRN=window.PP_LEARNING||{modules:[],flashcards:[]};
const TOP=[...new Set(Q.map(x=>x.topic))],KEY='princeprep_v22';
let S=load(),SES=null,TICK=null,FC=[],FI=0,FLIP=false;

function blank(){return{answered:0,correct:0,topics:{},wrong:{},mocks:[],examDate:'',study:[],seen:{},flash:{},official:{},game:{xp:0,lastDay:'',best:0,plays:0}}}
function load(){try{return Object.assign(blank(),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){return blank()}}
function save(){localStorage.setItem(KEY,JSON.stringify(S))}
function sh(a){a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function st(t){return S.topics[t]||{a:0,c:0}} function mas(t){let x=st(t);return x.a?Math.round(100*x.c/x.a):0}
function pc(a,b){return b?Math.round(100*a/b):0}
function esc(s){return String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function readiness(){if(!S.answered)return 0;let a=pc(S.correct,S.answered),m=S.mocks.length?S.mocks.slice(-3).reduce((x,y)=>x+y.score,0)/Math.min(3,S.mocks.length):a;return Math.round(a*.55+m*.45)}
function mark(){let d=new Date().toISOString().slice(0,10);if(!S.study.includes(d)){S.study.push(d);save()}}
function streakN(){let n=0,d=new Date();while(S.study.includes(d.toISOString().slice(0,10))){n++;d.setDate(d.getDate()-1)}return n}

function show(id){
 document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));
 let el=document.getElementById(id); if(el)el.classList.add('active');
 if(id==='home')home(); if(id==='learn')learn(); if(id==='progress')progress(); if(id==='mockhub')mockHub(); if(id==='play')playHome();
 if(id==='settings')examdate.value=S.examDate||'';
 scrollTo(0,0)
}
function home(){
 ready.textContent=readiness()+'%';answered.textContent=S.answered;accuracy.textContent=S.answered?pc(S.correct,S.answered)+'%':'—';
 bestmock.textContent=S.mocks.length?Math.max(...S.mocks.map(x=>x.score))+'%':'—';streak.textContent='🔥 '+streakN();
 wrongcount.textContent=Object.keys(S.wrong).length+' mistakes';mission.textContent=S.answered?'Strengthen weak areas':'Build your baseline';countText();
 let w=[...TOP].sort((a,b)=>(st(a).a?mas(a):-1)-(st(b).a?mas(b):-1)).slice(0,5);
 weak.innerHTML=w.map(t=>`<div class="weakrow"><div class="row"><b>${esc(t)}</b><span>${st(t).a?mas(t)+'%':'Not tested'}</span></div><div class="bar"><i style="width:${mas(t)}%"></i></div></div>`).join('')
}
function countText(){if(!S.examDate){countdown.textContent='Set your exam date';countsub.textContent='Tap here to activate your countdown and revision intensity.';return}let n=new Date();n.setHours(0,0,0,0);let e=new Date(S.examDate+'T00:00:00'),d=Math.ceil((e-n)/86400000);countdown.textContent=d>=0?`${d} day${d===1?'':'s'} to exam`:'Exam date passed';countsub.textContent=d>10?'Build breadth and accuracy.':d>3?'Prioritize weak areas and full mocks.':'Final review: recall, weak areas and exam technique.'}
function pool(n,filter=null,weighted=false){let p=filter?Q.filter(filter):Q;if(weighted){let w=[...TOP].sort((a,b)=>mas(a)-mas(b)).slice(0,4),prio=p.filter(q=>w.includes(q.topic));p=[...prio,...prio,...p]}let u=p.filter(q=>!S.seen[q.id]);return sh(u.length>=n?u:p).slice(0,n)}
function startAdaptive(n){start('Adaptive Practice',pool(n,null,true),false,{feedback:true})}
function startRescue(){let w=[...TOP].sort((a,b)=>(st(a).a?mas(a):-1)-(st(b).a?mas(b):-1)).slice(0,3);start('Rescue Mode',pool(15,q=>w.includes(q.topic),true),false,{feedback:true})}
function startTopic(t){start(t+' Focus',pool(12,q=>q.topic===t),false,{feedback:true})}
function startMock(){show('mockhub')}

function mockHub(){
 mockchoices.innerHTML=OFF.map(p=>{
   let hist=(S.official[p.id]||[]),best=hist.length?Math.max(...hist.map(x=>x.score))+'%':'Not attempted';
   return `<div class="paper-card"><div><small>OFFICIAL PEOPLECERT SAMPLE</small><h3>${esc(p.title)}</h3><p class="muted">60 questions · 60 minutes · pass 36/60</p><p><b>Best:</b> ${best}</p></div><div class="paper-actions"><button class="primary" onclick="startOfficial(${p.id},false)">Timed exam</button><button class="secondary" onclick="startOfficial(${p.id},true)">Study mode</button></div></div>`
 }).join('');
}
function startOfficial(id,study){
 let p=OFF.find(x=>x.id===id); if(!p)return;
 let items=p.questions.map(q=>({...q,topic:'Official Sample',explanation:q.rationale,learningPoint:q.rationale}));
 start(p.title,items,!study,{official:id,feedback:study,study})
}
function start(title,items,mock,meta={}){
 clearInterval(TICK);SES={title,items,i:0,c:0,mock,done:false,left:mock?3600:null,meta};
 qmode.textContent=meta.official?(meta.study?'OFFICIAL STUDY':'OFFICIAL TIMED'):(mock?'TIMED MOCK':'PRACTICE');
 qtitle.textContent=title;show('quiz');
 if(mock){timer.textContent='60:00';TICK=setInterval(()=>{SES.left--;let m=Math.floor(SES.left/60),s=SES.left%60;timer.textContent=`${m}:${String(s).padStart(2,'0')}`;if(SES.left<=0){clearInterval(TICK);finish()}},1000)}else timer.textContent='';
 renderQ()
}
function renderQ(){
 let q=SES.items[SES.i];
 quizbox.innerHTML=`<div class="qprogress"><i style="width:${100*SES.i/SES.items.length}%"></i></div><div class="qcard"><div class="qmeta">${esc(q.syllabus||q.topic||'PRACTICE')} · ${SES.i+1}/${SES.items.length}</div><h3>${esc(q.question)}</h3><div class="options">${q.options.map((o,i)=>`<button class="option" onclick="answer(${i})"><span class="letter">${String.fromCharCode(65+i)}</span>${esc(o)}</button>`).join('')}</div><div id="feedback"></div></div>`
}
function answer(i){
 if(SES.done)return;SES.done=true;let q=SES.items[SES.i],sel=q.options[i],ok=sel===q.answer;
 S.answered++;if(ok){S.correct++;SES.c++}
 if(q.topic && q.topic!=='Official Sample'){S.topics[q.topic]=S.topics[q.topic]||{a:0,c:0};S.topics[q.topic].a++;if(ok)S.topics[q.topic].c++}
 S.seen[q.id]=(S.seen[q.id]||0)+1;
 if(ok)delete S.wrong[q.id];else S.wrong[q.id]={id:q.id,question:q.question,answer:q.answer,selected:sel,topic:q.topic||q.syllabus,explanation:q.explanation||q.rationale||''};
 save();mark();
 document.querySelectorAll('.option').forEach((b,j)=>{if(SES.meta.feedback){if(b.textContent.includes(q.answer))b.classList.add('good');if(j===i&&!ok)b.classList.add('bad')}b.disabled=true});
 if(SES.meta.feedback){
  feedback.innerHTML=`<div class="feedback ${ok?'good':'bad'}"><b>${ok?'Correct ✓':'Not quite'}</b><p>${esc(q.explanation||q.rationale||'')}</p>${!ok?`<p><b>Correct:</b> ${esc(q.answer)}</p>`:''}</div><button class="next" onclick="nextQ()">${SES.i===SES.items.length-1?'See results':'Next question'}</button>`
 }else{
  feedback.innerHTML=`<button class="next" onclick="nextQ()">${SES.i===SES.items.length-1?'Finish paper':'Next question'}</button>`
 }
}
function nextQ(){SES.i++;SES.done=false;if(SES.i>=SES.items.length)finish();else renderQ()}
function finish(){
 clearInterval(TICK);let score=pc(SES.c,SES.items.length);
 if(SES.mock||SES.meta.official){
   S.mocks.push({date:new Date().toISOString(),score,correct:SES.c,total:SES.items.length,title:SES.title});
   S.mocks=S.mocks.slice(-30);
   if(SES.meta.official){S.official[SES.meta.official]=S.official[SES.meta.official]||[];S.official[SES.meta.official].push({date:new Date().toISOString(),score});}
   save()
 }
 quizbox.innerHTML=`<div class="card result"><small>${SES.meta.official?'OFFICIAL SAMPLE RESULT':(SES.mock?'MOCK RESULT':'SESSION COMPLETE')}</small><div class="score">${score}%</div><h2>${SES.mock||SES.meta.official?(score>=60?'PASS ✓':'Below pass mark'):'Nice work'}</h2><p>${SES.c} / ${SES.items.length} correct${SES.mock||SES.meta.official?' · pass mark 36/60 (60%)':''}</p>${SES.meta.official&&!SES.meta.study?`<button class="secondary wide" onclick="reviewOfficial(${SES.meta.official})">Review answers & rationales</button>`:''}<button class="primary" onclick="show('home')">Back to dashboard</button></div>`
}
function reviewOfficial(id){let p=OFF.find(x=>x.id===id); if(!p)return; start(p.title+' Review',p.questions.map(q=>({...q,topic:'Official Sample',explanation:q.rationale})),false,{official:id,feedback:true,study:true})}
function quitQuiz(){clearInterval(TICK);show('home')}

function learn(){
 let weights=LRN.weights||{};
 let wt=`<div class="weight-card"><div class="weight-title">Where the marks are</div>${Object.entries(weights).map(([k,v])=>`<div class="weight-row"><span>${esc(k)}</span><div class="weightbar"><i style="width:${v}%"></i></div><b>${v}%</b></div>`).join('')}</div>`;
 topics.innerHTML=wt+(LRN.modules||[]).map(m=>`<article class="learn-card"><div class="learn-head"><div class="learn-icon">${m.icon}</div><div><small>${esc(m.accent)}</small><h3>${esc(m.title)}</h3></div></div><div class="visual-strip">${m.visual.map(x=>`<span>${esc(x)}</span>`).join('')}</div><ul>${m.points.map(p=>`<li>${esc(p)}</li>`).join('')}</ul><div class="memory"><b>MEMORY HOOK</b><span>${esc(m.memory)}</span></div></article>`).join('')
}
function showVault(){show('vault');let a=Object.values(S.wrong);vaultbox.innerHTML=a.length?`<button class="primary" onclick="retest()">Retest my mistakes</button>`+a.map(x=>`<div class="vaultitem"><small>${esc(x.topic)}</small><p><b>${esc(x.question)}</b></p><p class="muted">You chose: ${esc(x.selected)}</p><p><b>Correct:</b> ${esc(x.answer)}</p></div>`).join(''):`<div class="card"><h3>Vault empty 🎉</h3><p>No saved mistakes right now.</p></div>`}
function retest(){let ids=new Set(Object.keys(S.wrong)),p=[...Q,...OFF.flatMap(x=>x.questions)].filter(q=>ids.has(q.id));if(p.length)start('Wrong Answer Retest',sh(p).slice(0,20),false,{feedback:true})}

function showFlash(){show('flash');FC=sh(LRN.flashcards||[]);FI=0;FLIP=false;renderFlash()}
function renderFlash(){if(!FC.length){flashbox.innerHTML='<div class="card">No flashcards loaded.</div>';return}let q=FC[FI];flashbox.innerHTML=`<div class="qmeta">${esc(q.tag)} · ${FI+1}/${FC.length}</div><div class="flashcard" onclick="flipF()">${FLIP?`<div><b>${esc(q.back)}</b><p class="muted">${esc(q.tip||'')}</p></div>`:`<div>${esc(q.front)}<p class="muted">Tap to reveal</p></div>`}</div>${FLIP?`<div class="flashbuttons"><button class="again" onclick="rateF(0)">Again</button><button class="hard" onclick="rateF(1)">Hard</button><button class="got" onclick="rateF(2)">Got it</button></div>`:''}`}
function flipF(){FLIP=true;renderFlash()}function rateF(r){S.flash[FC[FI].front]=r;save();FI=(FI+1)%FC.length;FLIP=false;renderFlash()}

function progress(){
 panswered.textContent=S.answered;pcorrect.textContent=S.correct;pmocks.textContent=S.mocks.length;
 mastery.innerHTML=TOP.map(t=>`<div class="masterrow"><div class="row"><b>${esc(t)}</b><span>${st(t).a?mas(t)+'%':'Not tested'} · ${st(t).a} Q</span></div><div class="bar"><i style="width:${mas(t)}%"></i></div></div>`).join('');
 mockhistory.innerHTML=S.mocks.length?S.mocks.slice().reverse().slice(0,10).map(m=>`<div class="weakrow"><div class="row"><span>${esc(m.title||new Date(m.date).toLocaleDateString())}</span><b>${m.score}% · ${m.score>=60?'PASS':'REVIEW'}</b></div><small class="muted">${new Date(m.date).toLocaleDateString()}</small></div>`).join(''):'<p class="muted">No full mocks completed yet.</p>'
}
function saveExamDate(){S.examDate=examdate.value;save();show('home')}
function resetAll(){if(confirm('Reset all PrincePrep progress on this device?')){S=blank();save();show('home')}}

const GAME=window.PP_GAME||{};let G=null;
function gameState(){S.game=S.game||{xp:0,lastDay:'',best:0,plays:0};return S.game}
function playHome(){let g=gameState();playxp.textContent=(g.xp||0)+' XP';gamestars.textContent=g.best>=90?'★★★':g.best>=70?'★★☆':g.best>=40?'★☆☆':'☆☆☆';dailytitle.textContent=g.lastDay===new Date().toISOString().slice(0,10)?'Daily crisis completed — replay or try another game':'Your project needs rescuing';gamebox.innerHTML='<div class="game-tip"><b>PrincePlay feeds your revision:</b> game answers update the same topic mastery used by Rescue Mode and Progress.</div>'}
function gameCredit(topic,ok,points=10){let g=gameState();g.plays++;if(ok)g.xp+=points;if(topic){S.topics[topic]=S.topics[topic]||{a:0,c:0};S.topics[topic].a++;if(ok)S.topics[topic].c++}S.answered++;if(ok)S.correct++;mark();save();playxp.textContent=g.xp+' XP'}
function gameResult(title,c,total){let pct=pc(c,total),g=gameState();g.best=Math.max(g.best||0,pct);save();let stars=pct>=90?'★★★':pct>=70?'★★☆':pct>=40?'★☆☆':'☆☆☆';gamebox.innerHTML=`<div class="game-result"><div class="big-stars">${stars}</div><h3>${title}</h3><div class="game-score">${c}/${total}</div><p>${pct}%</p><button class="primary" onclick="playHome()">Choose another game</button></div>`;gamestars.textContent=stars}
function startDailyGame(){G={i:0,c:0,items:GAME.dailyCrisis||[]};renderDaily()}
function renderDaily(){let q=G.items[G.i];gamebox.innerHTML=`<div class="game-card"><div class="game-progress"><i style="width:${100*G.i/G.items.length}%"></i></div><small>PROJECT RESCUE · ROUND ${G.i+1}/${G.items.length}</small><h3>${esc(q.title)}</h3><p class="scenario">${esc(q.scenario)}</p><div class="game-options">${q.options.map((o,i)=>`<button data-i="${i}">${esc(o)}</button>`).join('')}</div><div id="gamefeedback"></div></div>`;gamebox.querySelectorAll('.game-options button').forEach(b=>b.addEventListener('click',()=>dailyAnswer(+b.dataset.i)))}
function dailyAnswer(i){let q=G.items[G.i],ok=i===q.answer;if(ok)G.c++;gameCredit(q.topic,ok,15);gamebox.querySelectorAll('.game-options button').forEach((b,j)=>{b.disabled=true;if(j===q.answer)b.classList.add('good');if(j===i&&!ok)b.classList.add('bad')});gamefeedback.innerHTML=`<div class="game-feedback ${ok?'good':'bad'}"><b>${ok?'Project stabilized ✓':'Project takes a hit'}</b><p>${esc(q.learning)}</p></div><button class="next" id="gNext">${G.i===G.items.length-1?'Finish rescue':'Next crisis'}</button>`;document.getElementById('gNext').addEventListener('click',()=>{G.i++;if(G.i>=G.items.length){gameState().lastDay=new Date().toISOString().slice(0,10);save();gameResult('Project Rescue',G.c,G.items.length)}else renderDaily()})}
function startRoleRush(){G={i:0,c:0,items:sh(GAME.roleRush||[])};renderRole()}
function renderRole(){let q=G.items[G.i],opts=sh(q.options);gamebox.innerHTML=`<div class="game-card"><small>ROLE RUSH · ${G.i+1}/${G.items.length}</small><h3>Who am I?</h3><p class="scenario">${esc(q.prompt)}</p><div class="role-options">${opts.map(o=>`<button data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div></div>`;gamebox.querySelectorAll('.role-options button').forEach(b=>b.addEventListener('click',()=>{let ok=b.dataset.v===q.answer;if(ok)G.c++;gameCredit(q.topic,ok,10);b.classList.add(ok?'good':'bad');setTimeout(()=>{G.i++;G.i>=G.items.length?gameResult('Role Rush',G.c,G.items.length):renderRole()},550)}))}
function startRiskIssue(){G={i:0,c:0,items:sh(GAME.riskIssue||[])};renderRiskIssue()}
function renderRiskIssue(){let q=G.items[G.i];gamebox.innerHTML=`<div class="game-card center-game"><small>RISK OR ISSUE? · ${G.i+1}/${G.items.length}</small><p class="scenario big">${esc(q.statement)}</p><div class="binary"><button data-v="Risk">⚠️ RISK</button><button data-v="Issue">🛠️ ISSUE</button></div><div id="gamefeedback"></div></div>`;gamebox.querySelectorAll('.binary button').forEach(b=>b.addEventListener('click',()=>{let ok=b.dataset.v===q.answer;if(ok)G.c++;gameCredit(q.topic,ok,10);gamefeedback.innerHTML=`<div class="game-feedback ${ok?'good':'bad'}"><b>${ok?'Nice ✓':'Watch the distinction'}</b><p>${esc(q.why)}</p></div>`;setTimeout(()=>{G.i++;G.i>=G.items.length?gameResult('Risk or Issue?',G.c,G.items.length):renderRiskIssue()},850)}))}
function startTolerance(){G={i:0,c:0,items:sh(GAME.tolerance||[])};renderTolerance()}
function renderTolerance(){let q=G.items[G.i];gamebox.innerHTML=`<div class="game-card center-game"><small>TOLERANCE TROUBLE · ${G.i+1}/${G.items.length}</small><p class="scenario big">${esc(q.scenario)}</p><div class="binary"><button data-v="MANAGE">✅ MANAGE</button><button data-v="ESCALATE">🚨 ESCALATE</button></div><div id="gamefeedback"></div></div>`;gamebox.querySelectorAll('.binary button').forEach(b=>b.addEventListener('click',()=>{let ok=b.dataset.v===q.answer;if(ok)G.c++;gameCredit(q.topic,ok,12);gamefeedback.innerHTML=`<div class="game-feedback ${ok?'good':'bad'}"><b>${ok?'Good call ✓':'That would weaken control'}</b><p>${esc(q.why)}</p></div>`;setTimeout(()=>{G.i++;G.i>=G.items.length?gameResult('Tolerance Trouble',G.c,G.items.length):renderTolerance()},850)}))}
function startProcessPath(){G={target:GAME.processPath||[],order:sh(GAME.processPath||[]),chosen:[]};renderProcessPath()}
function renderProcessPath(){gamebox.innerHTML=`<div class="game-card"><small>PROCESS PATH</small><h3>Build the PRINCE2 journey</h3><p class="muted">Tap the processes in lifecycle order.</p><div id="pathChosen" class="path-chosen"></div><div id="pathPool" class="path-pool">${G.order.map((x,i)=>`<button data-i="${i}">${esc(x)}</button>`).join('')}</div><div id="gamefeedback"></div></div>`;gamebox.querySelectorAll('#pathPool button').forEach(b=>b.addEventListener('click',()=>pathPick(b)))}
function pathPick(btn){let val=G.order[+btn.dataset.i];if(btn.disabled)return;btn.disabled=true;G.chosen.push(val);pathChosen.innerHTML=G.chosen.map((x,i)=>`<span>${i+1}. ${esc(x)}</span>`).join('');if(G.chosen.length===G.target.length){let ok=G.chosen.every((x,i)=>x===G.target[i]);gameCredit('Processes',ok,ok?25:0);if(ok)gameResult('Process Path',1,1);else{gamefeedback.innerHTML=`<div class="game-feedback bad"><b>Almost — rebuild the journey</b><p>${G.target.map(esc).join(' → ')}</p></div><button class="next" id="retryPath">Try again</button>`;document.getElementById('retryPath').addEventListener('click',startProcessPath)}}}

home();
