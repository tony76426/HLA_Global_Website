/* HLA: one consent-gated event owner. No form values or search terms enter analytics. */
(() => {
  'use strict';
  if (window.HLA_TRACK) return;
  const config = window.HLA_CONFIG || {};
  const analytics = config.analytics || {};
  const canonical = document.querySelector('link[rel="canonical"]')?.href;
  const formal = new URL(config.baseUrl || 'https://www.hlaglobal.com.tw/');
  const pagePath = new URL(canonical || location.href).pathname;
  const pageLocation = formal.origin + pagePath;
  const id = analytics.measurementId || '';
  const enabled = analytics.enabled === true && /^G-[A-Z0-9]+$/.test(id) && location.origin === formal.origin;
  // GA4's remotely configured enhanced measurement can read the actual query string,
  // even when page_location is sanitized. Only fixed public category URLs are allowed.
  const publicCategories = new Set(['全部','家事與財富','不動產','刑事程序','企業與投資','民商爭議','跨境','勞動','智慧財產與科技']);
  const query = new URLSearchParams(location.search);
  const safeQuery = !location.search || ([...query].length === 1 && query.has('category') && publicCategories.has(query.get('category')));
  const canCollect = enabled && safeQuery;
  const permitted = new Set(['click_line','click_phone','click_email','click_consult','start_form',
    'submit_form','generate_lead','download_intake_summary','view_lawyer','view_practice',
    'site_search','article_to_service','article_to_lawyer']);
  const practiceFiles = new Set(['corporate.html','disputes.html','cross-border.html','real-estate.html',
    'criminal.html','family-wealth.html','employment.html','ip-technology.html']);
  const lawyerFiles = new Set(['li-hsin-ting.html','liu-tien-hsi.html','cheng-tien-hao.html']);
  const targetFiles = new Set([...practiceFiles,...lawyerFiles,'consultation.html']);
  const pageFile = pagePath.split('/').pop() || 'index.html';
  let consent = false, booted = false;
  const once = new Set();
  try { consent = localStorage.getItem('hla-analytics-consent-v1') === 'granted'; } catch {}
  const pendingKey = 'hla-analytics-arrival-v3';
  let arrivalEvents = [];
  try {
    const pending = JSON.parse(sessionStorage.getItem(pendingKey) || '[]');
    sessionStorage.removeItem(pendingKey);
    const status = sessionStorage.getItem('hla-intake-status');
    if (pageFile === 'thank-you.html' && consent && Array.isArray(pending)) {
      arrivalEvents = pending.filter(item => item && ['submit_form','generate_lead','download_intake_summary'].includes(item.name)
        && ['api','summary'].includes(item.mode) && Number.isFinite(item.at) && Date.now()-item.at>=0 && Date.now()-item.at<300000
        && ((item.mode==='api' && status==='sent') || (item.mode==='summary' && status==='draft'))
        && (item.name!=='generate_lead' || item.mode==='api'));
    }
  } catch {}
  function safeReferrer() {
    try { return document.referrer ? new URL(document.referrer).origin + '/' : ''; } catch { return ''; }
  }
  function clean(name, data) {
    // Explicit allowlist: no arbitrary strings, email, phone, query, title or user input.
    const result = {page_path: pagePath};
    if (['direct','qr','navigation','summary','api'].includes(data.mode)) result.interaction_mode = data.mode;
    if (['header','footer','floating','article','main'].includes(data.position)) result.link_position = data.position;
    if (['全部','專業領域','律師','文章','其他'].includes(data.search_category)) result.search_category = data.search_category;
    if (Number.isInteger(data.result_count)) result.result_count = Math.max(0,Math.min(1000,data.result_count));
    if (typeof data.target_path === 'string' && targetFiles.has(data.target_path.slice(1)) && data.target_path.startsWith('/')) result.target_path = data.target_path;
    return result;
  }
  function google(name, params, complete) {
    if (!canCollect || !consent || !booted || !window.gtag) { complete?.(); return; }
    window.gtag('event',name,{...params,page_location:pageLocation,page_referrer:safeReferrer(),
      ...(typeof complete === 'function' ? {event_callback:complete,event_timeout:800} : {}),
      ...(analytics.debug === true ? {debug_mode:true} : {})});
  }
  function track(name, data = {}, dedupe = '', complete, deferUntilArrival = false) {
    // Do not emit, save or replay pre-consent interactions, including dedupe keys.
    if (!canCollect || !consent || !booted || !permitted.has(name)) { complete?.(); return; }
    if (name === 'generate_lead' && data.mode !== 'api') { complete?.(); return; }
    const key = dedupe && name + ':' + dedupe;
    if (key && once.has(key)) { complete?.(); return; }
    if (key) once.add(key);
    const params = clean(name,data);
    document.dispatchEvent(new CustomEvent('hla:analytics',{detail:{name,params}}));
    if (deferUntilArrival && pageFile==='consultation.html' && ['submit_form','generate_lead','download_intake_summary'].includes(name)) {
      try {
        const pending=JSON.parse(sessionStorage.getItem(pendingKey) || '[]');
        const events=Array.isArray(pending)?pending:[];
        // Only fixed event names, mode and time cross navigation. Never form values or receipts.
        events.push({name,mode:data.mode,at:Date.now()});
        sessionStorage.setItem(pendingKey,JSON.stringify(events));
        complete?.(); return;
      } catch {}
    }
    google(name,params,complete);
  }
  window.HLA_TRACK = track;
  function bootGoogle() {
    if (!canCollect || !consent || booted) return;
    booted = true;
    window['ga-disable-' + id] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
    window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('js',new Date());
    window.gtag('set',{page_location:pageLocation,page_referrer:safeReferrer(),
      allow_google_signals:false,allow_ad_personalization_signals:false});
    window.gtag('config',id,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,
      page_location:pageLocation,page_referrer:safeReferrer(),page_title:document.title});
    if (!document.getElementById('hla-google-tag')) {
      const script=document.createElement('script');script.id='hla-google-tag';script.async=true;
      script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id);
      document.head.append(script);
    }
    google('page_view',{page_path:pagePath,page_title:document.title});
    if (practiceFiles.has(pageFile)) track('view_practice',{},'page');
    if (lawyerFiles.has(pageFile)) track('view_lawyer',{},'page');
    // Completion-page delivery avoids losing confirmed conversions during a fast redirect.
    // The pending entries are consumed once, and only the API-confirmed 'sent' state permits a lead.
    for (const item of arrivalEvents) google(item.name,{page_path:pagePath,interaction_mode:item.mode,source_page:'/consultation.html'});
    arrivalEvents=[];
  }
  function consentPanel() {
    if (!enabled || document.getElementById('hla-consent')) return;
    const panel=document.createElement('div');panel.id='hla-consent';panel.className='hla-consent';
    panel.setAttribute('role','region');panel.setAttribute('aria-label','網站分析選擇');
    const inner=document.createElement('div');inner.className='hla-consent-inner';
    const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');
    icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('aria-hidden','true');icon.classList.add('hla-consent-icon');
    const shield=document.createElementNS('http://www.w3.org/2000/svg','path');
    shield.setAttribute('d','M12 3 4 6v6c0 4 4 7 8 9 4-2 8-5 8-9V6l-8-3Z M8.5 12l2.5 2.5 4.5-5');icon.append(shield);
    const copy=document.createElement('div');copy.className='hla-consent-copy';
    const title=document.createElement('strong');title.className='hla-consent-title';title.textContent='網站隱私與分析設定';
    const text=document.createElement('p');
    const desktopName=document.createElement('span');desktopName.className='hla-consent-desktop';desktopName.textContent='Google Analytics';
    const mobileName=document.createElement('span');mobileName.className='hla-consent-mobile';mobileName.textContent='GA4';
    text.append('同意後才啟用 ',desktopName,mobileName,'，不傳送聯絡資料或案件內容。');
    const privacy=document.createElement('a');privacy.href='privacy.html';privacy.textContent='隱私權政策';text.append(' ',privacy);
    copy.append(title,text);
    const actions=document.createElement('div');actions.className='hla-consent-actions';
    const allow=document.createElement('button');allow.type='button';allow.textContent='同意分析';
    const deny=document.createElement('button');deny.type='button';deny.textContent='拒絕分析';
    actions.append(allow,deny);inner.append(icon,copy,actions);panel.append(inner);
    const spacer=document.createElement('div');spacer.className='hla-consent-spacer';spacer.setAttribute('aria-hidden','true');
    document.body.append(spacer,panel);
    // Use the rendered height so enlarged text, rotation and safe areas cannot
    // leave the contact controls behind the bar. This is layout only.
    const fit=()=>document.documentElement.style.setProperty('--hla-consent-height',Math.ceil(panel.getBoundingClientRect().height)+'px');
    const observer=typeof ResizeObserver==='function' ? new ResizeObserver(fit) : null;
    observer?.observe(panel);window.addEventListener('resize',fit);fit();
    const choose=state => {
      consent=state==='granted';
      try { localStorage.setItem('hla-analytics-consent-v1',state); } catch {}
      if (consent) {
        if (booted) {
          window['ga-disable-'+id]=false;
          window.gtag?.('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
        } else bootGoogle();
      }
      else {
        window['ga-disable-'+id]=true;
        if (window.gtag) window.gtag('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
      }
      observer?.disconnect();window.removeEventListener('resize',fit);
      document.documentElement.style.removeProperty('--hla-consent-height');
      panel.remove();spacer.remove();
    };
    allow.addEventListener('click',()=>choose('granted'));deny.addEventListener('click',()=>choose('denied'));
  }
  if (enabled) {
    let choice='';try {choice=localStorage.getItem('hla-analytics-consent-v1') || '';} catch {}
    if (consent) bootGoogle();else if(!choice)consentPanel();
    const settings=document.createElement('button');settings.type='button';settings.className='hla-consent-settings';
    settings.textContent='網站分析設定';settings.addEventListener('click',consentPanel);
    (document.querySelector('.footer-bottom') || document.body).append(settings);
  }
  if (practiceFiles.has(pageFile)) track('view_practice',{},'page');
  if (lawyerFiles.has(pageFile)) track('view_lawyer',{},'page');
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href]');if(!link)return;
    const href=link.getAttribute('href');
    const position=link.closest('.line-widget')?'floating':link.closest('header')?'header':link.closest('footer')?'footer':document.body.dataset.page==='P19'?'article':'main';
    if (href.startsWith('tel:')) track('click_phone',{position});
    else if (href.startsWith('mailto:')) track('click_email',{position});
    else if (/^https:\/\/(lin\.ee|line\.me)\//.test(href)) {
      const qr=link.classList.contains('line-float-btn') && !matchMedia('(max-width:900px)').matches;
      // Clicking again to close the QR is not a second consultation click.
      if (!qr || link.getAttribute('aria-expanded')==='true') track('click_line',{position,mode:qr?'qr':'direct'});
    } else {
      let target;try {target=new URL(link.href).pathname;} catch {return;}
      if (target.endsWith('/consultation.html')) track('click_consult',{position,target_path:'/consultation.html'});
      if (document.body.dataset.page==='P19') {
        const file=target.split('/').pop();
        if(practiceFiles.has(file))track('article_to_service',{position:'article',target_path:'/'+file});
        if(lawyerFiles.has(file))track('article_to_lawyer',{position:'article',target_path:'/'+file});
      }
    }
  });
  const form=document.getElementById('intake-form');
  if(form)form.addEventListener('input',()=>track('start_form',{mode:config.intakeMode==='api'?'api':'summary'},'form'));
  const search=document.getElementById('site-search');
  if(search) {
    let timer;
    const report=()=>track('site_search',{search_category:document.querySelector('[data-filter="search"] button.active')?.dataset.value || '全部',
      result_count:document.querySelectorAll('#search-results a').length});
    search.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(report,650)});
    document.querySelectorAll('[data-filter="search"] button').forEach(button=>button.addEventListener('click',()=>{clearTimeout(timer);timer=setTimeout(report,0)}));
    if(new URLSearchParams(location.search).has('q'))setTimeout(report,0);
  }
})();
