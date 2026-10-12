// Original specifications for this story. No gallery JSON is used.
import {mkdir, readFile, writeFile} from 'node:fs/promises';
const read = async name => JSON.parse(await readFile(`public/data/${name}.json`, 'utf8'));
const [tenure, mosaic, households, cases, summary] = await Promise.all(['tenure','mosaic','households','cases','summary'].map(read));
await mkdir('public/charts', {recursive:true});
const C = {ink:'#1d1d1d',muted:'#585858',rent:'#8f4715',mortgage:'#2b6399',owned:'#158374',pressure:'#6f3473',other:'#9e9e9e',unknown:'#dedede'};
const tenureDomain = tenure.map(d=>d.tenure);
const tenureRange = [C.owned,C.mortgage,C.rent,C.other,C.unknown];
const dwellingDomain = ['Separate house','Townhouse','Apartment','Other dwelling','Not stated'];
const dwellingRange = ['#d7ddd9','#b3c4ce','#6e8b9c','#bbb3a7','#e8e8e8'];
const config = {font:'Public Sans',background:'#ffffff',view:{stroke:null},axis:{labelFontSize:13,titleFontSize:13,titleFontWeight:400,labelColor:C.muted,titleColor:C.muted,domain:false,tickColor:'#c8c8c8',gridColor:'#e9e9e9',labelPadding:7,titlePadding:13},legend:{labelFontSize:13,titleFontSize:13,titleFontWeight:400,labelColor:C.muted,titleColor:C.muted,padding:8},title:{font:'Public Sans',fontSize:14,fontWeight:600,color:C.ink,anchor:'start'}};
const q=(field,title,extra={})=>({field,type:'quantitative',title,...extra});
const n=(field,title,extra={})=>({field,type:'nominal',title,...extra});
const url=name=>({url:`data/${name}.json`});
const tenureColor={field:'tenure',type:'nominal',scale:{domain:tenureDomain,range:tenureRange},legend:null};
// Seven stepped classes from pale cream to near-black brown give a wide
// luminance range. The page draws this key in HTML (see src/main.js) because
// Vega's stepped-scale legend crowds its labels. Neighbouring rent levels
// stay distinguishable.
const rentColor={field:'rent',type:'quantitative',title:'Median weekly rent',scale:{type:'threshold',domain:[250,300,350,400,450,500],range:['#fef0d9','#fdcc8a','#fc8d59','#e34a33','#b30000','#7a0000','#3d0000']},legend:null};
const shareColor={domain:[0,.15,.3,.45,.6],range:['#fdecd6','#f3b47a','#d0702e','#8f3a10','#3d1503'],clamp:true};
const priceTip=[n('name','Region'),q('rent','Median rent / week',{format:'$,.0f'}),q('income','Median household income / week',{format:'$,.0f'})];
// Every chart that sits beside another uses the same total height.
const H=320;
// Figures 11 and 12 are a taller pair so the map has room for its glyphs.
const HM=420;
const entries=[];
async function save(id,spec,meta){
  if(id==='mosaic'){
    const columns=spec.data.values.filter(d=>d.tenure==='Owned outright'&&d.x2-d.x>.07);
    spec.encoding.x.axis={values:columns.map(d=>(d.x+d.x2)/2),labelAngle:-45,labelOverlap:false,labelLimit:110,grid:false,ticks:false,
      labelExpr:columns.map(d=>`abs(datum.value - ${(d.x+d.x2)/2}) < 0.00001 ? '${d.dwelling}' : `).join('')+"''"};
  }
  const isVega=spec.$schema?.includes('/vega/v');
  if(!isVega) spec={$schema:'https://vega.github.io/schema/vega-lite/v6.json',...spec,config};
  else spec.config={font:'Public Sans',...spec.config};
  spec.description=meta.description;
  await writeFile(`public/charts/${id}.json`,JSON.stringify(spec,null,2)+'\n');
  entries.push({id,...meta,engine:isVega?'vega':'vega-lite'});
}

// Hamilton's largest-remainder allocation gives exactly 100 tiles without
// pretending that independently rounded category shares add to 100.
const total=tenure.reduce((s,d)=>s+d.count,0);
const allocation=tenure.map(d=>({...d,tiles:Math.floor(d.count/total*100),remainder:d.count/total*100%1}));
let remaining=100-allocation.reduce((s,d)=>s+d.tiles,0);
for(const d of [...allocation].sort((a,b)=>b.remainder-a.remainder).slice(0,remaining))d.tiles++;
const squares=[];
for(const d of allocation)for(let i=0;i<d.tiles;i++){const k=squares.length;squares.push({...d,col:k%10,row:Math.floor(k/10)});}
await save('tenure',{width:H,height:H,data:{values:squares},mark:{type:'rect',stroke:'#fff',strokeWidth:3},encoding:{x:{field:'col',type:'ordinal',axis:null},y:{field:'row',type:'ordinal',axis:null},color:tenureColor,tooltip:[n('tenure','Tenure'),q('share','Share of occupied homes',{format:'.1%'}),q('count','Homes',{format:','})]}},{title:'Nearly one in three homes was rented',description:'A hundred-square waffle shows Australia’s five tenure categories in 2021. Each square is approximately one per cent; the exact shares are listed below.',data:'tenure',source:'census',tables:'G37',idiom:'Waffle',chapter:1});

