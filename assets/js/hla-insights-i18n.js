(()=>{'use strict';
const dataNode=document.getElementById('insights-plus-data'),list=document.getElementById('insight-list');
if(!dataNode||!list)return;
let articles=[];try{articles=JSON.parse(dataNode.textContent)}catch{return}
const cfg=window.HLA_INSIGHTS_CONFIG||{},categories=cfg.categories||{},labels=cfg.labels||{};
const alias=s=>s==='智慧財產與科技'?'科技智財':s;
const valid=s=>Object.prototype.hasOwnProperty.call(categories,alias(s))?alias(s):'';
const nav=document.querySelector('.insights-pagination-plus'),heading=document.getElementById('insights-list-title'),summary=document.getElementById('insights-page-summary'),guide=document.getElementById('insights-service-guide');
const saved={html:list.innerHTML,heading:heading?.textContent||'',summary:summary?.textContent||''};
const node=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
const card=article=>{
 const link=node('a','article-card');link.href=article.file;link.dataset.category=article.category;
 const media=node('div','article-card-media'),img=node('img');img.src=article.image;img.alt=article.title;img.width=article.width;img.height=article.height;img.loading='lazy';img.decoding='async';
 if(article.srcset){img.srcset=article.srcset.replaceAll('assets/','../assets/');img.sizes=article.sizes}
 else if(article.new){img.srcset=[480,768,1200,1600].map(w=>`../assets/images/insights/plus/${article.slug}-${w}.webp ${w}w`).join(', ');img.sizes='(max-width:720px) calc(100vw - 36px), (max-width:1023px) calc((100vw - 88px)/2), 408px'}
 if(img.src&&img.getAttribute('src').startsWith('assets/'))img.src='../'+img.getAttribute('src');media.append(img);
 const body=node('div','article-card-copy');body.append(node('span','',categories[article.category]?.label||article.category),node('h3','',article.title),node('p','',article.lead),node('div','insight-card-byline',article.author+' · '+labels.byline),node('strong','',labels.read+' ↗'));
 link.append(media,body);return link
};
let previous=null;
const render=()=>{
 const category=valid(new URLSearchParams(location.hash.slice(1)).get('category')||'');if(category===previous)return;previous=category;
 document.querySelectorAll('.insights-topic-links a').forEach(a=>{const key=valid(new URL(a.href,location.href).hash.replace(/^#category=/,'' )?decodeURIComponent(new URL(a.href,location.href).hash.replace(/^#category=/,'')):'' );const active=key===category;a.classList.toggle('active',active);active?a.setAttribute('aria-current','true'):a.removeAttribute('aria-current')});
 if(!category){list.innerHTML=saved.html;if(heading)heading.textContent=saved.heading;if(summary)summary.textContent=saved.summary;if(guide){guide.hidden=true;guide.replaceChildren()}if(nav)nav.hidden=false;return}
 const selected=articles.filter(x=>valid(x.category)===category);list.replaceChildren(...selected.map(card));
 if(heading)heading.textContent=(categories[category]?.label||category)+' '+labels.articles;
 if(summary)summary.textContent=labels.count.replace('{n}',selected.length);
 if(nav)nav.hidden=true;
 if(guide){const info=categories[category];guide.replaceChildren(node('strong','',info.label),node('p','',info.description));const a=node('a','',labels.service+' ↗');a.href=info.file;guide.append(a);guide.hidden=false}
 window.HLA_TRACK?.('select_article_category',{article_category:category});
};
window.addEventListener('hashchange',render);render();
})();