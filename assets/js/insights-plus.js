/* Optional filters share the indexable, server-readable four-page article library. */
(() => {
  'use strict';
  const source = document.getElementById('insights-plus-data');
  const list = document.getElementById('insight-list');
  if (!source || !list) return;
  let articles;
  try { articles = JSON.parse(source.textContent); } catch { return; }
  const categories = {
    '家事與財富': ['family-wealth.html', '家事與財富傳承', '離婚、親權、扶養費與繼承的問題，分開整理資料，再確認家庭與財產安排。'],
    '不動產': ['real-estate.html', '土地與不動產', '從登記、共有、交易與租賃現況整理資料，繼承房地也可一併核對家庭關係。'],
    '刑事程序': ['criminal.html', '刑事與企業刑事', '先確認警詢或偵查通知、目前身分與時間，再整理陳述及證據資料。'],
    '企業與投資': ['corporate.html', '企業與商務', '從公司治理、決策權限到契約履行，檢視交易文件與經營風險。'],
    '民商爭議': ['disputes.html', '民商事爭議', '整理事實、對話、金流與事件時序，讓協商及訴訟使用同一份證據基礎。'],
    '跨境': ['cross-border.html', '跨境與國際爭議', '先確認交易主體、法域、履行地及資產位置，再對照管轄與準據法。'],
    '勞動': ['employment.html', '勞動與人力資源', '把勞動契約、實際工作條件、權限及交接紀錄接在一起。'],
    '科技智財': ['ip-technology.html', '智慧財產與科技', '從素材來源、授權與資料流，整理產品上線及AI使用的問題。']
  };
  const alias = value => value === '智慧財產與科技' ? '科技智財' : value;
  const normalize = value => Object.hasOwn(categories, alias(value)) ? alias(value) : '全部';
  const nav = document.querySelector('.insights-pagination-plus');
  const heading = document.getElementById('insights-list-title');
  const summary = document.getElementById('insights-page-summary');
  const guide = document.getElementById('insights-service-guide');
  const original = { cards: list.innerHTML, heading: heading.textContent, summary: summary.textContent };
  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const card = article => {
    const link = node('a', 'article-card');
    link.href = article.file;
    link.dataset.category = article.category;
    const media = node('div', 'article-card-media');
    const img = node('img');
    img.src = article.image; img.alt = article.title + '的文章封面';
    img.width = article.width; img.height = article.height;
    img.loading = 'lazy'; img.decoding = 'async';
    if (article.srcset) { img.srcset = article.srcset; img.sizes = article.sizes; }
    else if (article.new) {
      img.srcset = [480,768,1200,1600].map(width => `assets/images/insights/plus/${article.slug}-${width}.webp ${width}w`).join(', ');
      img.sizes = '(max-width: 720px) calc(100vw - 36px), (max-width: 1023px) calc((100vw - 88px) / 2), (max-width: 1344px) calc((100vw - 120px) / 3), 408px';
    }
    media.append(img);
    const copy = node('div', 'article-card-copy');
    copy.append(node('span', '', article.category), node('h3', '', article.title), node('p', '', article.lead),
      node('div', 'insight-card-byline', article.author + ' 律師 · 法律觀點'), node('strong', '', '閱讀完整文章 ↗'));
    link.append(media, copy);
    return link;
  };
  // Preserve old external ?category= links; the new navigation emits fragments only.
  // Leave other query strings intact so analytics cannot collect an unsafe query.
  const query = new URLSearchParams(location.search);
  if (query.has('category') && [...query].every(([key]) => key === 'category')) {
    const category = normalize(query.get('category'));
    history.replaceState(null, '', location.pathname + (category === '全部' ? '' : '#category=' + encodeURIComponent(category)));
  }
  let previous = null;
  const render = () => {
    const category = normalize(new URLSearchParams(location.hash.slice(1)).get('category'));
    if (category === previous) return;
    previous = category;
    for (const link of document.querySelectorAll('.insights-topic-links a')) {
      const active = link.textContent === category;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
    }
    if (category === '全部') {
      list.innerHTML = original.cards; heading.textContent = original.heading; summary.textContent = original.summary;
      if (guide) { guide.hidden = true; guide.replaceChildren(); }
      if (nav) nav.hidden = false;
      return;
    }
    // A selected category shows its entire small collection. The four unfiltered
    // pages keep distinct HTML URLs, canonicals and static links for crawling.
    const selected = articles.filter(article => article.category === category);
    list.replaceChildren(...selected.map(card));
    heading.textContent = category + '法律觀點';
    summary.textContent = '共 ' + selected.length + ' 篇 · 已顯示此分類全部文章';
    if (nav) nav.hidden = true;
    if (guide) {
      const [file, title, description] = categories[category];
      const link = node('a', '', '了解' + title + '法律服務 ↗'); link.href = file;
      guide.replaceChildren(node('strong', '', category + '文章與服務'), node('p', '', description), link);
      guide.hidden = false;
    }
    window.HLA_TRACK?.('select_article_category', { article_category: category });
  };
  window.addEventListener('hashchange', render);
  render();
})();