await save('dwellings',{$schema:'https://vega.github.io/schema/vega/v6.json',width:520,height:H-4,padding:2,autosize:'none',data:[{name:'tree',url:'data/dwellings.json',transform:[{type:'stratify',key:'id',parentKey:'parent'},{type:'treemap',field:'count',method:'squarify',sort:{field:'value',order:'descending'},size:[{signal:'width'},{signal:'height'}],paddingInner:2,paddingOuter:2,paddingTop:22,round:true}]},{name:'leaves',source:'tree',transform:[{type:'filter',expr:'datum.count > 0'}]},{name:'parents',source:'tree',transform:[{type:'filter',expr:'datum.depth === 1'}]}],scales:[{name:'colour',type:'ordinal',domain:dwellingDomain,range:dwellingRange}],marks:[{type:'rect',from:{data:'leaves'},encode:{enter:{x:{field:'x0'},y:{field:'y0'},x2:{field:'x1'},y2:{field:'y1'},stroke:{value:'#fff'},fill:{scale:'colour',field:'category'},tooltip:{signal:"{'Dwelling':datum.category,'Type':datum.name,'Homes':format(datum.count,',')}"}}}},{type:'text',from:{data:'parents'},encode:{enter:{x:{signal:'datum.x0 + 9'},y:{signal:'datum.y0 + 17'},text:{signal:"datum.x1-datum.x0>95 ? datum.name : ''"},fontSize:{value:14},fontWeight:{value:600},fill:{value:C.ink},limit:{signal:'datum.x1-datum.x0-14'}}}}]},{title:'The separate house still defines the landscape',description:'A treemap nests storey and building types inside five dwelling categories. Area represents occupied private dwellings. Tiny subtypes remain in the data table.',data:'dwellings',source:'census',tables:'G36',idiom:'Treemap',chapter:1});

const mosaicData=[];let x=0;
const mt=mosaic.reduce((s,d)=>s+d.count,0);
for(const dwelling of dwellingDomain){const cells=mosaic.filter(d=>d.dwelling===dwelling);const sum=cells.reduce((s,d)=>s+d.count,0);let y=0;for(const cell of cells){const h=cell.count/sum;mosaicData.push({...cell,x,x2:x+sum/mt,y,y2:y+h,within:h});y+=h;}x+=sum/mt;}
await save('mosaic',{width:520,height:H,data:{values:mosaicData},mark:{type:'rect',stroke:'#fff',strokeWidth:1.5},encoding:{x:q('x',null,{axis:null,scale:{domain:[0,1],nice:false}}),x2:{field:'x2'},y:q('y','Share within dwelling type',{axis:{format:'.0%',values:[0,.25,.5,.75,1]},scale:{domain:[0,1],nice:false}}),y2:{field:'y2'},color:tenureColor,tooltip:[n('dwelling','Dwelling'),n('tenure','Tenure'),q('within','Share within dwelling type',{format:'.1%'}),q('count','Homes',{format:','})]}},{title:'Apartments have a different tenure mix',description:'Read this mosaic as columns: wider columns mean more homes of that dwelling type; the coloured heights show tenure within each type. Separate houses, townhouses, apartments, other, then not stated run left to right.',data:'mosaic',source:'census',tables:'G37',idiom:'Mosaic',chapter:1});

