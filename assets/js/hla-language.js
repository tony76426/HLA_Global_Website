(()=>{'use strict';
  const root=document.querySelector('.hla-language');if(!root)return;
  const button=root.querySelector('.hla-language-trigger'),panel=root.querySelector('.hla-language-panel');
  const close=(focus=false)=>{panel.hidden=true;button.setAttribute('aria-expanded','false');if(focus)button.focus()};
  button.addEventListener('click',()=>{const open=panel.hidden;panel.hidden=!open;button.setAttribute('aria-expanded',String(open))});
  document.addEventListener('click',e=>{if(!root.contains(e.target))close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)close(true)});
  panel.querySelectorAll('a[data-lang]').forEach(a=>a.addEventListener('click',()=>{
    try{localStorage.setItem('hla-preferred-language',a.dataset.lang)}catch{}
  }));
  // Initial language choice follows the browser only if the visitor has not previously chosen.
  // Localized URL paths keep the selected language for all subsequent navigation.
  if(document.documentElement.lang==='zh-Hant-TW'&&!(location.pathname.includes('/en/')||location.pathname.includes('/ja/'))){
    let saved='';try{saved=localStorage.getItem('hla-preferred-language')||''}catch{}
    const inferred=saved||((navigator.language||'').toLowerCase().startsWith('ja')?'ja':(navigator.language||'').toLowerCase().startsWith('en')?'en':'zh');
    if(inferred==='en'||inferred==='ja'){
      const path=location.pathname, file=path.endsWith('/')?'index.html':path.split('/').pop();
      if(/^[a-z0-9-]+\.html$/.test(file)){
        const href=new URL(inferred+'/'+file,location.href);href.search=location.search;href.hash=location.hash;
        location.replace(href.href);
      }
    }
  }
  const input=document.querySelector('#locale-site-search,#locale-insights-search');
  if(input){
    const rows=[...document.querySelectorAll('.locale-search-result,.locale-list-article')],empty=document.querySelector('#locale-no-results');
    const filter=()=>{
      const q=input.value.toLocaleLowerCase().trim();let count=0;
      rows.forEach(a=>{const text=(a.dataset.search||a.textContent).toLocaleLowerCase();const visible=!q||text.includes(q);a.hidden=!visible;if(visible)count++});
      if(empty)empty.hidden=count!==0;
    };
    input.addEventListener('input',filter);
    const q=new URLSearchParams(location.search).get('q');if(q){input.value=q;filter()}
  }
})();