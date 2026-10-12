import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as vega from 'vega';
import {compile} from 'vega-lite';

const manifest=JSON.parse(await readFile('public/charts/index.json','utf8'));
for(const chart of manifest){
 test(`${chart.id}: specification runs with its published data`,async()=>{
  const original=JSON.parse(await readFile(`public/charts/${chart.id}.json`,'utf8'));
  const spec=chart.engine==='vega'?original:compile(original).spec;
  const errors=[];
  const logger=vega.logger(vega.Warn);
  logger.error=(...args)=>{errors.push(args.join(' '));return logger;};
  const view=new vega.View(vega.parse(spec),{renderer:'none',loader:vega.loader({baseURL:'public/'}),logger});
  await view.runAsync();
  assert.deepEqual(errors,[]);
  if(chart.linked){await view.signal('featured','20201').runAsync();assert.equal(view.signal('featured'),'20201');}
  if(chart.id==='profiles')assert.equal(view.data('profiles').length,335*4);
  if(chart.id==='dwellings')assert.equal(view.data('leaves').length,13);
  if(['payment-stress','severe'].includes(chart.id)){
   const rows=JSON.parse(await readFile(`public/data/${chart.data}.json`,'utf8'));
   const luminance=rgb=>{const c=rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
   for(const row of rows){
    // Offshore map labels are always dark text on the white page.
    if(chart.id==='severe'&&['Vic','Tas','ACT'].includes(row.state))continue;
    const value=row[chart.id==='severe'?'severe':'rate'];const lum=luminance(view.scale('color')(value));const white=value>(chart.id==='severe'?21.6:72);const contrast=white?1.05/(lum+.05):(lum+.05)/.05;assert(contrast>=4.5,`${chart.id} ${row.state}: contrast ${contrast}`);}
  }
  view.finalize();
 });
}

test('Published CRA cross-tab agrees with independently published state totals',async()=>{
 const cra=JSON.parse(await readFile('public/data/cra.json','utf8'));
 // NSW: published count in stress / eligible count, allowing rounded counts.
 assert(Math.abs(cra.find(r=>r.state==='NSW').after - 208620/454445*100)<.01);
 assert(Math.abs(cra.find(r=>r.state==='NSW').severe - (48660+47640)/454445*100)<.01);
});

test('CPI uses the common monthly window and preserves the published relative change',async()=>{
 const cpi=JSON.parse(await readFile('public/data/cpi.json','utf8'));
 for(const series of ['Rents','All prices']){
  const rows=cpi.filter(r=>r.series===series);
  assert.equal(rows[0].date,'2024-04-01');assert.equal(rows.at(-1).date,'2026-07-01');
  assert(Math.abs(rows.at(-1).index-rows.at(-1).sourceIndex/rows[0].sourceIndex*100)<.0001);
 }
});