// Two-axis alluvial: band thickness is the actual G42 joint count. It is an
// association, not a flow over time. Both ends use the same count denominator.
const left=['Family household','One person','Group household'];
const right=['Separate house','Townhouse','Apartment','Other / not stated'];
const ft=households.reduce((s,d)=>s+d.count,0),gap=.035,available=1-gap*(right.length-1);
const positions=(field,groups)=>{let cursor=0;return Object.fromEntries(groups.map(label=>{let size=households.filter(d=>d[field]===label).reduce((s,d)=>s+d.count,0)/ft*available;let entry=[label,{start:cursor,end:cursor+size,cursor}];cursor+=size+gap;return entry;}));};
const lp=positions('household',left),rp=positions('dwelling',right);
const bands=households.map(d=>{const h=d.count/ft*available;const a=lp[d.household].cursor,b=rp[d.dwelling].cursor;lp[d.household].cursor+=h;rp[d.dwelling].cursor+=h;return {...d,a,b,h};});
const nodes=[...left.map(name=>({name,side:'left',...lp[name]})),...right.map(name=>({name,side:'right',...rp[name]}))];
await save('households',{$schema:'https://vega.github.io/schema/vega/v6.json',width:520,height:H,padding:0,autosize:'none',signals:[{name:'xLeft',update:'width*0.23'},{name:'xRight',update:'width*0.74'},{name:'plotHeight',update:'height-34'}],data:[{name:'bands',values:bands},{name:'nodes',values:nodes}],scales:[{name:'colour',type:'ordinal',domain:left,range:['#386b62','#a46931','#655775']}],marks:[{type:'path',from:{data:'bands'},encode:{update:{path:{signal:"'M'+xLeft+','+(datum.a*plotHeight)+' C'+(width*.5)+','+(datum.a*plotHeight)+' '+(width*.5)+','+(datum.b*plotHeight)+' '+xRight+','+(datum.b*plotHeight)+' L'+xRight+','+((datum.b+datum.h)*plotHeight)+' C'+(width*.5)+','+((datum.b+datum.h)*plotHeight)+' '+(width*.5)+','+((datum.a+datum.h)*plotHeight)+' '+xLeft+','+((datum.a+datum.h)*plotHeight)+' Z'"},fill:{scale:'colour',field:'household'},fillOpacity:{value:.65},tooltip:{signal:"{'Household':datum.household,'Dwelling':datum.dwelling,'Homes':format(datum.count,',')}"}}}},{type:'rect',from:{data:'nodes'},encode:{update:{x:{signal:"datum.side==='left'?xLeft-6:xRight"},width:{value:6},y:{signal:'datum.start*plotHeight'},y2:{signal:'datum.end*plotHeight'},fill:{value:C.ink}}}},{type:'text',from:{data:'nodes'},encode:{update:{x:{signal:"datum.side==='left'?xLeft-12:xRight+12"},y:{signal:'(datum.start+datum.end)/2*plotHeight'},text:{signal:"datum.name==='One person'?['One','person']:datum.name==='Family household'?['Family','household']:datum.name==='Group household'?['Group','household']:datum.name==='Separate house'?['Separate','house']:datum.name==='Other / not stated'?['Other /','not stated']:datum.name"},fontSize:{value:13},lineHeight:{value:15},baseline:{value:'middle'},align:{signal:"datum.side==='left'?'right':'left'"},limit:{signal:'width*.23-12'},fill:{value:C.ink}}}}]},{title:'Who lives in which kind of home?',description:'Bands connect household composition to dwelling type. Wider bands mean more households, not movement between homes. Other and unreported dwelling types are combined here.',data:'households',source:'census',tables:'G42',idiom:'Alluvial',chapter:1});

const mapData={url:'data/regions.topo.json',format:{type:'topojson',feature:'regions'}};
const stateData={url:'data/states.topo.json',format:{type:'topojson',feature:'states'}};
const regionsTransform=[{lookup:'properties.SA3_CODE21',from:{data:url('sa3'),key:'code',fields:['name','rent','income']}}];
// The national map and the city insets use separate circle-size scales,
// each with its own legend: national circles stay small enough to limit
// overlap, while inset circles are enlarged so city regions stay readable.
const sizeLegend=title=>({title,orient:'bottom',values:[10000,40000,80000],format:'~s',symbolFillColor:'#c9c9c9',symbolStrokeColor:C.ink,symbolStrokeWidth:.6});
function mapView(symbols=false, city=null){
  const width=city?360:660,height=city?340:450;
  const projection=city?{type:'mercator',center:city.center,scale:city.scale,translate:[width/2,height/2]}:{type:'albers',rotate:[-132,0,0],center:[0,-28],parallels:[-18,-36],scale:width*.99,translate:[width/2,height/2]};
  // City insets draw SA3 boundaries underneath the circles for orientation.
  const backgroundData=symbols&&!city?stateData:mapData;
  const background={data:backgroundData,transform:symbols?[]:regionsTransform,mark:{type:'geoshape',stroke:'#ffffff',strokeWidth:symbols?(city?.8:.6):.35,clip:true},encoding:{color:symbols?{value:'#e9ece9'}:{condition:{test:'isValid(datum.rent)',...rentColor},value:'#c4c4c4'},...(symbols?{}:{tooltip:priceTip})}};
  const layers=[background];
  if(symbols)layers.push({data:url('sa4'),mark:{type:'circle',opacity:.82,stroke:'#ffffff',strokeWidth:city?1.4:.9,clip:true},encoding:{longitude:q('longitude'),latitude:q('latitude'),order:{field:'renting',type:'quantitative',sort:'descending'},size:q('renting',null,{scale:{domain:[0,80000],range:city?[0,2600]:[0,900]},legend:sizeLegend(city?'Rented homes · city insets':'Rented homes · national map')}),color:q('rentalShare','Share renting',{scale:shareColor,legend:{orient:'bottom',format:'.0%',gradientLength:170}}),tooltip:[n('name','SA4 region'),q('renting','Rented homes',{format:','}),q('rentalShare','Share renting',{format:'.1%'})]}});
  else{
    // A white halo under a dark outline keeps featured boundaries visible on
    // both the palest and the darkest rent classes.
    const featuredShapes={data:mapData,transform:[{filter:{field:'properties.SA3_CODE21',oneOf:cases.map(d=>d.code)}}]};
    layers.push({...featuredShapes,mark:{type:'geoshape',filled:false,stroke:'#ffffff',strokeWidth:4,clip:true}});
    layers.push({...featuredShapes,mark:{type:'geoshape',filled:false,stroke:C.ink,strokeWidth:1.8,clip:true}});
  }
  return {width,height,projection,layer:layers,...(city?{title:city.name}:{})};
}
const cities=[{name:'Sydney',center:[151.05,-33.84],scale:28000},{name:'Melbourne',center:[145.05,-37.84],scale:19000},{name:'Brisbane',center:[153.0,-27.5],scale:24000}];
for(const [id,symbols] of [['rent-map',false],['renter-map',true]])await save(id,{vconcat:[mapView(symbols),{hconcat:cities.map(c=>mapView(symbols,c)),spacing:20,resolve:{scale:{size:'shared'}}}],resolve:{scale:{color:'shared',size:symbols?'independent':'shared'}},spacing:16},{title:symbols?'Where rented homes are concentrated':'A national median hides local differences',description:symbols?'Circle area shows rented homes in 88 larger Census regions (SA4). Darker colour means a greater share renting. City insets use larger circles; read them with their own size key.':'Colour shows each region’s median weekly rent, in $50 steps. Darker means higher rent; grey means no data. Outlines mark the three featured communities.',data:symbols?'sa4':'sa3',source:'census',tables:'G02, G37; ASGS 2021 boundaries',idiom:symbols?'Proportional-symbol map':'Choropleth',chapter:2,wide:true,map:true});

