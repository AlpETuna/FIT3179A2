import {readFile, readdir, stat} from 'node:fs/promises';
import assert from 'node:assert/strict';
export const read = async name => JSON.parse(await readFile(`public/data/${name}.json`, 'utf8'));
const [sa3, sa4, cases, cra, heat, cpi, summary, geometry] = await Promise.all(['sa3','sa4','cases','cra','heatmap','cpi','summary','regions.topo'].map(read));
assert.equal(sa3.length, 335);
assert.equal(sa4.length, 88);
assert.equal(new Set(sa3.map(d=>d.code)).size, sa3.length);
assert.equal(cases.length, 3);
for (const r of sa3) {
  assert(r.rent > 0 && r.income > 0);
  assert(r.rentalShare >= 0 && r.rentalShare <= 1);
  assert(geometry.objects.regions.geometries.some(g=>g.properties.SA3_CODE21 === r.code), `Missing geometry ${r.code}`);
}
for (const r of sa4) assert(Number.isFinite(r.longitude) && Number.isFinite(r.latitude));
assert.equal(cra.length, 8); assert.equal(heat.length, 48);
for (const r of cra) assert(r.before >= r.after && r.after >= r.severe && r.before <= 100);
for (const r of heat) assert(r.rate === null || r.rate >= 0 && r.rate <= 100);
assert.equal(new Set(cpi.map(d=>d.date)).size, 28);
for (const name of ['All prices','Rents']) assert.equal(cpi.find(d=>d.series===name).index,100);
assert.equal(summary.nationalRent, 375);
let bytes=0;
for (const f of await readdir('public/data')) bytes += (await stat(`public/data/${f}`)).size;
assert(bytes < 3_000_000, `Public data exceeds 3 MB: ${bytes}`);
console.log(`Verified source extracts, geography joins, percentages and periods. Public data: ${(bytes/1e6).toFixed(2)} MB.`);
