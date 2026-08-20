/* PrincePrep v2.4.1 — persistent evening-friendly dark mode */
(function(){
  const KEY='princeprep_theme';
  function saved(){return localStorage.getItem(KEY)||'light'}
  function apply(theme){
    document.documentElement.dataset.theme=theme;
    localStorage.setItem(KEY,theme);
    const b=document.getElementById('themeToggle');
    if(b){b.textContent=theme==='dark'?'☀️ Light mode':'🌙 Dark mode';b.setAttribute('aria-pressed',theme==='dark'?'true':'false')}
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',theme==='dark'?'#101722':'#17243a');
  }
  window.toggleTheme=function(){apply(document.documentElement.dataset.theme==='dark'?'light':'dark')};
  window.applyPrinceTheme=apply;
  apply(saved());
  document.addEventListener('DOMContentLoaded',()=>apply(saved()));
})();