await save('rent-distribution',{width:520,height:H,data:url('sa3'),mark:{type:'bar',color:C.rent,binSpacing:1},encoding:{x:q('rent','Regional median weekly rent ($)',{bin:{step:50},axis:{format:'$,.0f'}}),y:{aggregate:'count',type:'quantitative',title:'Number of regions'},tooltip:[q('rent','Rent band starts at',{bin:{step:50},format:'$,.0f'}),{aggregate:'count',type:'quantitative',title:'Regions'}]}},{title:'Most regional medians sit in the middle',description:'Each bar counts regions whose median weekly rent falls within a $50 interval. This is a distribution of regional medians, not a distribution of renters or their rent payments.',data:'sa3',source:'census',tables:'G02',idiom:'Histogram',chapter:2});

const selectedCase={name:'featured',value:'all'};
const caseFilter={filter:{field:'code',oneOf:cases.map(d=>d.code)}};
// Melbourne City and Casey – South sit close together, so their labels go
// to opposite sides of their points. A white copy underneath acts as a halo.
const caseLabel={calculate:"replace(datum.name,' - ',' – ')",as:'label'};
const labelPlacement={align:{expr:"datum.code==='21203'?'left':'right'"},dx:{expr:"datum.code==='21203'?10:-10"},dy:{expr:"datum.code==='20604'?-14:datum.code==='21203'?16:0"}};
const opacityCondition={condition:{test:"featured === 'all' || datum.code === featured",value:1},value:.18};
await save('income-rent',{width:520,height:H,params:[selectedCase],data:url('sa3'),layer:[{mark:{type:'circle',size:32,color:'#9d9d9d',opacity:.45},encoding:{x:q('income','Median household income / week ($)',{scale:{zero:false},axis:{format:'~s'}}),y:q('rent','Median rent / week ($)',{scale:{zero:false},axis:{format:'$,.0f'}}),tooltip:priceTip}},{data:{values:[{income:summary.nationalIncome}]},mark:{type:'rule',strokeDash:[4,4],color:'#777'},encoding:{x:q('income')}},{data:{values:[{rent:summary.nationalRent}]},mark:{type:'rule',strokeDash:[4,4],color:'#777'},encoding:{y:q('rent')}},{transform:[caseFilter],mark:{type:'point',filled:true,size:130,color:C.rent,stroke:C.ink,strokeWidth:1.5},encoding:{x:q('income'),y:q('rent'),opacity:opacityCondition,tooltip:priceTip}},{transform:[caseFilter,caseLabel],mark:{type:'text',fontSize:13,fontWeight:600,stroke:'#ffffff',strokeWidth:4,strokeJoin:'round',...labelPlacement},encoding:{x:q('income'),y:q('rent'),text:n('label'),opacity:opacityCondition}},{transform:[caseFilter,caseLabel],mark:{type:'text',fontSize:13,fontWeight:600,color:C.ink,...labelPlacement},encoding:{x:q('income'),y:q('rent'),text:n('label'),opacity:opacityCondition}}]},{title:'Higher-income places often have higher rents',description:'One dot is one region. Dashed lines show the published Australian household medians: $1,746 income and $375 rent per week. The association does not establish causation, and dividing these regional medians would not measure rental stress.',data:'sa3',source:'census',tables:'G02',idiom:'Scatterplot (basic)',chapter:3,linked:true});

