import '@fontsource/bitter/latin-500.css';
import '@fontsource/public-sans/latin-400.css';
import '@fontsource/public-sans/latin-600.css';
import './style.css';
import embed from 'vega-embed';

const sourceLinks={census:'https://www.abs.gov.au/census/find-census-data/datapacks',cpi:'https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/consumer-price-index-australia/jul-2026',aihw:'https://www.aihw.gov.au/reports/housing-assistance/cwlth-rent-assistance-in-australia-quarterly-data/contents/data'};
const sourceNames={census:'ABS · Census 2021',cpi:'ABS · Consumer prices, 2024–26',aihw:'AIHW · Rent assistance, March 2026'};
const colours=['#158374','#2b6399','#8f4715','#9e9e9e','#dedede'];
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const money=n=>new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD',maximumFractionDigits:0}).format(n);
const pct=n=>`${n.toFixed(1)}%`;
const number=n=>new Intl.NumberFormat('en-AU',{maximumFractionDigits:1}).format(n);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cache=new Map();
function fetchJSON(path){if(!cache.has(path))cache.set(path,fetch(path).then(r=>{if(!r.ok)throw new Error(`Could not load ${path} (${r.status})`);return r.json();}).catch(error=>{cache.delete(path);throw error;}));return cache.get(path);}
const views=new Map();
let selected='all';
let manifest=[];
let resizeTimer;
let renderQueue=Promise.resolve();
const headers={tenure:'Tenure',count:'Homes',share:'Share of homes',name:'Region / category',state:'State / territory',households:'Occupied homes',renting:'Rented homes',rentalShare:'Share renting',apartmentShare:'Share apartments',rent:'Median rent / week',income:'Median income / week',mortgage:'Median mortgage / month',mortgageWeekly:'Mortgage / week equivalent',dwelling:'Dwelling',household:'Household composition',before:'Without assistance (%)',after:'With assistance (%)',severe:'Over 50% after assistance (%)',payment:'Payment group',rate:'In stress after assistance (%)',date:'Month',series:'Price series',index:'Change since April 2024 (%)',recipients:'All recipients',severeCount:'Paying over half their income',sourceIndex:'Published index',category:'Dwelling category',kind:'Community setting'};
const columns={tenure:['tenure','count','share'],dwellings:['category','name','count'],mosaic:['dwelling','tenure','count'],households:['household','dwelling','count'],sa3:['name','state','rent','income','apartmentShare','mortgageWeekly'],sa4:['name','state','renting','rentalShare'],cra:['state','recipients','before','after','severe','severeCount'],heatmap:['state','payment','rate'],cpi:['date','series','index'],cases:['name','kind','rent','income','apartmentShare','mortgageWeekly']};
function cell(key,value){if(value===null||value===undefined)return 'Not available';if(['share','rentalShare','apartmentShare'].includes(key))return pct(value*100);if(['rent','income','mortgage','mortgageWeekly'].includes(key))return money(value);if(key==='index')return number(value-100);return typeof value==='number'?number(value):esc(value);}
function tableHTML(rows,keys,caption){return `<div class="table-wrap" tabindex="0" role="region" aria-label="${esc(caption)}"><table><caption>${esc(caption)}</caption><thead><tr>${keys.map(k=>`<th scope="col">${esc(headers[k]||k)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${keys.map((k,i)=>i===0?`<th scope="row">${cell(k,r[k])}</th>`:`<td>${cell(k,r[k])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}

const houseIcon='<svg class="dwelling-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="m2 11 10-8 10 8M5 9v12h14V9M10 21v-7h4v7"/></svg>';
const townIcon='<svg class="dwelling-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M2 21V10l5-5 5 5 5-5 5 5v11M1 21h22M12 10v11M5 21v-4h3v4M16 21v-4h3v4"/></svg>';
const flatIcon='<svg class="dwelling-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M5 22V2h14v20M3 22h18M9 6h2m2 0h2M9 10h2m2 0h2M9 14h2m2 0h2M10 22v-4h4v4"/></svg>';
async function legend(id){
 if(['tenure','mosaic'].includes(id)){const rows=await fetchJSON('data/tenure.json');return `<ul class="figure-legend">${rows.map((d,i)=>`<li><i class="swatch" style="background:${colours[i]}"></i>${esc(d.tenure)}${id==='tenure'?` <span class="legend-value">${pct(d.share*100)}</span>`:''}</li>`).join('')}</ul>`;}
 if(id==='dwellings')return `<ul class="figure-legend"><li>${houseIcon}Separate house</li><li>${townIcon}Townhouse</li><li>${flatIcon}Apartment</li></ul>`;
 if(id==='rent-map'){
   // Read the classes from the specification so the key cannot drift from the map.
   const {domain,range}=(await fetchJSON('charts/rent-map.json')).vconcat[0].layer[0].encoding.color.condition.scale;
   const labels=range.map((_,i)=>i===0?`Under ${money(domain[0])}`:i===domain.length?`${money(domain.at(-1))}+`:`${money(domain[i-1])}–${money(domain[i]-1)}`);
   return `<div class="rent-key"><p class="box-key-title">Median weekly rent</p><ul class="figure-legend">${range.map((c,i)=>`<li><i class="swatch" style="background:${c}"></i>${labels[i]}</li>`).join('')}<li><i class="swatch" style="background:#c4c4c4"></i>No data</li></ul></div>`;
 }
 if(id==='state-spread')return `<div class="box-key"><p class="box-key-title">How to read each row</p><svg viewBox="0 0 360 70" role="img" aria-label="A box plot row: the line runs from the cheapest to the dearest region; the box holds the middle half of regions; the white mark is the typical region."><text x="180" y="12" text-anchor="middle">Middle half of regions</text><path d="M110 19v5h140v-5" class="bracket"/><line x1="10" x2="350" y1="38" y2="38" class="whisker"/><line x1="10" x2="10" y1="31" y2="45" class="whisker"/><line x1="350" x2="350" y1="31" y2="45" class="whisker"/><rect x="110" y="28" width="140" height="20" class="box"/><line x1="175" x2="175" y1="28" y2="48" class="median"/><text x="10" y="64">Cheapest region</text><text x="175" y="64" text-anchor="middle">Typical region</text><text x="350" y="64" text-anchor="end">Dearest region</text></svg></div>`;
 if(id==='profiles')return `<ul class="figure-legend"><li><span class="line-key"></span>Melbourne City</li><li><span class="line-key dashed"></span>Casey – South</li><li><span class="line-key dotted"></span>Bendigo</li></ul>`;
 return '';
}

// Zoomable maps get zoom buttons, plus jump-to-place buttons when the
// manifest lists places ([name, [longitude, latitude, zoom]], null = reset).
function zoomControls(meta){
 const places=(meta.places||[]).map(([name,target],i)=>`<button type="button" data-place="${i}"${target?'':' aria-pressed="true"'}>${esc(name)}</button>`).join('');
 return `<div class="zoom-controls" data-zoom-for="${meta.id}" role="group" aria-label="Map zoom">${places}<button type="button" data-zoom="1.6" aria-label="Zoom in">＋</button><button type="button" data-zoom="0.625" aria-label="Zoom out">−</button>${places?'':'<button type="button" data-zoom="reset">Reset</button>'}</div>`;
}
function zoomCommand(meta,button){
 if(button.dataset.zoom)return button.dataset.zoom==='reset'?{reset:true}:{step:Number(button.dataset.zoom)};
 const target=meta.places[button.dataset.place][1];
 return target?{place:target}:{reset:true};
}

async function makeFigure(meta,index){
 const slot=$(`[data-figure="${meta.id}"]`);
 if(!slot)return;
 const rows=await fetchJSON(`data/${meta.data}.json`);
 const displayRows=meta.data==='dwellings'?rows.filter(r=>r.count):rows;
 const chart=`<div class="chart" id="chart-${meta.id}" role="img" aria-label="${esc(meta.description)}"><p class="chart-loading">Drawing the chart…</p></div>`;
 const key=await legend(meta.id);
 // The waffle is square, so its key sits beside it to fill the column.
 const body=meta.id==='tenure'?`<div class="chart-with-key">${chart}${key}</div>`:meta.zoom?zoomControls(meta)+chart+key:chart+key;
 slot.innerHTML=`<figure class="figure" aria-labelledby="title-${meta.id}" aria-describedby="desc-${meta.id}"><div class="figure-label"><span>Figure ${String(index+1).padStart(2,'0')}</span><span>${sourceNames[meta.source]}</span></div><h3 id="title-${meta.id}">${esc(meta.title)}</h3>${body}<figcaption><p class="figure-description" id="desc-${meta.id}">${esc(meta.description)}</p><p class="figure-source">Source: <a href="${sourceLinks[meta.source]}">${sourceNames[meta.source]}</a></p></figcaption><details class="figure-tools"><summary>Read the data &amp; chart specification</summary>${tableHTML(displayRows,columns[meta.data],`${meta.title} — source values`)}<div class="downloads"><a href="data/${meta.data}.json" download>Download data</a><a href="charts/${meta.id}.json">Readable chart JSON</a></div></details></figure>`;
}

// Every spec sizes itself to its container, except the choropleth: Vega-Lite
// cannot fit concatenated views to a container, so its view sizes are set here
// (the fitted projections rescale themselves) and the city maps stack on phones.
function fitSpec(original,meta,width){
 if(!meta.map)return original;
 const spec=structuredClone(original);
 const [main,{hconcat:insets,...row}]=spec.vconcat;
 main.width=width;main.height=Math.round(width*main.height/1100);
 const narrow=width<650,insetW=narrow?width:Math.floor((width-2*row.spacing)/3);
 for(const inset of insets){inset.width=insetW;inset.height=Math.round(insetW*(narrow?.8:.95));}
 if(narrow)spec.vconcat[1]={vconcat:insets,...row};
 return spec;
}

async function render(meta){
 const node=$(`#chart-${meta.id}`);if(!node)return;
 const width=Math.floor(node.getBoundingClientRect().width);
 if(node.dataset.width===String(width)&&views.has(meta.id))return;
 try{
   const spec=fitSpec(await fetchJSON(`charts/${meta.id}.json`),meta,width);
   views.get(meta.id)?.finalize();
   const result=await embed(node,spec,{actions:false,renderer:'svg',tooltip:{theme:'light'},defaultStyle:false});
   views.set(meta.id,result.view);
   if(meta.linked)await result.view.signal('featured',selected).runAsync();
   if(meta.zoom)$$(`[data-zoom-for="${meta.id}"] button`).forEach((button,_,all)=>{button.onclick=()=>{
     if(button.dataset.place)all.forEach(b=>b.dataset.place&&b.setAttribute('aria-pressed',String(b===button)));
     views.get(meta.id)?.signal('zoomCommand',zoomCommand(meta,button)).runAsync();
   };});
   node.dataset.width=String(width);node.dataset.ready='true';node.setAttribute('role','img');node.removeAttribute('aria-live');
 }catch(error){
   console.error(`Chart ${meta.id}:`,error);
   node.removeAttribute('role');node.setAttribute('aria-live','polite');
   node.innerHTML=`<p class="chart-error">This chart could not be drawn. Its explanation and source table remain available below. <button type="button" class="retry-chart">Try again</button></p>`;
   node.querySelector('button').addEventListener('click',()=>render(meta));
   node.dataset.ready='error';
 }
}

function enqueueRender(){renderQueue=renderQueue.then(async()=>{for(const meta of manifest)await render(meta);});return renderQueue;}
async function init(){
 const [index,cases,summary,states,cra]=await Promise.all(['charts/index.json','data/cases.json','data/summary.json','data/ste.json','data/cra.json'].map(fetchJSON));
 manifest=index;
 $$('[data-stat]').forEach(node=>{const key=node.dataset.stat;node.textContent=pct(key==='rental-share'?summary.rentalShare*100:key==='cra-before'?summary.craBefore:summary.craAfter);});
 $('#case-facts').innerHTML=cases.map((d,i)=>`<div data-case-fact="${d.code}"><h3><span class="line-key ${i===1?'dashed':i===2?'dotted':''}"></span>${esc(d.name.replace(' - ',' – '))}</h3><p>${esc(d.kind)} · ${money(d.rent)} median weekly rent<br/>${pct(d.apartmentShare*100)} of homes are apartments</p></div>`).join('');
 const combined=states.map(d=>({...d,after:cra.find(r=>r.state===d.state).after}));
 $('#combined-table').innerHTML=tableHTML(combined,['state','rentalShare','after'],'Share of homes rented (Census 2021) and share of rent-assistance recipients in rental stress (March 2026)');
 await Promise.all(manifest.map(makeFigure));
 await document.fonts.ready;
 await enqueueRender();
 document.documentElement.dataset.ready='true';
 $$('[data-case]').forEach(button=>button.addEventListener('click',async()=>{
   selected=button.dataset.case;
   $$('[data-case]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
   $$('[data-case-fact]').forEach(n=>n.classList.toggle('dimmed',selected!=='all'&&n.dataset.caseFact!==selected));
   const d=cases.find(c=>c.code===selected);
   $('#case-description').textContent=d?`${d.name.replace(' - ',' – ')}: ${d.kind.toLowerCase()}, ${money(d.rent)} median weekly rent and ${money(d.income)} median weekly household income in 2021. Highlighted below; national context remains visible.`:'Three Victorian communities: an inner city, an outer suburb and a regional centre. Every other region stays in grey for context.';
   await Promise.all(manifest.filter(m=>m.linked).map(m=>views.get(m.id)?.signal('featured',selected).runAsync()));
 }));
 window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(enqueueRender,180);});
 const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){$$('.chapter-nav a').forEach(a=>{if(a.hash===`#${e.target.id}`)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});}},{rootMargin:'-10% 0px -65% 0px'});
 $$('.chapter').forEach(node=>observer.observe(node));
}
init().catch(error=>{console.error(error);$('.reading-note').insertAdjacentHTML('beforeend','<p role="alert">Some charts could not load. Please refresh the page. Source links and the story remain available below.</p>');});
