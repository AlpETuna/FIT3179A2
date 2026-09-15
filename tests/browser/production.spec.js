import {test,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';

let server,base;
const root=resolve('dist');
const prefix='/review-repo/';
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2'};
test.beforeAll(async()=>{
 server=createServer(async(req,res)=>{
  try{
   const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   if(!pathname.startsWith(prefix)){res.writeHead(404).end();return;}
   const file=resolve(root,pathname.slice(prefix.length)||'index.html');
   if(!file.startsWith(root+sep)){res.writeHead(403).end();return;}
   const body=await readFile(file);
   res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'}).end(body);
  }catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 base=`http://127.0.0.1:${server.address().port}${prefix}`;
});
test.afterAll(async()=>{server?.closeAllConnections();await new Promise(resolve=>server?.close(resolve));});

for(const width of [1440,390])test(`built site works at a repository subpath, ${width}px`,async({page})=>{
 const failures=[],outsideRequests=[];
 page.on('response',r=>{if(r.status()>=400)failures.push(`${r.status()} ${r.url()}`);});
 page.on('pageerror',e=>failures.push(e.message));
 page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))outsideRequests.push(r.url());});
 await page.setViewportSize({width,height:900});
 await page.goto(base);
 await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 await expect(page.locator('.chart[data-ready="true"]')).toHaveCount(14);
 expect(failures).toEqual([]);expect(outsideRequests).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'Bendigo',exact:true}).click();
 await expect(page.locator('#chart-profiles path[stroke-opacity="0.12"]')).toHaveCount(2);
 const specifications=await page.locator('.downloads a:last-child').evaluateAll(links=>links.map(l=>l.href));
 for(const url of specifications){const response=await page.request.get(url);expect(response.status()).toBe(200);expect((await response.json()).$schema).toContain('vega');}
});