await save('state-spread',{width:520,height:H,data:url('sa3'),mark:{type:'boxplot',extent:'min-max',size:22,color:C.rent,median:{color:'#fff',strokeWidth:2},outliers:false},encoding:{y:n('state',null,{sort:['NSW','Vic','Qld','SA','WA','Tas','NT','ACT']}),x:q('rent','Regional median weekly rent ($)',{axis:{format:'$,.0f'}})}},{title:'There is no single rental market within a state',description:'Each row is one state. The line runs from its cheapest region to its dearest. The box holds the middle half of its regions. The white mark is the typical region. A long row means rents vary a lot.',data:'sa3',source:'census',tables:'G02',idiom:'Box plot',chapter:3});

const regions=await read('sa3');
// Each axis gets a rounded maximum and evenly spaced, labelled ticks, so
// readers can read dollar values off every axis.
const axisSteps={income:[4000,1000],rent:[800,200],mortgageWeekly:[1000,250],apartmentShare:[1,.25]};
const dimensions=[['income','Income / week'],['rent','Rent / week'],['mortgageWeekly','Mortgage / week'],['apartmentShare','Apartments']].map(([field,label],i)=>({field,label,i,max:axisSteps[field][0],min:0}));
const ticks=dimensions.flatMap(d=>{const [max,step]=axisSteps[d.field];return Array.from({length:Math.round(max/step)+1},(_,k)=>({field:d.field,normal:k*step/max,text:d.field==='apartmentShare'?`${Math.round(k*step*100)}%`:`$${(k*step).toLocaleString('en-AU')}`}));});
if(regions.some(r=>dimensions.some(d=>r[d.field]>d.max)))throw new Error('A parallel-coordinates value exceeds its axis maximum.');
const profiles=regions.flatMap(r=>dimensions.map(d=>({code:r.code,name:r.name,dimension:d.field,i:d.i,normal:r[d.field]/d.max,raw:r[d.field],label:d.label,featured:cases.some(c=>c.code===r.code)})));
await save('profiles',{$schema:'https://vega.github.io/schema/vega/v6.json',width:1000,height:330,padding:{left:50,right:25,top:30,bottom:12},autosize:'none',signals:[{name:'featured',value:'all'}],data:[{name:'profiles',values:profiles},{name:'axes',values:dimensions},{name:'ticks',values:ticks},{name:'context',source:'profiles',transform:[{type:'filter',expr:'!datum.featured'}]},{name:'examples',source:'profiles',transform:[{type:'filter',expr:'datum.featured'}]}],scales:[{name:'x',type:'point',domain:dimensions.map(d=>d.field),range:'width',padding:.16},{name:'y',type:'linear',domain:[0,1],range:'height'}],marks:[{type:'rule',from:{data:'axes'},encode:{enter:{x:{scale:'x',field:'field'},y:{value:0},y2:{signal:'height'},stroke:{value:'#c3c3c3'}}}},{type:'text',from:{data:'axes'},encode:{enter:{x:{scale:'x',field:'field'},y:{value:-16},align:{value:'center'},text:{field:'label'},fill:{value:C.ink},fontSize:{value:13},fontWeight:{value:600}}}},{type:'rule',from:{data:'ticks'},encode:{enter:{x:{scale:'x',field:'field',offset:-4},x2:{scale:'x',field:'field'},y:{scale:'y',field:'normal'},stroke:{value:'#9a9a9a'}}}},{type:'text',from:{data:'ticks'},encode:{enter:{x:{scale:'x',field:'field',offset:-7},y:{scale:'y',field:'normal'},align:{value:'right'},baseline:{value:'middle'},text:{field:'text'},fill:{value:C.muted},fontSize:{value:12}}}},{type:'group',from:{facet:{name:'line',data:'context',groupby:'code'}},marks:[{type:'line',from:{data:'line'},encode:{enter:{x:{scale:'x',field:'dimension'},y:{scale:'y',field:'normal'},stroke:{value:'#777'},strokeOpacity:{value:.11},strokeWidth:{value:1}}}}]},{type:'group',from:{facet:{name:'highlight',data:'examples',groupby:'code'}},marks:[{type:'line',from:{data:'highlight'},encode:{update:{x:{scale:'x',field:'dimension'},y:{scale:'y',field:'normal'},stroke:{value:C.rent},strokeWidth:{value:2.2},strokeDash:{signal:"datum.code==='20604'?[1,0]:datum.code==='21203'?[7,3]:[2,3]"},strokeOpacity:{signal:"featured==='all'||datum.code===featured?1:.12"},tooltip:{signal:"{'Region':datum.name}"}}}},{type:'symbol',from:{data:'highlight'},encode:{update:{x:{scale:'x',field:'dimension'},y:{scale:'y',field:'normal'},size:{value:40},fill:{value:C.rent},opacity:{signal:"featured==='all'||datum.code===featured?1:.12"},tooltip:{signal:"{'Region':datum.name,'Measure':datum.label,'Value':datum.dimension==='apartmentShare'?format(datum.raw,'.1%'):format(datum.raw,'$,.0f')}"}}}}]}]},{title:'Similar rents can come with very different homes',description:'Each line is one region, read across four axes. Each axis has its own scale. Higher means more, not better. Monthly mortgages are shown weekly (×12÷52).',data:'sa3',source:'census',tables:'G02, G37',idiom:'Parallel coordinates',chapter:3,wide:true,linked:true});

