import '@fontsource/bitter/latin-500.css';
import '@fontsource/public-sans/latin-400.css';
import '@fontsource/public-sans/latin-600.css';
import './style.css';
import embed from 'vega-embed';

const sourceLinks={census:'https://www.abs.gov.au/census/find-census-data/datapacks',cpi:'https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/consumer-price-index-australia/jul-2026',aihw:'https://www.aihw.gov.au/reports/housing-assistance/cwlth-rent-assistance-in-australia-quarterly-data/contents/data'};
const sourceNames={census:'ABS · Census 2021',cpi:'ABS · April 2024–July 2026',aihw:'AIHW / DSS · March 2026'};
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
const headers={tenure:'Tenure',count:'Homes',share:'Share of homes',name:'Region / category',state:'State / territory',households:'Occupied homes',renting:'Rented homes',rentalShare:'Share renting',apartmentShare:'Share apartments',rent:'Median rent / week',income:'Median income / week',mortgage:'Median mortgage / month',mortgageWeekly:'Mortgage / week equivalent',dwelling:'Dwelling',household:'Household composition',before:'Without assistance (%)',after:'With assistance (%)',severe:'Over 50% after assistance (%)',payment:'Payment group',rate:'In stress after assistance (%)',date:'Month',series:'Price series',index:'April 2024 = 100',sourceIndex:'Published index',category:'Dwelling category',kind:'Community setting'};
const columns={tenure:['tenure','count','share'],dwellings:['category','name','count'],mosaic:['dwelling','tenure','count'],households:['household','dwelling','count'],sa3:['name','state','rent','income','apartmentShare','mortgageWeekly'],sa4:['name','state','renting','rentalShare'],cra:['state','before','after','severe'],heatmap:['state','payment','rate'],cpi:['date','series','index'],cases:['name','kind','rent','income','apartmentShare','mortgageWeekly']};
function cell(key,value){if(value===null||value===undefined)return 'Not available';if(['share','rentalShare','apartmentShare'].includes(key))return pct(value*100);if(['rent','income','mortgage','mortgageWeekly'].includes(key))return money(value);return typeof value==='number'?number(value):esc(value);}
function tableHTML(rows,keys,caption){return `<div class="table-wrap" tabindex="0" role="region" aria-label="${esc(caption)}"><table><caption>${esc(caption)}</caption><thead><tr>${keys.map(k=>`<th scope="col">${esc(headers[k]||k)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${keys.map((k,i)=>i===0?`<th scope="row">${cell(k,r[k])}</th>`:`<td>${cell(k,r[k])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}

const houseIcon='<svg class="dwelling-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="m2 11 10-8 10 8M5 9v12h14V9M10 21v-7h4v7"/></svg>';
const flatIcon='<svg class="dwelling-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M5 22V2h14v20M3 22h18M9 6h2m2 0h2M9 10h2m2 0h2M9 14h2m2 0h2M10 22v-4h4v4"/></svg>';
async function legend(id){
 if(['tenure','mosaic'].includes(id)){const rows=await fetchJSON('data/tenure.json');return `<ul class="figure-legend">${rows.map((d,i)=>`<li><i class="swatch" style="background:${colours[i]}"></i>${esc(d.tenure)}${id==='tenure'?` <span class="legend-value">${pct(d.share*100)}</span>`:''}</li>`).join('')}</ul>`;}
 if(id==='dwellings')return `<ul class="figure-legend"><li>${houseIcon}Separate house</li><li>${houseIcon}Townhouse</li><li>${flatIcon}Apartment</li></ul>`;
 if(id==='mosaic')return '';
 if(id==='profiles')return `<ul class="figure-legend"><li><span class="line-key"></span>Melbourne City</li><li><span class="line-key dashed"></span>Casey – South</li><li><span class="line-key dotted"></span>Bendigo</li></ul>`;
 return '';
}

async function makeFigure(meta,index){
 const slot=$(`[data-figure="${meta.id}"]`);
 if(!slot)return;
 const rows=await fetchJSON(`data/${meta.data}.json`);
 const displayRows=meta.data==='dwellings'?rows.filter(r=>r.count):rows;
 slot.innerHTML=`<figure class="figure" aria-labelledby="title-${meta.id}" aria-describedby="desc-${meta.id}"><div class="figure-label"><span>Figure ${String(index+1).padStart(2,'0')}</span><span>${sourceNames[meta.source]}</span></div><h3 id="title-${meta.id}">${esc(meta.title)}</h3><div class="chart" id="chart-${meta.id}" role="img" aria-label="${esc(meta.description)}"><p class="chart-loading">Drawing the chart…</p></div>${await legend(meta.id)}<figcaption><p class="figure-description" id="desc-${meta.id}">${esc(meta.description)}</p><p class="figure-source">Source: <a href="${sourceLinks[meta.source]}">${sourceNames[meta.source]}</a> · ${esc(meta.tables)}</p></figcaption><details class="figure-tools"><summary>Read the data &amp; chart specification</summary>${tableHTML(displayRows,columns[meta.data],`${meta.title} — source values`)}<div class="downloads"><a href="data/${meta.data}.json" download>Download data</a><a href="charts/${meta.id}.json">Readable chart JSON</a></div></details></figure>`;
}

function fitSpec(original,meta,width){
 const spec=structuredClone(original);
 const mobile=width<500;
 if(meta.map){
   const main=spec.vconcat[0];const insets=spec.vconcat[1].hconcat;
   main.width=width;main.height=Math.round(width*.62);
   main.projection.scale=width*.99;main.projection.center=[0,-28];main.projection.translate=[width/2,main.height/2];
   const insetW=width<650?width:(width-40)/3;
   for(const inset of insets){inset.width=insetW;inset.height=Math.round(insetW*.65);inset.projection.scale*=insetW/320;inset.projection.translate=[insetW/2,inset.height/2];}
   spec.vconcat=[main,width<650?{vconcat:insets,spacing:20}:{hconcat:insets,spacing:20}];
   return spec;
 }
 if(meta.engine==='vega'){
   const pads=typeof spec.padding==='object'?spec.padding:{left:2,right:2};
   spec.width=Math.max(200,width-(pads.left||0)-(pads.right||0));
   if(meta.id==='profiles'&&mobile){
     spec.height=300;
     // Plain two-line titles preserve meaningful axis labels on a phone.
     spec.data.find(d=>d.name==='axes').values.forEach(d=>d.label=({income:['Income','/ week'],rent:['Rent','/ week'],mortgageWeekly:['Mortgage','/ week'],apartmentShare:['Apartments']})[d.field]);
     spec.padding.top=55;
     const axisTitles=spec.marks.find(m=>m.type==='text'&&m.encode.enter.text.field==='label');
     axisTitles.encode.enter.y.value=-42;axisTitles.encode.enter.fontSize.value=12;
   }
   return spec;
 }
 spec.width=meta.id==='tenure'?Math.min(300,width):width;
 spec.autosize={type:'fit',contains:'padding'};
 if(meta.id==='payment-stress'&&mobile){
   // Transpose the same heatmap on small screens; keep all 48 cells.
   spec.height=540;
   for(const layer of spec.layer){
     const enc=layer.encoding;[enc.x,enc.y]=[enc.y,enc.x];
     enc.x.sort=['NSW','Vic','Qld','SA','WA','Tas','NT','ACT'];
     enc.y.sort=['Age pension','Disability support','Carer','Single parent','JobSeeker','Student / apprentice'];
     enc.x.axis={orient:'top',labelAngle:0,labelFontSize:12};
     enc.y.axis={labelAngle:0,labelLimit:90,labelFontSize:12,labelLineHeight:14,labelExpr:"datum.label==='Disability support'?['Disability','support']:datum.label==='Student / apprentice'?['Student /','apprentice']:datum.label==='Single parent'?['Single','parent']:datum.label"};
   }
   spec.layer[0].encoding.color.legend={orient:'bottom',gradientLength:180,title:'Rental stress after assistance (%)',titleLimit:280};
   spec.layer[1].mark.fontSize=12;
 }
 if(meta.id==='income-rent'&&mobile){
   spec.layer.at(-1).transform.push({calculate:"datum.code==='20604'?'City':datum.code==='21203'?'Outer suburb':'Bendigo'",as:'shortName'});
   spec.layer.at(-1).encoding.text.field='shortName';
   spec.layer.at(-1).mark.fontSize=12;spec.layer.at(-1).mark.dx=7;
   spec.layer.at(-1).mark.dy={expr:"datum.code==='21203'?15:-12"};
 }
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
 $('#combined-table').innerHTML=tableHTML(combined,['state','rentalShare','after'],'Census 2021 share renting and CRA March 2026 rental stress after assistance — different populations');
 await Promise.all(manifest.map(makeFigure));
 await document.fonts.ready;
 await enqueueRender();
 document.documentElement.dataset.ready='true';
 $$('[data-case]').forEach(button=>button.addEventListener('click',async()=>{
   selected=button.dataset.case;
   $$('[data-case]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
   $$('[data-case-fact]').forEach(n=>n.classList.toggle('dimmed',selected!=='all'&&n.dataset.caseFact!==selected));
   const d=cases.find(c=>c.code===selected);
   $('#case-description').textContent=d?`${d.name.replace(' - ',' – ')}: ${d.kind.toLowerCase()}, ${money(d.rent)} median weekly rent and ${money(d.income)} median weekly household income in 2021. Highlighted below; national context remains visible.`:'Three examples, with every other region retained as context. These communities illustrate different settings; they are not a representative national sample.';
   await Promise.all(manifest.filter(m=>m.linked).map(m=>views.get(m.id)?.signal('featured',selected).runAsync()));
 }));
 window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(enqueueRender,180);});
 const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){$$('.chapter-nav a').forEach(a=>{if(a.hash===`#${e.target.id}`)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});}},{rootMargin:'-10% 0px -65% 0px'});
 $$('.chapter').forEach(node=>observer.observe(node));
}
init().catch(error=>{console.error(error);$('.reading-note').insertAdjacentHTML('beforeend','<p role="alert">Some charts could not load. Please refresh the page. Source links and the story remain available below.</p>');});
