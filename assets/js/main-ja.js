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
    const close = () => { mobile.hidden = true; document.body.classList.remove('nav-open'); toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'メニューを開く'); };
    toggle.addEventListener('click', () => {
      const open = mobile.hidden;
      mobile.hidden = !open;
      document.body.classList.toggle('nav-open',open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
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
      ['課題の全体像を把握','事実、目標、制約を明確にしてから、法律分析に進みます。'],
      ['権利と証拠を分析','法律関係、資料、手続を確認し、不足情報と主なリスクを特定します。'],
      ['複数の戦略を検討','期間、費用、リスク、想定結果を比較して優先順位を定めます。'],
      ['方針を実行へ','書類、交渉、手続を目標に沿って進め、明確な連絡を保ちます。'],
      ['継続的に見直す','新たな資料や相手方の対応、手続の進捗に応じて方針を再検討します。']
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
    P05: ['会社形態と持株構成を選び、設立書類と権限を確認します。','意思決定、契約管理、内部統治を整理します。','取引条件、リスク分担、クロージング書類を確認します。','日々の業務や経営判断に法務確認を組み込みます。','事実、証拠、目標に基づき紛争対応を検討します。'],
    P06: ['主張、証拠、受け入れ可能な解決条件を整理します。','財産保全、消滅時効、手続の緊急性を確認します。','争点と証拠に基づき履行可能な合意を検討します。','立証、手続、主張の順序を計画します。','判決や合意の履行方法を確認します。'],
    P07: ['当事者、資産、取引に関係する法域を特定します。','紛争解決条項と利用可能な手続を確認します。','適用され得る法令と必要書類を確認します。','必要に応じて外部専門家と連携します。','判断結果の承認・執行条件を確認します。'],
    P08: ['登記、権原、共有、負担を確認します。','賃貸借、利用、管理の合意を確認します。','契約、支払、移転、引渡しの節目を確認します。','建築、協力、許可関連書類を整理します。','交渉、訴訟、執行の方法を検討します。'],
    P09: ['直ちに資料を保全し、手続上の権利と期限を確認します。','事件記録、起訴範囲、主な争点を整理します。','証拠調べと手続の進行に応じて方針を調整します。','法定期間、理由、提出可能な資料を確認します。'],
    P10: ['当事者、養育・介護の必要、長期的な関係を確認します。','財産、債務、権利帰属を確認します。','身分、財産、既存合意に関する資料を整理します。','手続、連絡調整、実現可能性を併せて検討します。','理解しやすく実行可能な長期的取り決めを目指します。'],
    P11: ['業務内容と採用条件を確認します。','雇用契約、就業規則、労働条件を確認します。','評価と連絡の記録を追跡できる形で残します。','職務、賃金、手続を確認します。','事実、資料、法定手続を照合します。','交渉、調停、訴訟の選択肢を検討します。'],
    P12: ['成果物、権利者、制作記録を確認します。','権利保護と秘密保持の方法を検討します。','許諾範囲、期間、利用制限を整理します。','データとプラットフォーム規約を開発工程に組み込みます。','侵害の証拠と救済手段を検討します。']
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
      ['入力','質問の入力','経緯、立場、今最も急ぐ判断を自分の言葉で説明します。'],
      ['整理','AIによる整理','時系列、資料、不明点を整理します。'],
      ['論点','論点を特定','説明に含まれる論点を確認可能な項目に分けます。'],
      ['判断','弁護士による判断','弁護士が資料の出所、適用法、手続上の選択肢を確認します。'],
      ['対応','次の対応','目的、期間、リスクに応じて次の対応を検討します。']
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
      $('.filter-count').textContent = `${count}件の分野を表示`;
    }));
  }

  const peopleSearch = $('#people-search');
  if (peopleSearch) peopleSearch.addEventListener('input', () => {
    let count = 0;
    $$('.person-card').forEach(c => { const show = (c.dataset.person+' '+c.textContent).toLocaleLowerCase().includes(peopleSearch.value.trim().toLocaleLowerCase()); c.hidden = !show; count += show ? 1 : 0; });
    $('#people-count').textContent = `${count}名の弁護士`;
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
      if (e.target.value === 'title') cards.sort((a,b) => a.textContent.localeCompare(b.textContent,'ja-JP'));
      else cards.sort((a,b) => Number(a.dataset.original) - Number(b.dataset.original));
      cards.forEach((c,i) => { if (!c.dataset.original) c.dataset.original = String(i); parent.append(c); });
    });
  }

  const exButtons = $$('.example-tabs button');
  if (exButtons.length) {
    const examples = [
      ['元の質問','「契約を締結しましたが相手方が納品を遅延しています。どう対応すべきでしょうか。」'],
      ['事実関係の整理','契約締結、納期、現在の状況、連絡記録を整理し、契約書の版と通知内容を確認します。'],
      ['時系列','契約締結 → 納期 → 催告・協議 → 現在。各時点を書類で確認します。'],
      ['要確認の論点','引渡義務、通知方法、救済手段、目標を資料に基づき弁護士が検討します。']
    ];
    exButtons.forEach(b => b.addEventListener('click', () => {
      const i = Number(b.dataset.example);
      activate(exButtons, b);
      $('#example-label').textContent = `EXAMPLE / 0${i + 1}`;
      $('#example-title').textContent = examples[i][0];
      $('#example-copy').textContent = examples[i][1];
    }));
  }

  const searchTypeLabels = {"其他": "その他", "專業領域": "取扱分野", "法律觀點": "法律コラム", "律師團隊": "弁護士紹介", "家事與財富": "家事・相続", "不動產": "不動産", "企業與商務": "企業法務"};
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
      status.textContent = q ? `「${searchField.value.trim()}」の検索結果：${found.length}件` : `おすすめ：${found.length}件`;
      results.innerHTML = found.map(x => `<a href="${safe(x.url)}"><small>${safe(searchTypeLabels[x.type] || x.type)}</small><h2>${safe(x.title)}</h2><p>${safe(x.description)}</p></a>`).join('') || '<p>一致する結果がありません。検索語を変更するか、取扱分野をご覧ください。</p>';
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
      try { await navigator.clipboard.writeText(location.href); button.textContent = 'リンクをコピーしました'; }
      catch { button.textContent = 'アドレスバーからURLをコピーしてください。'; }
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
      $('button[type="submit"]',form).textContent='相談概要をダウンロード ↗';
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
      if (invalid) { $('.form-error',panels[n]).textContent = invalid.validity.valueMissing ? 'この項目を入力してください。' : invalid.validity.typeMismatch ? '有効なメールアドレスを入力してください。' : invalid.validity.tooShort ? '20文字以上入力してください。' : '入力内容をご確認ください。'; invalid.focus(); return false; }
      $('.form-error',panels[n]).textContent=''; return true;
    };
    $$('.next-step',form).forEach(b => b.addEventListener('click', () => {
      if (!validate(current)) return;
      if (current === 1) {
        const summary = $('#intake-summary');
        summary.replaceChildren();
        [['氏名','name'],['メール','email'],['電話','phone'],['法律分野','area'],['現在の段階','stage'],['概要','message']].forEach(([label,key]) => {
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
        if (!endpoint || endpoint.protocol !== 'https:') { status.textContent='送信設定に問題があります。電話またはメールでご連絡ください。'; return; }
        if (button.disabled) return;
        button.disabled=true; status.textContent='送信中…';
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
        } catch { window.HLA_TRACK?.('submit_form',{mode:'api'});status.textContent='送信確認ができませんでした。再試行するか直接ご連絡ください。入力内容はブラウザに残っています。'; button.disabled=false; }
        finally { clearTimeout(timeout); }
        return;
      }
      if (button.disabled) return;
      button.disabled=true;
      const lines=['HLA法律相談の概要','作成日時：'+new Date().toLocaleString('ja-JP'),'','氏名：'+payload.name,'メール：'+payload.email,'電話：'+payload.phone,'ご相談分野：'+payload.area,'現在の段階：'+payload.stage,'','ご相談内容：',payload.message,'','このファイルは端末内で作成されたもので、事務所には送信されていません。'];
      const blob=new Blob(['\ufeff'+lines.join('\n')],{type:'text/plain;charset=utf-8'});
      const href=URL.createObjectURL(blob), a=document.createElement('a'); a.href=href; a.download='HLA_相談概要.txt'; document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(href),30000);
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
    $('#thank-title').textContent='相談概要を作成しました';
    $('#thank-message').textContent='相談概要をブラウザで作成しました。ダウンロードをご確認ください。事務所にはまだ送信されていません。';
  }
  if (page === 'P28' && intakeStatus === 'sent') {
    $('#thank-title').textContent='送信が完了しました';
    $('#thank-message').textContent='送信先から成功の応答がありました。受付記録を保存し、事務所からの連絡をご確認ください。';
    try {
      const receipt=sessionStorage.getItem('hla-intake-receipt');sessionStorage.removeItem('hla-intake-receipt');
      if(receipt && /^[A-Za-z0-9_-]{6,80}$/.test(receipt)) {
        const note=document.createElement('p');note.textContent='受付番号：'+receipt;$('#thank-message').after(note);
      }
    } catch {}

  }
})();