// The index is drawn on an axis that starts at zero, so the rise is not
// exaggerated. End labels state the change, which is small at this scale.
const cpi=await read('cpi');
const cpiEnd=cpi.filter(d=>d.date===cpi.at(-1).date).map(d=>({...d,label:d.series+' '+d.index.toFixed(1)+' (+'+(d.index-100).toFixed(1)+'%)'}));
const seriesColour={scale:{domain:['Rents','All prices'],range:[C.rent,C.ink]}};
await save('prices',{width:520,height:HM,data:url('cpi'),layer:[{mark:{type:'line',strokeWidth:2.5},encoding:{x:{field:'date',type:'temporal',title:null,axis:{format:'%b %Y',tickCount:4}},y:q('index',['Price index','April 2024 = 100'],{scale:{domain:[0,120],nice:false},axis:{values:[0,20,40,60,80,100,120]}}),color:n('series',null,{...seriesColour,legend:{orient:'top'}}),strokeDash:{field:'series',type:'nominal',scale:{domain:['Rents','All prices'],range:[[1,0],[6,3]]},legend:{orient:'top'}},tooltip:[{field:'date',type:'temporal',title:'Month',format:'%B %Y'},n('series','Series'),q('index','April 2024 = 100',{format:'.1f'})]}},{data:{values:cpiEnd},mark:{type:'text',align:'right',fontSize:12,fontWeight:600,dy:{expr:"datum.series==='Rents'?-12:17"}},encoding:{x:{field:'date',type:'temporal'},y:q('index'),text:n('label'),color:n('series',null,{...seriesColour,legend:null})}}]},{title:'The cost of renting keeps changing',description:'Both price indexes start at 100 in April 2024, on an axis from zero. By July 2026, rents were 9.8% higher and all prices 6.9% higher. These are eight-capital-city CPI measures, not advertised rents.',data:'cpi',source:'cpi',tables:'Table 3, original monthly series',idiom:'Multi-line chart (basic)',chapter:4});

