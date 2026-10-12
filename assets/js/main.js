(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const page = document.body.dataset.page;
  const config = window.HLA_CONFIG || {};
  const lineWidget = $('.line-widget');
  if (lineWidget) {
    const trigger = $('.line-float-btn', lineWidget);
    const panel = $('#line-popover');
    const closeLine = (restore=false) => {
      panel.hidden = true;
      trigger.setAttribute('aria-expanded','false');
      if (restore) trigger.focus();
    };
    trigger.addEventListener('click', e => {
      if (window.matchMedia('(max-width: 900px)').matches) return;
      e.preventDefault();
      const open = panel.hidden;
      panel.hidden = !open;
      trigger.setAttribute('aria-expanded',String(open));
      if (open) $('.line-popover-close', panel).focus();
    });
    $('.line-popover-close', panel).addEventListener('click', () => closeLine(true));
    document.addEventListener('keydown', e => {if(e.key==='Escape'&&!panel.hidden)closeLine(true)});
    document.addEventListener('click', e => {if(!lineWidget.contains(e.target))closeLine()});
    window.matchMedia('(max-width: 900px)').addEventListener('change', () => closeLine());
  }
  if (config.contactEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.contactEmail)) {
    const target = $('#contact-email');
    if (target) {
      const a=document.createElement('a');a.href=`mailto:${config.contactEmail}`;a.textContent=config.contactEmail;
      target.replaceWith(a);
    }
  }

  const toggle = $('.menu-toggle');
  const mobile = $('#mobile-nav');
  if (toggle && mobile) {
    const close = () => { mobile.hidden = true; document.body.classList.remove('nav-open'); toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', '開啟選單'); };
    toggle.addEventListener('click', () => {
      const open = mobile.hidden;
      mobile.hidden = !open;
      document.body.classList.toggle('nav-open',open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
    });
    $$('a', mobile).forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !mobile.hidden) { close(); toggle.focus(); } });
    window.matchMedia('(min-width: 1181px)').addEventListener('change', e => { if (e.matches) close(); });
  }

  const hero = $('.home-hero');
  if (hero) {
    const slider = $('.hero-slider', hero);
    const slides = $$('.hero-slide', hero);
    const prefersStill = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0, timer = null, inView = !('IntersectionObserver' in window);
    const stop = () => { if (timer !== null) { clearInterval(timer); timer = null; } };
    const show = index => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
    };
    const start = () => {
      stop();
      const keyboardFocus = hero.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
      if (inView && !document.hidden && !prefersStill.matches && !keyboardFocus) {
        timer = setInterval(() => show(current + 1), 6500);
      }
    };
    slider.classList.add('is-enhanced');
    hero.addEventListener('focusin', stop);
    hero.addEventListener('focusout', () => setTimeout(start, 0));
    document.addEventListener('visibilitychange', start);
    prefersStill.addEventListener?.('change', start);
    if ('IntersectionObserver' in window) {
    const visible = new IntersectionObserver(entries => {
        inView = entries.some(entry => entry.isIntersecting);
        if (inView) start(); else stop();
      }, {threshold: .15});
      visible.observe(hero);
    }
  }

  function activate(buttons, selected) {
    buttons.forEach(b => {
      const on = b === selected;
      b.classList.toggle('active', on);
      if (b.hasAttribute('aria-selected')) b.setAttribute('aria-selected', String(on));
      if (b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', String(on));
    });
  }
  $$('.filter-chips button').forEach(b => b.setAttribute('aria-pressed', String(b.classList.contains('active'))));
  $$('[role="tablist"]').forEach(list => list.addEventListener('keydown', e => {
    const tabs = $$('[role="tab"]', list);
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const next = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? (i+1)%tabs.length
      : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? (i-1+tabs.length)%tabs.length
      : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length-1 : -1;
    if (next >= 0) { e.preventDefault(); tabs[next].focus(); tabs[next].click(); }
  }));

  const methodTabs = $$('.method-tab');
  if (methodTabs.length) {
    const method = [
      ['理解問題的全貌','釐清事實、目標與限制。先取得共同的事實基礎，才有下一步的分析。'],
      ['分析權利與證據','對照法律關係、文件與程序，辨識尚待確認的資料及主要風險。'],
      ['制定可比較的策略','把時間、成本、風險與期待結果放在一起，安排處理優先順序。'],
      ['讓策略進入執行','讓文件、協商與程序對應既定目標，並維持清楚的溝通節奏。'],
      ['持續檢視並前進','隨新的資料、對方回應或程序進度，重新評估下一步。']
    ];
    methodTabs.forEach(b => b.addEventListener('click', () => {
      const i = Number(b.dataset.step);
      activate(methodTabs, b);
      $('#method-index').textContent = `0${i + 1} / 05`;
      $('#method-title').textContent = method[i][0];
      $('#method-detail').textContent = method[i][1];
    }));
  }

  const stages = {
    P05: ['選擇組織與股權結構，確認設立文件及權限。','梳理決策程序、契約管理與內部治理。','確認交易條件、風險分配與交割文件。','將法務節點納入日常營運與商業決策。','以事實、證據與目標規劃爭議處理。'],
    P06: ['盤點主張、證據與可接受的解決條件。','評估財產保全、時效與程序急迫性。','以爭點與證據支持可執行的協議。','規劃舉證、程序與攻防的先後順序。','確認判決或協議後的實際實現路徑。'],
    P07: ['辨識交易、資產與當事人所在法域。','確認爭議處理條款與可選擇的程序。','辨識可能適用的法律與文件需求。','按個案需要確認外部專業支援。','評估判斷結果的承認與執行條件。'],
    P08: ['查核登記、權源、共有及負擔。','確認租賃、使用與管理約定。','對照契約、付款、移轉與交屋節點。','整理建築、合作與許可文件。','評估協商、訴訟與執行方式。'],
    P09: ['立即保存資料並確認程序權利及期限。','整理卷證、起訴範圍與主要爭點。','依證據調查與程序進度調整攻防。','確認法定期間、理由與可提出資料。'],
    P10: ['釐清當事人、照顧需求與長期關係。','盤點財產、負債與權利歸屬。','整理身分、財產與既有約定文件。','兼顧程序、溝通與實際可行性。','形成可理解、可執行的長期安排。'],
    P11: ['確認職務需求與招募資訊。','檢視契約、規則及工作條件。','建立可追溯的評估與溝通紀錄。','確認職務、薪資與程序安排。','對照事實、文件與法定程序。','評估協商、調解與訴訟路徑。'],
    P12: ['辨識成果、權利人與創作紀錄。','選擇適合的保護及保密安排。','規劃授權範圍、期限與使用限制。','把資料及平台條款納入產品流程。','處理侵權證據與救濟選項。']
  };
  const stage = $('.stage-module');
  if (stage) {
    const buttons = $$('.stage-tabs button', stage);
    stage.style.setProperty('--stage-progress', `${100 / buttons.length}%`);
    buttons.forEach(b => b.addEventListener('click', () => {
      const i = Number(b.dataset.index);
      activate(buttons, b);
      buttons.forEach(tab => { tab.tabIndex = tab === b ? 0 : -1; });
      const panel = $('.stage-detail',stage);
      panel.setAttribute('aria-labelledby', b.id);
      stage.style.setProperty('--stage-progress', `${100 * (i + 1) / buttons.length}%`);
      $('#stage-number').textContent = `${String(i + 1).padStart(2,'0')} / ${String(buttons.length).padStart(2,'0')}`;
      $('#stage-title').textContent = b.dataset.title;
      $('#stage-copy').textContent = stages[stage.dataset.stage][i];
      $('#stage-focus-copy').textContent = b.dataset.focus;
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        panel.classList.remove('is-switching');
        void panel.offsetWidth;
        panel.classList.add('is-switching');
      }
    }));
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const revealNodes = $$('.section-heading, .practice-situation-grid a, .practice-official-grid > div, .practice-signature .signature-heading, .practice-signature .signature-heading + div, .feature-links a, .reason-grid article, .official-values article, .journey-flow li, .entry-roadmap li, .global-tracks li, .prep-checklist li');
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          reveal.unobserve(entry.target);
        }
      });
    }, {rootMargin:'0px 0px -7% 0px',threshold:.08});
    revealNodes.forEach(el => {
      const siblings=[...el.parentElement.children];
      el.style.setProperty('--reveal-delay',`${Math.min(siblings.indexOf(el),3)*75}ms`);
      el.classList.add('reveal-item');
      reveal.observe(el);
    });
    document.documentElement.classList.add('motion-ready');
    const signature=$('.practice-signature');
    if (signature) {
      const lines=new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {signature.classList.add('signature-active');lines.disconnect();}
        });
      },{threshold:.1});
      lines.observe(signature);
    }
    const journey=$('.journey-container');
    if (journey) {
      const route=new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          journey.classList.add('is-visible');
          route.disconnect();
        }
      },{threshold:.15});
      route.observe(journey);
    }
    const collaboration=$('.collab-path');
    if (collaboration) {
      $$('.collab-path li').forEach((node,i)=>node.style.setProperty('--stage',i));
      const draw=new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          collaboration.classList.add('is-visible');
          draw.disconnect();
        }
      },{threshold:.18});
      draw.observe(collaboration);
    }
  }
  const lawaiFlow=$$('.lawai-flow-track button');
  if (lawaiFlow.length) {
    const phases=[
      ['INPUT','提出問題','用自己的話說明經過、角色與目前最急迫的決定。'],
      ['ORGANIZE','AI 協助整理','初步區分時序、資料與尚待確認的空白。'],
      ['ISSUES','辨識爭點','把混在敘述中的不同問題拆成可核對的清單。'],
      ['REVIEW','律師判斷','由律師檢視來源、法律適用與程序選項。'],
      ['ACTION','下一步','依目標、時程與風險安排後續聯繫或服務。']
    ];
    lawaiFlow.forEach(button=>button.addEventListener('click',()=>{
      const i=Number(button.dataset.flow), [label,title,copy]=phases[i];
      activate(lawaiFlow,button);
      lawaiFlow.forEach(tab=>{tab.tabIndex=tab===button?0:-1;});
      const panel=$('#lawai-flow-panel');
      panel.setAttribute('aria-labelledby',button.id);
      $('#lawai-flow-index').textContent=`0${i+1} / 05 · ${label}`;
      $('#lawai-flow-title').textContent=title;
      $('#lawai-flow-copy').textContent=copy;
      $('.lawai-flow-meter span').style.width=`${(i+1)*20}%`;
    }));
  }
  const practiceAnchors=$$('.practice-anchor-nav a');
  if (practiceAnchors.length && 'IntersectionObserver' in window) {
    const sections=practiceAnchors.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const activeSection=new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        practiceAnchors.forEach(a => a.removeAttribute('aria-current'));
        const target=practiceAnchors.find(a => a.getAttribute('href')===`#${entry.target.id}`);
        if (target) target.setAttribute('aria-current','location');
      });
    },{rootMargin:'-150px 0px -55% 0px',threshold:0});
    sections.forEach(s => activeSection.observe(s));
  }

  const practiceFilter = $('[data-filter="practice"]');
  if (practiceFilter) {
    const buttons = $$('button', practiceFilter);
    const cards = $$('.practice-grid-wrap .practice-card');
    buttons.forEach(b => b.addEventListener('click', () => {
      activate(buttons, b);
      let count = 0;
      cards.forEach(c => { const show = b.dataset.value === '全部' || c.dataset.groups.split(',').includes(b.dataset.value); c.hidden = !show; count += show ? 1 : 0; });
      $('.filter-count').textContent = `顯示 ${count} 個專業領域`;
    }));
  }

  const peopleSearch = $('#people-search');
  if (peopleSearch) peopleSearch.addEventListener('input', () => {
    let count = 0;
    $$('.person-card').forEach(c => { const show = c.dataset.person.includes(peopleSearch.value.trim()); c.hidden = !show; count += show ? 1 : 0; });
    $('#people-count').textContent = `${count} 位團隊成員`;
  });

  const insightFilter = $('[data-filter="insights"]');
  if (insightFilter) {
    const buttons = $$('button', insightFilter);
    buttons.forEach(b => b.addEventListener('click', () => {
      activate(buttons, b);
      $$('#insight-list .article-card').forEach(c => { c.hidden = b.dataset.value !== '全部' && c.dataset.category !== b.dataset.value; });
    }));
  }
  const categoryFilter = $('[data-filter="category"]');
  if (categoryFilter) {
    const buttons = $$('button', categoryFilter);
    buttons.forEach(b => b.addEventListener('click', () => {
      activate(buttons, b);
      $$('#category-list a').forEach(c => { c.hidden = b.dataset.value !== '全部' && c.dataset.category !== b.dataset.value; });
    }));
    $('#category-sort')?.addEventListener('change', e => {
      const parent = $('#category-list');
      const cards = $$('a', parent);
      if (e.target.value === 'title') cards.sort((a,b) => a.textContent.localeCompare(b.textContent,'zh-Hant'));
      else cards.sort((a,b) => Number(a.dataset.original) - Number(b.dataset.original));
      cards.forEach((c,i) => { if (!c.dataset.original) c.dataset.original = String(i); parent.append(c); });
    });
  }

  const exButtons = $$('.example-tabs button');
  if (exButtons.length) {
    const examples = [
      ['原始問題','「合作契約已簽署，對方延遲交付，我們接下來該怎麼做？」'],
      ['事實整理','已簽約／交付時間約定／目前交付狀態／已往來訊息。仍需核對契約版本與通知紀錄。'],
      ['時間軸','簽約 → 約定交付日 → 催告或溝通 → 現在。各時點皆應對照文件。'],
      ['待確認爭點','交付義務、通知方式、可選擇的救濟與實際目標。由律師依完整資料判斷。']
    ];
    exButtons.forEach(b => b.addEventListener('click', () => {
      const i = Number(b.dataset.example);
      activate(exButtons, b);
      $('#example-label').textContent = `EXAMPLE / 0${i + 1}`;
      $('#example-title').textContent = examples[i][0];
      $('#example-copy').textContent = examples[i][1];
    }));
  }

  const searchField = $('#site-search');
  if (searchField) {
    const list = window.HLA_SEARCH_INDEX || [];
    const params = new URLSearchParams(location.search);
    searchField.value = params.get('q') || '';
    const chips = $$('[data-filter="search"] button');
    let type = '全部';
    const results = $('#search-results');
    const status = $('#search-status');
    const safe = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const render = () => {
      const q = searchField.value.trim().toLocaleLowerCase();
      const found = list.filter(x => (type === '全部' || x.type === type) && (!q || (x.title + ' ' + x.description).toLocaleLowerCase().includes(q))).slice(0, 30);
      status.textContent = q ? `「${searchField.value.trim()}」找到 ${found.length} 項結果` : `建議瀏覽 ${found.length} 項內容`;
      results.innerHTML = found.map(x => `<a href="${safe(x.url)}"><small>${safe(x.type)}</small><h2>${safe(x.title)}</h2><p>${safe(x.description)}</p></a>`).join('') || '<p>沒有相符內容。請換個關鍵字，或瀏覽專業領域。</p>';
    };
    searchField.addEventListener('input', render);
    chips.forEach(b => b.addEventListener('click', () => { type = b.dataset.value; activate(chips,b); render(); }));
    $('#clear-search').addEventListener('click', () => { searchField.value=''; searchField.focus(); render(); });
    render();
  }

  if (page === 'P19') {
    const progress = $('#reading-progress');
    const update = () => { const max = document.documentElement.scrollHeight - window.innerHeight; progress.style.width = `${max ? Math.min(100,100 * window.scrollY / max) : 0}%`; };
    addEventListener('scroll', update, {passive:true}); update();
    $('#copy-link')?.addEventListener('click', async e => {
      const button = e.currentTarget;
      try { await navigator.clipboard.writeText(location.href); button.textContent = '已複製連結'; }
      catch { button.textContent = '請從網址列複製連結'; }
    });
    const tocLinks=$$('.article-toc a');
    if (tocLinks.length) {
      const sections=tocLinks.map(link => $(link.getAttribute('href'))).filter(Boolean);
      const setActive=section => tocLinks.forEach(link => {
        if (link.getAttribute('href')===`#${section.id}`) link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      });
      let scheduled=false;
      const refreshToc=() => {
        scheduled=false;
        const padding=parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)||0;
        let current=sections[0];
        sections.forEach(section => {
          const margin=parseFloat(getComputedStyle(section).scrollMarginTop)||0;
          if(section.getBoundingClientRect().top<=padding+margin+8)current=section;
        });
        if(current)setActive(current);
      };
      const queueToc=() => {if(!scheduled){scheduled=true;requestAnimationFrame(refreshToc)}};
      addEventListener('scroll',queueToc,{passive:true});
      addEventListener('resize',queueToc);
      queueToc();
    }
  }

  const form = $('#intake-form');
  if (form) {
    if (config.intakeMode !== 'api') {
      $('button[type="submit"]',form).textContent='下載諮詢摘要 ↗';
    }
    const panels = $$('.form-step', form);
    const progress = $$('.form-progress span');
    let current = 0;
    const fields = ['name','email','phone','area','stage','message','agree'];
    const setStep = n => { current = n; panels.forEach((p,i) => p.classList.toggle('active',i===n)); progress.forEach((p,i) => p.classList.toggle('current',i===n)); $('.form-card').scrollIntoView({behavior:'smooth',block:'start'}); };
    const save = () => { try { const data={}; fields.forEach(k => { if (k !== 'agree') data[k] = form.elements[k].value; }); sessionStorage.setItem('hla-intake-draft', JSON.stringify(data)); } catch {} };
    try { const data = JSON.parse(sessionStorage.getItem('hla-intake-draft') || '{}'); fields.forEach(k => { if (k !== 'agree' && data[k]) form.elements[k].value=data[k]; }); } catch {}
    form.addEventListener('input', save);
    const validate = n => {
      const invalid = $$('[required]', panels[n]).find(el => !el.checkValidity());
      if (invalid) { $('.form-error',panels[n]).textContent = invalid.validity.valueMissing ? '請填寫此欄位。' : invalid.validity.typeMismatch ? '請輸入有效的電子郵件。' : invalid.validity.tooShort ? '請至少填寫 20 個字。' : '請確認欄位內容。'; invalid.focus(); return false; }
      $('.form-error',panels[n]).textContent=''; return true;
    };
    $$('.next-step',form).forEach(b => b.addEventListener('click', () => {
      if (!validate(current)) return;
      if (current === 1) {
        const summary = $('#intake-summary');
        summary.replaceChildren();
        [['姓名','name'],['電子郵件','email'],['電話','phone'],['領域','area'],['階段','stage'],['摘要','message']].forEach(([label,key]) => {
          const row=document.createElement('div'), title=document.createElement('b'), value=document.createElement(key==='message'?'pre':'span');
          title.textContent=label; value.textContent=form.elements[key].value || '—'; row.append(title,value); summary.append(row);
        });
      }
      setStep(current+1);
    }));
    $$('.prev-step',form).forEach(b => b.addEventListener('click', () => setStep(current-1)));
    form.addEventListener('submit', async e => {
      e.preventDefault(); if (!validate(2)) return;
      const payload=Object.fromEntries(['name','email','phone','area','stage','message'].map(k=>[k,form.elements[k].value.trim()]));
      const status=$('#intake-status'); const button=$('button[type="submit"]',form);
      if (config.intakeMode === 'api') {
        let endpoint;
        try { endpoint=new URL(config.intakeEndpoint); } catch {}
        if (!endpoint || endpoint.protocol !== 'https:') { status.textContent='收件設定有誤，請直接以電話或電子郵件聯繫。'; return; }
        if (button.disabled) return;
        button.disabled=true; status.textContent='正在送出，請稍候…';
        const controller=new AbortController();
        const timeout=setTimeout(()=>controller.abort(),Math.min(30000,Math.max(5000,config.intakeTimeoutMs||20000)));
        try {
          const response=await fetch(endpoint.href,{method:'POST',credentials:'omit',redirect:'error',signal:controller.signal,
            headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({...payload,privacyAccepted:true})});
          if (!response.ok || !(response.headers.get('content-type') || '').includes('application/json')) throw new Error('No confirmed receipt');
          const result=await response.json();
          if (result.ok !== true || !/^[A-Za-z0-9_-]{6,80}$/.test(result.receiptId || '')) throw new Error('No confirmed receipt');
          try { sessionStorage.removeItem('hla-intake-draft');sessionStorage.setItem('hla-intake-status','sent');sessionStorage.setItem('hla-intake-receipt',result.receiptId); } catch {}
          window.HLA_TRACK?.('submit_form',{mode:'api'},'intake-submit',undefined,true);
          window.HLA_TRACK?.('generate_lead',{mode:'api'},'intake',undefined,true);
          location.href='thank-you.html';
        } catch { window.HLA_TRACK?.('submit_form',{mode:'api'});status.textContent='目前未能確認收件，請稍後重試或直接致電／寄信；您的資料仍保留在此瀏覽器。'; button.disabled=false; }
        finally { clearTimeout(timeout); }
        return;
      }
      if (button.disabled) return;
      button.disabled=true;
      const lines=['理然法律諮詢摘要','建立時間：'+new Date().toLocaleString('zh-TW'),'','姓名：'+payload.name,'電子郵件：'+payload.email,'聯絡電話：'+payload.phone,'議題：'+payload.area,'階段：'+payload.stage,'','問題摘要：',payload.message,'','此檔案僅在本機建立，尚未送達事務所。'];
      const blob=new Blob(['\ufeff'+lines.join('\n')],{type:'text/plain;charset=utf-8'});
      const href=URL.createObjectURL(blob), a=document.createElement('a'); a.href=href; a.download='HLA_諮詢摘要.txt'; document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(href),30000);
      try { sessionStorage.removeItem('hla-intake-draft'); sessionStorage.setItem('hla-intake-status','draft'); } catch {}
      window.HLA_TRACK?.('submit_form',{mode:'summary'},'intake-summary',undefined,true);
      window.HLA_TRACK?.('download_intake_summary',{mode:'summary'},'intake',undefined,true);location.href='thank-you.html';
    });
  }
  let intakeStatus = '';
  if (page === 'P28') {
    try { intakeStatus=sessionStorage.getItem('hla-intake-status') || ''; sessionStorage.removeItem('hla-intake-status'); } catch {}
  }
  if (page === 'P28' && intakeStatus === 'draft') {
    $('#thank-title').textContent='諮詢摘要已建立';
    $('#thank-message').textContent='您的摘要已在瀏覽器中產生。請確認下載檔案；目前尚未透過網站送達事務所。';
  }
  if (page === 'P28' && intakeStatus === 'sent') {
    $('#thank-title').textContent='您的資料已送出';
    $('#thank-message').textContent='收件端點已回覆成功。請保留提交紀錄，後續聯絡仍依事務所實際收件安排。';
    try {
      const receipt=sessionStorage.getItem('hla-intake-receipt');sessionStorage.removeItem('hla-intake-receipt');
      if(receipt && /^[A-Za-z0-9_-]{6,80}$/.test(receipt)) {
        const note=document.createElement('p');note.textContent='收件編號：'+receipt;$('#thank-message').after(note);
      }
    } catch {}

  }
})();
