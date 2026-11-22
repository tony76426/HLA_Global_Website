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
    const close = () => { mobile.hidden = true; document.body.classList.remove('nav-open'); toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Open menu'); };
    toggle.addEventListener('click', () => {
      const open = mobile.hidden;
      mobile.hidden = !open;
      document.body.classList.toggle('nav-open',open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
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
      ['Understand the Entire Issue','Clarify the facts, objectives and constraints before proceeding to legal analysis.'],
      ['Analyze Rights and Evidence','Review legal relationships, documents and procedure; identify missing facts and major risks.'],
      ['Develop Comparable Strategies','Compare time, cost, risk and outcomes before setting priorities.'],
      ['Put the Strategy into Action','Align documents, negotiations and procedures with agreed objectives and regular communication.'],
      ['Review and Move Forward','Reassess the next steps as new information and procedural developments emerge.']
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
    P05: ['Select an entity and ownership structure; confirm formation documents and authority.','Review decision-making, contract management and internal governance.','Confirm transaction terms, risk allocation and closing documents.','Integrate legal review into everyday operations and decisions.','Plan dispute resolution around facts, evidence and objectives.'],
    P06: ['Review claims, evidence and acceptable settlement terms.','Assess asset preservation, limitation periods and urgent deadlines.','Support enforceable agreements with clear issues and evidence.','Plan the sequence of evidence, procedure and advocacy.','Confirm how any judgment or agreement will be implemented.'],
    P07: ['Identify the jurisdictions of parties, assets and transactions.','Review dispute clauses and available procedures.','Identify potentially applicable law and documents.','Coordinate external specialists when needed.','Assess recognition and enforcement of outcomes.'],
    P08: ['Check registered rights, title, co-ownership and encumbrances.','Review lease, use and management arrangements.','Review contracts, payments, transfer and handover dates.','Gather construction, cooperation and permit documents.','Assess negotiation, litigation and enforcement.'],
    P09: ['Preserve evidence immediately and check rights and deadlines.','Organize the case file, charges and key issues.','Adjust the case strategy as evidence and proceedings evolve.','Confirm statutory periods, grounds and supporting documents.'],
    P10: ['Identify parties, caregiving needs and long-term relationships.','Inventory assets, debts and ownership.','Collect identity, property and existing agreement records.','Consider procedures, communication and practicality.','Develop understandable and workable long-term arrangements.'],
    P11: ['Confirm job requirements and recruitment information.','Review contracts, workplace rules and conditions.','Maintain traceable evaluations and communications.','Confirm roles, pay and procedures.','Check facts, documents and statutory procedure.','Assess negotiation, mediation and litigation.'],
    P12: ['Identify works, rights holders and creation records.','Select protection and confidentiality arrangements.','Plan license scope, duration and restrictions.','Integrate data and platform terms into product development.','Review infringement evidence and remedies.']
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
      ['INPUT','Describe the Question','Describe the background, your role and the most pressing decision.'],
      ['ORGANIZE','AI-Assisted Organization','Separate the timeline, documents and missing details.'],
      ['ISSUES','Identify Legal Issues','Break the narrative into issues that can be verified.'],
      ['REVIEW','Attorney Review','A lawyer reviews sources, applicable law and procedural options.'],
      ['ACTION','Next Steps','Arrange follow-up according to objectives, timing and risk.']
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
      $('.filter-count').textContent = `${count} practice areas shown`;
    }));
  }

  const peopleSearch = $('#people-search');
  if (peopleSearch) peopleSearch.addEventListener('input', () => {
    let count = 0;
    $$('.person-card').forEach(c => { const show = (c.dataset.person+' '+c.textContent).toLocaleLowerCase().includes(peopleSearch.value.trim().toLocaleLowerCase()); c.hidden = !show; count += show ? 1 : 0; });
    $('#people-count').textContent = `${count} team members`;
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
      if (e.target.value === 'title') cards.sort((a,b) => a.textContent.localeCompare(b.textContent,'en-US'));
      else cards.sort((a,b) => Number(a.dataset.original) - Number(b.dataset.original));
      cards.forEach((c,i) => { if (!c.dataset.original) c.dataset.original = String(i); parent.append(c); });
    });
  }

  const exButtons = $$('.example-tabs button');
  if (exButtons.length) {
    const examples = [
      ['Original Question','“Our counterparty is late delivering under a signed contract. What should we do next?”'],
      ['Fact Summary','Signed contract, delivery deadline, current status and correspondence. Contract versions and notices still need checking.'],
      ['Timeline','Signing → Due date → Notices or negotiations → Current status. Match each stage to documents.'],
      ['Issues to Verify','Delivery obligations, notices, potential remedies and desired outcome. Counsel reviews the full record.']
    ];
    exButtons.forEach(b => b.addEventListener('click', () => {
      const i = Number(b.dataset.example);
      activate(exButtons, b);
      $('#example-label').textContent = `EXAMPLE / 0${i + 1}`;
      $('#example-title').textContent = examples[i][0];
      $('#example-copy').textContent = examples[i][1];
    }));
  }

  const searchTypeLabels = {"其他": "Other", "專業領域": "Practice Areas", "法律觀點": "Legal Insights", "律師團隊": "Our Lawyers", "家事與財富": "Family & Succession", "不動產": "Real Estate", "企業與商務": "Business Law"};
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
      status.textContent = q ? `${found.length} results for “${searchField.value.trim()}”` : `${found.length} suggested pages`;
      results.innerHTML = found.map(x => `<a href="${safe(x.url)}"><small>${safe(searchTypeLabels[x.type] || x.type)}</small><h2>${safe(x.title)}</h2><p>${safe(x.description)}</p></a>`).join('') || '<p>No matching results. Try another keyword or explore our practice areas.</p>';
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
      try { await navigator.clipboard.writeText(location.href); button.textContent = 'Link Copied'; }
      catch { button.textContent = 'Please copy the URL from the address bar.'; }
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
      $('button[type="submit"]',form).textContent='Download Consultation Summary ↗';
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
      if (invalid) { $('.form-error',panels[n]).textContent = invalid.validity.valueMissing ? 'Please complete this field.' : invalid.validity.typeMismatch ? 'Please enter a valid email address.' : invalid.validity.tooShort ? 'Please enter at least 20 characters.' : 'Please check this field.'; invalid.focus(); return false; }
      $('.form-error',panels[n]).textContent=''; return true;
    };
    $$('.next-step',form).forEach(b => b.addEventListener('click', () => {
      if (!validate(current)) return;
      if (current === 1) {
        const summary = $('#intake-summary');
        summary.replaceChildren();
        [['Name','name'],['Email','email'],['Phone','phone'],['Practice Area','area'],['Current Stage','stage'],['Summary','message']].forEach(([label,key]) => {
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
        if (!endpoint || endpoint.protocol !== 'https:') { status.textContent='The submission service is unavailable. Please call or email us.'; return; }
        if (button.disabled) return;
        button.disabled=true; status.textContent='Submitting…';
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
        } catch { window.HLA_TRACK?.('submit_form',{mode:'api'});status.textContent='We could not confirm delivery. Please retry or contact us directly. Your entries remain in this browser.'; button.disabled=false; }
        finally { clearTimeout(timeout); }
        return;
      }
      if (button.disabled) return;
      button.disabled=true;
      const lines=['HLA Legal Consultation Summary','Created: '+new Date().toLocaleString('en-US'),'','Name: '+payload.name,'Email: '+payload.email,'Phone: '+payload.phone,'Matter: '+payload.area,'Stage: '+payload.stage,'','Case Summary:',payload.message,'','This file was created locally and has not been sent to the firm.'];
      const blob=new Blob(['\ufeff'+lines.join('\n')],{type:'text/plain;charset=utf-8'});
      const href=URL.createObjectURL(blob), a=document.createElement('a'); a.href=href; a.download='HLA_Consultation_Summary.txt'; document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(href),30000);
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
    $('#thank-title').textContent='Consultation Summary Created';
    $('#thank-message').textContent='Your summary was created in your browser. Please confirm the downloaded file; it has not been sent to our office.';
  }
  if (page === 'P28' && intakeStatus === 'sent') {
    $('#thank-title').textContent='Your Submission Was Sent';
    $('#thank-message').textContent='Our submission service reported success. Keep your receipt and await our office’s follow-up.';
    try {
      const receipt=sessionStorage.getItem('hla-intake-receipt');sessionStorage.removeItem('hla-intake-receipt');
      if(receipt && /^[A-Za-z0-9_-]{6,80}$/.test(receipt)) {
        const note=document.createElement('p');note.textContent='Receipt ID: '+receipt;$('#thank-message').after(note);
      }
    } catch {}

  }
})();