// Glyph map: a bar on each state shows the share paying over half their
// income on rent. Bars keep their pixel size while the map zooms and pans.
// ACT is too small to hold a bar, so its bar sits offshore with a leader line.
const glyphs=[['NSW',146.0,-30.6],['Vic',144.0,-38.0],['Qld',144.5,-22.0],['SA',135.0,-30.5],['WA',121.8,-27.0],['Tas',146.6,-44.0],['NT',133.4,-20.5],['ACT',152.8,-37.2,149.1,-35.45]].map(([state,lon,lat,ax,ay])=>({state,lon,lat,ax:ax??null,ay:ay??null}));
await save('severe',{$schema:'https://vega.github.io/schema/vega/v6.json',width:520,height:HM,padding:{left:2,right:2,top:4,bottom:4},autosize:'none',
 signals:[
  {name:'baseScale',update:'min(width/0.75, height/0.62)*0.95'},
  // Pixels of bar per percentage point: smaller maps get shorter bars.
  {name:'unit',update:'baseScale/350'},
  // Zoom: ctrl/⌘ + wheel or trackpad pinch, double-click, or the page's buttons
  // (which set zoomCommand). Plain scrolling still scrolls the story.
  {name:'zoomCommand',value:null},
  {name:'anchor',value:[0,0],on:[{events:{type:'wheel',filter:['event.ctrlKey || event.metaKey']},update:'xy()'},{events:'dblclick',update:'xy()'},{events:{signal:'zoomCommand'},update:'[width/2, height/2]'}]},
  {name:'step',value:1,on:[{events:{type:'wheel',consume:true,filter:['event.ctrlKey || event.metaKey']},force:true,update:'pow(1.004, -event.deltaY * pow(16, event.deltaMode))'},{events:'dblclick',force:true,update:'2'},{events:{signal:'zoomCommand'},force:true,update:'zoomCommand.reset ? 1/k : zoomCommand.step'}]},
  {name:'factor',value:1,on:[{events:{signal:'step'},force:true,update:'clamp(k * step, 1, 8) / k'}]},
  {name:'k',value:1,on:[{events:{signal:'factor'},update:'k * factor'}]},
  // Pan by dragging. Touch dragging only pans once zoomed, so it never
  // traps page scrolling on a phone.
  {name:'down',value:null,on:[{events:'mousedown',update:'xy()'},{events:{type:'touchstart',filter:'k > 1'},update:'xy()'},{events:'window:mouseup, touchend',update:'null'}]},
  {name:'offsetAtDown',value:[0,0],on:[{events:'mousedown',update:'offset'},{events:{type:'touchstart',filter:'k > 1'},update:'offset'}]},
  {name:'drag',value:null,on:[{events:'[mousedown, window:mouseup] > window:mousemove!',update:'down ? [x()-down[0], y()-down[1]] : null'},{events:{type:'touchmove',consume:true,filter:'k > 1'},update:'down ? [x()-down[0], y()-down[1]] : null'}]},
  {name:'limit',update:'[(k-1)*width/2 + 40, (k-1)*height/2 + 40]'},
  {name:'offset',value:[0,0],on:[
   {events:{signal:'factor'},update:'factor===1 && k===1 ? [0,0] : [clamp((anchor[0]-width/2) - factor*((anchor[0]-width/2) - offset[0]), -limit[0], limit[0]), clamp((anchor[1]-height/2) - factor*((anchor[1]-height/2) - offset[1]), -limit[1], limit[1])]'},
   {events:{signal:'drag'},update:'drag ? [clamp(offsetAtDown[0]+drag[0], -limit[0], limit[0]), clamp(offsetAtDown[1]+drag[1], -limit[1], limit[1])] : offset'}]},
  {name:'cursor',value:'grab',on:[{events:'mousedown',update:"'grabbing'"},{events:'window:mouseup',update:"'grab'"}]}
 ],
 projections:[{name:'proj',type:'albers',rotate:[-132,0,0],center:[0,-28],parallels:[-18,-36],scale:{signal:'baseScale*k'},translate:[{signal:'width/2 + offset[0]'},{signal:'height/2 + offset[1]'}]}],
 data:[
  {name:'cra',url:'data/cra.json'},
  {name:'states',url:'data/states.topo.json',format:{type:'topojson',feature:'states'},transform:[{type:'formula',expr:"['NSW','Vic','Qld','SA','WA','Tas','NT','ACT'][toNumber(datum.properties.STE_CODE21)-1]",as:'state'}]},
  {name:'glyphs',values:glyphs,transform:[{type:'lookup',from:'cra',key:'state',fields:['state'],as:['row']},{type:'formula',expr:'datum.row.severe',as:'severe'},{type:'geopoint',projection:'proj',fields:['lon','lat'],as:['x','y']},{type:'geopoint',projection:'proj',fields:['ax','ay'],as:['axp','ayp']}]},
  {name:'key',values:[{v:10},{v:20},{v:30}]}
 ],
 marks:[
  {type:'group',encode:{update:{width:{signal:'width'},height:{signal:'height'},clip:{value:true},fill:{value:'#ffffff'},cursor:{signal:'cursor'}}},marks:[
   {type:'shape',from:{data:'states'},encode:{update:{fill:{value:'#e6e3e7'},stroke:{value:'#ffffff'},strokeWidth:{value:1.2},tooltip:{signal:"{'State / territory':datum.state}"}}},transform:[{type:'geoshape',projection:'proj'}]},
   {type:'rule',from:{data:'glyphs'},encode:{update:{x:{signal:'datum.ax===null ? datum.x : datum.axp'},y:{signal:'datum.ax===null ? datum.y : datum.ayp'},x2:{signal:'datum.x - 8'},y2:{signal:'datum.y'},stroke:{value:C.ink},strokeWidth:{value:.8},opacity:{signal:'datum.ax===null ? 0 : 1'}}}},
   {type:'rule',from:{data:'glyphs'},encode:{update:{x:{signal:'datum.x - 12'},x2:{signal:'datum.x + 12'},y:{field:'y'},stroke:{value:C.ink},strokeWidth:{value:1}}}},
   {type:'rect',from:{data:'glyphs'},encode:{update:{x:{signal:'datum.x - 8'},width:{value:16},y:{signal:'datum.y - datum.severe*unit'},y2:{field:'y'},fill:{value:C.pressure},tooltip:{signal:"{'State / territory':datum.state,'Over 50% of income on rent, after assistance':format(datum.severe,'.1f')+'%','Rental stress after assistance':format(datum.row.after,'.1f')+'%'}"}}}},
   {type:'text',from:{data:'glyphs'},encode:{update:{x:{field:'x'},y:{signal:'datum.y - datum.severe*unit - 4'},text:{signal:"format(datum.severe,'.1f')+'%'"},align:{value:'center'},baseline:{value:'bottom'},fontSize:{value:12},fill:{value:'#000000'}}}},
   {type:'text',from:{data:'glyphs'},encode:{update:{x:{field:'x'},y:{signal:'datum.y + 4'},text:{field:'state'},align:{value:'center'},baseline:{value:'top'},fontSize:{value:12},fontWeight:{value:600},fill:{value:'#000000'}}}}
  ]},
  // Fixed key: reference bars for 10%, 20% and 30%.
  {type:'text',encode:{update:{x:{value:6},y:{signal:'height - 26 - 30*unit'},text:{value:'Bar height'},fontSize:{value:11},fill:{value:C.muted}}}},
  {type:'rect',from:{data:'key'},encode:{update:{x:{signal:'6 + (datum.v/10-1)*30'},width:{value:12},y:{signal:'height - 14 - datum.v*unit'},y2:{signal:'height - 14'},fill:{value:C.pressure},opacity:{value:.75}}}},
  {type:'text',from:{data:'key'},encode:{update:{x:{signal:'12 + (datum.v/10-1)*30'},y:{signal:'height - 2'},text:{signal:"datum.v+'%'"},align:{value:'center'},fontSize:{value:11},fill:{value:C.muted}}}}
 ]},{title:'Some still spend over half their income on rent',description:'Each bar shows the share of assistance recipients paying over half their income in rent, after assistance. Zoom with the buttons, ctrl + scroll or double-click; drag to move the map.',data:'cra',source:'aihw',tables:'CRA.3, March 2026',idiom:'Glyph map (interactive)',chapter:4,zoom:true});

