import {test,expect} from '@playwright/test';

for(const width of [1440,768,390]){
 test(`all charts and navigation work at ${width}px`,async({page},testInfo)=>{
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.setViewportSize({width,height:1000});
  await page.goto('/');
  await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
  await expect(page.locator('.chart[data-ready="true"]')).toHaveCount(14);
  await expect(page.locator('.chart-error')).toHaveCount(0);
  expect(errors).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  for(const chart of await page.locator('.chart').all()){
   const svg=chart.locator('svg').first();await expect(svg).toBeVisible();
   expect(await svg.locator('path,rect,line,text').count()).toBeGreaterThan(3);
  }
  await page.screenshot({path:testInfo.outputPath(`story-${width}.png`),fullPage:true});
  await page.getByRole('button',{name:'Bendigo',exact:true}).click();
  await expect(page.getByRole('button',{name:'Bendigo',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#case-description')).toContainText('$295');
  await page.locator('[data-figure="tenure"] summary').click();
  await expect(page.locator('[data-figure="tenure"] table')).toContainText('30.6%');
  await page.locator('[data-figure="tenure"] summary').click();
  await page.locator('.hero').screenshot({path:testInfo.outputPath(`hero-${width}.png`),style:'.chapter-nav{visibility:hidden}'});
  for(const id of ['tenure','dwellings','mosaic','households','rent-map','renter-map','profiles','payment-stress','income-rent','severe']){
   await page.locator(`[data-figure="${id}"]`).screenshot({path:testInfo.outputPath(`${id}-${width}.png`),style:'.chapter-nav{visibility:hidden}'});
  }
 });
}

test('a failed specification preserves its table and supports retry',async({page})=>{
 await page.route('**/charts/tenure.json',route=>route.fulfill({status:503,body:'Unavailable'}));
 await page.goto('/');
 await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
 await expect(page.locator('#chart-tenure .chart-error')).toBeVisible();
 await page.locator('[data-figure="tenure"] summary').click();
 await expect(page.locator('[data-figure="tenure"] table')).toContainText('Owned outright');
 await page.unroute('**/charts/tenure.json');
 await page.getByRole('button',{name:'Try again'}).click();
 await expect(page.locator('#chart-tenure')).toHaveAttribute('data-ready','true');
 await page.getByRole('button',{name:'Melbourne City',exact:true}).focus();
 await page.keyboard.press('Space');
 await expect(page.getByRole('button',{name:'Melbourne City',exact:true})).toHaveAttribute('aria-pressed','true');
});
