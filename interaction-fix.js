/* PrincePrep v2.4.2 — meaningful learning interactions */
(function(){
  const roleDetails={
    'Executive':{icon:'💼',interest:'Business',does:'Chairs the Project Board, is the single point of accountability, secures funding and owns continued business justification.',links:'Directs the Project Manager and owns the Business Case.'},
    'Senior User':{icon:'🙋',interest:'User',does:'Represents user needs, requirements, benefits, adoption and handover.',links:'Ensures the project delivers products that users can use and benefits can be realized.'},
    'Senior Supplier':{icon:'🧰',interest:'Supplier',does:'Represents specialist delivery capability and technical integrity.',links:'Ensures the supplier side can design, build and deliver the required products.'},
    'Project Manager':{icon:'🧭',interest:'Manage',does:'Manages the project day to day within authority delegated by the Project Board.',links:'Authorizes Work Packages, monitors stages and reports to the Project Board.'},
    'Team Manager':{icon:'🛠️',interest:'Deliver',does:'Accepts, executes and delivers agreed Work Packages.',links:'Reports Work Package status to the Project Manager using Checkpoint Reports.'},
    'Project Assurance':{icon:'🔎',interest:'Assure',does:'Provides independent confidence to the Project Board that the project is being conducted properly.',links:'Assurance is independent of the Project Manager.'},
    'Project Support':{icon:'📎',interest:'Support',does:'Provides administrative and specialist support such as tools, records and reporting assistance.',links:'Supports the Project Manager and teams; it does not direct the project.'}
  };

  function roleMap(){
    return `<div class="role-map">
      <div class="role-board-title">PROJECT BOARD · DIRECTS</div>
      <div class="role-board">
        ${['Executive','Senior User','Senior Supplier'].map(r=>`<button onclick="showRoleDetail('${r}')"><span>${roleDetails[r].icon}</span><b>${r}</b><small>${roleDetails[r].interest}</small></button>`).join('')}
      </div>
      <div class="role-arrow">↓ authorizes & directs</div>
      <button class="role-pm" onclick="showRoleDetail('Project Manager')"><span>🧭</span><b>Project Manager</b><small>MANAGES</small></button>
      <div class="role-arrow">↓ authorizes Work Packages</div>
      <button class="role-team" onclick="showRoleDetail('Team Manager')"><span>🛠️</span><b>Team Manager</b><small>DELIVERS</small></button>
      <div class="role-sidecars"><button onclick="showRoleDetail('Project Assurance')">🔎 Project Assurance</button><button onclick="showRoleDetail('Project Support')">📎 Project Support</button></div>
      <div id="roleDetail" class="role-detail"><b>Tap a role</b><p>See its responsibility and its relationship to the rest of the project management team.</p></div>
    </div>`;
  }

  window.showRoleDetail=function(name){
    const r=roleDetails[name],box=document.getElementById('roleDetail'); if(!r||!box)return;
    box.innerHTML=`<div class="role-detail-head"><span>${r.icon}</span><div><small>${r.interest.toUpperCase()}</small><h4>${name}</h4></div></div><p>${r.does}</p><div class="role-link"><b>CONNECT IT</b><span>${r.links}</span></div>`;
  };

  const originalUnderstand=window.understandIt;
  window.understandIt=function(m){
    if(m.id==='organizing')return `<div class="lesson-panel"><small>2 · UNDERSTAND IT</small><h3>Tap the team, not six mystery cards</h3><p class="muted">Start with the management levels, then explore each role.</p>${roleMap()}<button class="primary" onclick="lessonNext()">Now test the relationships →</button></div>`;
    return originalUnderstand(m);
  };

  const originalConnect=window.connectIt;
  window.connectIt=function(m,chain){
    if(m.id!=='organizing')return originalConnect(m,chain);
    return `<div class="lesson-panel"><small>3 · CONNECT IT</small><h3>Match the responsibility to the role</h3><p class="muted">Tap the role that best owns each responsibility.</p><div id="roleMatch"></div><div id="roleMatchFeedback"></div></div>`;
  };

  const roleChallenges=[
    {q:'Owns the Business Case and continued business justification.',a:'Executive',opts:['Executive','Senior User','Project Manager']},
    {q:'Represents requirements, adoption and expected benefits.',a:'Senior User',opts:['Senior Supplier','Senior User','Team Manager']},
    {q:'Accepts and delivers Work Packages.',a:'Team Manager',opts:['Project Manager','Team Manager','Project Assurance']},
    {q:'Manages the project day to day within delegated authority.',a:'Project Manager',opts:['Executive','Project Manager','Project Support']}
  ];
  let RM=0;
  window.renderLesson=(function(orig){return function(){orig();let m=(window.LRN&&LRN.modules||[]).find(x=>x.id===IL.module);if(m&&m.id==='organizing'&&IL.step===2){RM=0;renderRoleChallenge();}}})(window.renderLesson);
  window.renderRoleChallenge=function(){
    const box=document.getElementById('roleMatch'); if(!box)return; const q=roleChallenges[RM];
    box.innerHTML=`<div class="role-challenge"><small>${RM+1} / ${roleChallenges.length}</small><p>${q.q}</p><div>${q.opts.map(o=>`<button onclick="answerRoleMatch(this,'${o.replace(/'/g,"\\'")}')">${o}</button>`).join('')}</div></div>`;
    const fb=document.getElementById('roleMatchFeedback');if(fb)fb.innerHTML='';
  };
  window.answerRoleMatch=function(btn,val){
    const q=roleChallenges[RM],ok=val===q.a;document.querySelectorAll('.role-challenge button').forEach(x=>x.disabled=true);btn.classList.add(ok?'good':'bad');
    if(!ok)[...document.querySelectorAll('.role-challenge button')].find(x=>x.textContent===q.a)?.classList.add('good');
    roleMatchFeedback.innerHTML=`<div class="game-feedback ${ok?'good':'bad'}"><b>${ok?'Correct ✓':'Correct role: '+q.a}</b></div><button class="next" onclick="nextRoleMatch()">${RM===roleChallenges.length-1?'Continue to exam check':'Next match'}</button>`;
  };
  window.nextRoleMatch=function(){RM++;if(RM>=roleChallenges.length){lessonNext();return;}renderRoleChallenge();};

  function norm(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
  function flashTransform(q){
    let front=String(q.front||''),back=String(q.back||''),tip=String(q.tip||'');
    const f=front.toLowerCase();
    if(f.includes('team manager')&&f.includes('project manager')&&f.includes('work package status')){
      return {front:'Which time-driven report does a Team Manager send to the Project Manager about Work Package status?',back:'Checkpoint Report',tip:'Team Manager → Project Manager · time-driven.'};
    }
    if(f.includes('project manager')&&f.includes('project board')&&f.includes('time-driven')){
      return {front:'Which time-driven report does the Project Manager send to the Project Board?',back:'Highlight Report',tip:'Project Manager → Project Board · time-driven.'};
    }
    const dictionary={
      'executive':['Which Project Board role is the single point of accountability and owns continued business justification?','Executive','Business interest · chairs the Project Board.'],
      'senior user':['Which Project Board role represents user requirements, adoption and benefits?','Senior User','User interest.'],
      'senior supplier':['Which Project Board role represents specialist delivery capability and technical integrity?','Senior Supplier','Supplier interest.'],
      'project manager':['Who manages the project day to day within delegated authority?','Project Manager','Board directs · Project Manager manages.'],
      'team manager':['Who accepts, executes and delivers agreed Work Packages?','Team Manager','Project Manager authorizes · Team Manager delivers.'],
      'project assurance':['Which role provides independent confidence to the Project Board that the project is being conducted properly?','Project Assurance','Independent of the Project Manager.'],
      'project support':['Which role provides administrative and specialist support to project management?','Project Support','Support does not direct the project.'],
      'output':['In PRINCE2, what is an output?','A tangible or intangible deliverable of an activity.','Output → capability → outcome → benefit.'],
      'capability':['In PRINCE2, what is a capability?','The completed set of project outputs required to deliver an outcome.','Output → capability → outcome.'],
      'outcome':['In PRINCE2, what is an outcome?','The result of change, normally affecting real-world behaviour or circumstances.','Outcomes enable benefits to be realized.'],
      'benefit':['In PRINCE2, what is a benefit?','A measurable improvement resulting from an outcome and contributing to business objectives.','Benefit = measurable improvement.'],
      'dis-benefit':['In PRINCE2, what is a dis-benefit?','A measurable decline resulting from an outcome and detracting from business objectives.','Dis-benefit = measurable negative consequence.']
    };
    if(dictionary[f]){let d=dictionary[f];return{front:d[0],back:d[1],tip:d[2]}}
    if(f.startsWith('principle:'))return{front:`What does the PRINCE2 principle “${front.split(':').slice(1).join(':').trim()}” require?`,back,tip:norm(tip)===norm(back)?'':tip};
    if(norm(front)===norm(back)){
      return {front:`What PRINCE2 term matches this description?\n\n${front}`,back:'Say the specific PRINCE2 term before revealing.',tip:''};
    }
    if(!/[?]$/.test(front)&&front.split(/\s+/).length<=4)return{front:`What does “${front}” mean in PRINCE2?`,back,tip:norm(tip)===norm(back)?'':tip};
    return{front,back,tip:norm(tip)===norm(back)?'':tip};
  }

  window.renderFlash=function(){
    if(!FC.length){flashbox.innerHTML='<div class="card">No flashcards loaded.</div>';return}
    const raw=FC[FI],q=flashTransform(raw);
    flashbox.innerHTML=`<div class="flash-progress"><span>${esc(raw.tag)} · ${FI+1}/${FC.length}</span><div><i style="width:${100*(FI+1)/FC.length}%"></i></div></div><div class="flashcard recall-card" onclick="flipF()">${FLIP?`<div class="flash-answer"><small>ANSWER</small><b>${esc(q.back)}</b>${q.tip?`<p>${esc(q.tip)}</p>`:''}</div>`:`<div class="flash-question"><small>RECALL IT</small><b>${esc(q.front)}</b><p>Say the answer first, then tap to reveal.</p></div>`}</div>${FLIP?`<div class="flashbuttons"><button class="again" onclick="event.stopPropagation();rateF(0)">Again</button><button class="hard" onclick="event.stopPropagation();rateF(1)">Hard</button><button class="got" onclick="event.stopPropagation();rateF(2)">Got it</button></div>`:''}`;
  };
})();