await save('payment-stress',{width:1000,height:310,data:url('heatmap'),layer:[{mark:{type:'rect',stroke:'#fff',strokeWidth:3},encoding:{x:n('payment',null,{sort:['Age pension','Disability support','Carer','Single parent','JobSeeker','Student / apprentice'],axis:{orient:'top',labelAngle:0,labelLimit:175}}),y:n('state',null,{sort:['NSW','Vic','Qld','SA','WA','Tas','NT','ACT']}),color:q('rate','In rental stress after assistance (%)',{scale:{domain:[0,100],range:['#f5eff6',C.pressure]},legend:{orient:'bottom',gradientLength:240,titleLimit:400}}),tooltip:[n('state','State / territory'),n('fullPayment','Primary payment'),q('rate','In stress after assistance (%)',{format:'.1f'})]}},{transform:[{calculate:"isValid(datum.rate)?format(datum.rate,'.0f')+'%':'—'",as:'label'}],mark:{type:'text',fontSize:14},encoding:{x:n('payment',null,{sort:['Age pension','Disability support','Carer','Single parent','JobSeeker','Student / apprentice']}),y:n('state',null,{sort:['NSW','Vic','Qld','SA','WA','Tas','NT','ACT']}),text:n('label'),color:{condition:{test:'datum.rate>72',value:'#fff'},value:'#000000'}}}]},{title:'Payment groups face different levels of pressure',description:'Each cell shows the percentage in rental stress after assistance within that state and primary payment group. The six selected groups are distinct published categories, not the entire recipient population. Student / apprentice means Youth Allowance; single parent means Parenting Payment (Single).',data:'heatmap',source:'aihw',tables:'CRA.2, March 2026',idiom:'Heatmap',chapter:4,wide:true});

await save('assistance',{width:520,height:H,data:url('cra'),layer:[{mark:{type:'rule',stroke:'#aaa',strokeWidth:2},encoding:{y:n('state',null,{sort:['NSW','Vic','Qld','SA','WA','Tas','NT','ACT']}),x:q('after','Recipients in rental stress (%)',{scale:{domain:[0,100]},axis:{values:[0,25,50,75,100]}}),x2:{field:'before'},tooltip:[n('state','State / territory'),q('before','Without assistance (%)',{format:'.1f'}),q('after','With assistance (%)',{format:'.1f'})]}},{transform:[{fold:['before','after'],as:['basis','rate']},{calculate:"datum.basis==='before'?'Without assistance':'With assistance'",as:'basisLabel'}],mark:{type:'point',filled:true,size:100,strokeWidth:2},encoding:{y:n('state',null,{sort:['NSW','Vic','Qld','SA','WA','Tas','NT','ACT']}),x:q('rate'),color:n('basisLabel',null,{scale:{domain:['Without assistance','With assistance'],range:['#8a8a8a',C.pressure]},legend:{orient:'top'}}),shape:n('basisLabel',null,{scale:{domain:['Without assistance','With assistance'],range:['circle','diamond']},legend:{orient:'top'}}),tooltip:[n('state','State / territory'),n('basisLabel','Calculation'),q('rate','In rental stress (%)',{format:'.1f'})]}}]},{title:'Assistance reduces the measured burden',description:'Each pair describes the same recipients in March 2026. “Without” is a calculation that leaves assistance out, not an earlier observation or a controlled policy experiment. Rental stress means rent exceeds 30% of gross income.',data:'cra',source:'aihw',tables:'CRA.2, March 2026',idiom:'Paired-dot chart (counted as basic)',chapter:4});
await writeFile('public/charts/index.json',JSON.stringify(entries,null,2)+'\n');
console.log(`Built ${entries.length} original, readable Vega / Vega-Lite specifications.`);
