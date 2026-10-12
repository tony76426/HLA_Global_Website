(() => {
  'use strict';
  const source = document.getElementById('insights-plus-data');
  const list = document.getElementById('insight-list');
  if (!source || !list) return;
  const articles = JSON.parse(source.textContent);
  const params = new URLSearchParams(location.search);
  const requested = params.get('category') || '全部';
  const category = articles.some(a => a.category === requested) ? requested : '全部';
  const selected = category === '全部' ? articles : articles.filter(a => a.category === category);
  const total = Math.ceil(selected.length / 8);
  const page = Math.min(Math.max(Number(document.body.dataset.insightsPage) || 1, 1), total);
  const url = n => (n === 1 ? 'insights.html' : `insights-${n}.html`) + (category === '全部' ? '' : '?category=' + encodeURIComponent(category));
  for (const a of document.querySelectorAll('.insights-topic-links a')) {
    const active = a.textContent === category;
    a.classList.toggle('active', active);
    if (active) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
  }
  document.getElementById('insights-list-title').textContent = category === '全部' ? '全部法律觀點' : category + '法律觀點';
  document.getElementById('insights-page-summary').textContent = `共 ${selected.length} 篇 · 第 ${page} / ${total} 頁 · 本頁 ${selected.slice((page - 1) * 8, page * 8).length} 篇`;
  if (category === '全部') return; // The default library is fully readable without JavaScript.
  const node = (tag, className, text) => {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  const cards = selected.slice((page - 1) * 8, page * 8).map(a => {
    const link = node('a', 'article-card');
    link.href = a.file; link.dataset.category = a.category;
    const media = node('div', 'article-card-media');
    const img = node('img');
    img.src = a.image; img.alt = a.title + '的文章封面';
    img.width = a.width; img.height = a.height; img.loading = 'lazy'; img.decoding = 'async';
    if (a.srcset) {
      img.srcset = a.srcset; img.sizes = a.sizes;
    } else if (a.new) {
      img.srcset = [480, 768, 1200, 1600].map(w => `assets/images/insights/plus/${a.slug}-${w}.webp ${w}w`).join(', ');
      img.sizes = '(max-width: 720px) calc(100vw - 36px), (max-width: 1023px) calc((100vw - 88px) / 2), (max-width: 1344px) calc((100vw - 120px) / 3), 408px';
    }
    media.append(img);
    const copy = node('div', 'article-card-copy');
    copy.append(node('span', '', a.category), node('h3', '', a.title), node('p', '', a.lead), node('div', 'insight-card-byline', a.author + ' 律師 · 法律觀點'), node('strong', '', '閱讀完整文章 ↗'));
    link.append(media, copy); return link;
  });
  list.replaceChildren(...cards);
  const nav = document.querySelector('.insights-pagination-plus');
  const controls = [];
  const direction = (text, destination, disabled) => {
    const x = node(disabled ? 'span' : 'a', 'page-direction' + (disabled ? ' is-disabled' : ''), text);
    if (disabled) x.setAttribute('aria-disabled', 'true'); else x.href = url(destination);
    return x;
  };
  controls.push(direction('上一頁', page - 1, page === 1));
  for (let n = 1; n <= total; n++) {
    const a = node('a', '', String(n)); a.href = url(n);
    a.setAttribute('aria-label', category + '法律觀點第 ' + n + ' 頁');
    if (n === page) a.setAttribute('aria-current', 'page');
    controls.push(a);
  }
  controls.push(direction('下一頁', page + 1, page === total));
  nav.replaceChildren(...controls);
})();
