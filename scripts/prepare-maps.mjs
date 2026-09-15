import mapshaper from 'mapshaper';
import {readFile, writeFile} from 'node:fs/promises';

const run = command => new Promise((resolve, reject) => mapshaper.runCommands(command, error => error ? reject(error) : resolve()));
await run('-i .cache/sources/boundaries-SA3.zip -filter "Number(STE_CODE21)<=8 && this.area>0" -simplify weighted 2% keep-shapes -filter-fields SA3_CODE21,SA3_NAME21,SA4_CODE21,STE_CODE21 -rename-layers regions -o public/data/regions.topo.json format=topojson quantization=100000 force');
await run('-i public/data/regions.topo.json -dissolve STE_CODE21 -rename-layers states -o public/data/states.topo.json format=topojson force');
await run('-i public/data/regions.topo.json -dissolve SA4_CODE21 -points inner -o .cache/sources/sa4-points.json format=geojson force');
const points = JSON.parse(await readFile('.cache/sources/sa4-points.json', 'utf8'));
const locations = new Map(points.features.map(f => [f.properties.SA4_CODE21, f.geometry.coordinates]));
const regions = JSON.parse(await readFile('public/data/sa4.json', 'utf8'));
for (const region of regions) {
  const xy = locations.get(region.code);
  if (!xy) throw new Error(`Missing SA4 map location: ${region.code}`);
  [region.longitude, region.latitude] = xy.map(n => +n.toFixed(5));
}
await writeFile('public/data/sa4.json', JSON.stringify(regions));
console.log('Maps prepared: simplified ABS boundaries and geometric interior points (not household locations).');
