import puppeteer from 'file:///C:/Users/Nathan Meloul/Documents/GitHub/llunna-core-brain-map-previews/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import assert from 'node:assert/strict';
const browser = await puppeteer.launch({executablePath:'C:/Users/Nathan Meloul/.cache/puppeteer/chrome/win64-146.0.7680.31/chrome-win64/chrome.exe',headless:true});
try {
 const page=await browser.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(String(e)));
 for(const width of [1440,390]) {
  await page.setViewport({width,height:1000,isMobile:width===390,hasTouch:width===390});
  await page.goto('http://127.0.0.1:4321/architecture/',{waitUntil:'networkidle0'});
 await page.addStyleTag({content:'html {scroll-behavior:auto!important}'});
  assert.equal(await page.$$eval('[data-overview-region]',els=>els.length),8);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.$eval('[data-overview-region="evaluation"]',e=>e.focus());
  assert.equal(await page.$eval('[data-overview-detail="evaluation"]',e=>e.hidden),false);
  await page.keyboard.press('Space');
  assert.equal(await page.$eval('[data-overview-region="evaluation"]',e=>e.getAttribute('aria-pressed')),'true');
  await page.keyboard.press('Escape');
  if(width===1440) {
   await page.$eval('.overview-brain',e=>e.scrollIntoView({block:'start'}));
   const point=await page.$eval('.overview-brain',e=>{const p=new DOMPoint(200,300).matrixTransform(e.getScreenCTM());return {x:p.x,y:p.y};});
   await page.mouse.move(point.x,point.y);
   assert.equal(await page.$eval('[data-overview-detail="memory"]',e=>e.hidden),false);
  }
  await page.click('[data-overview-choice="memory"]');
  assert.equal(await page.$eval('[data-overview-detail="memory"]',e=>e.hidden),false);
  assert(await page.$$eval('[data-bundle-source].is-active',els=>els.length>0));
  assert(await page.$$eval('[data-bundle-source].is-muted',els=>els.length>0));
  await page.click('[data-overview-detail="memory"] a');
  assert.equal(await page.$eval('[data-architecture-family]',e=>e.value),'memory');
  await page.select('[data-architecture-family]','');
  await page.click('[data-list-node="working-memory"]');
  const counts=await page.$$eval('[data-architecture-edge]',edges=>({expected:edges.filter(e=>e.dataset.source==='working-memory'||e.dataset.target==='working-memory').length,actual:edges.filter(e=>e.classList.contains('is-connected')).length}));
  assert.equal(counts.actual,counts.expected);
  await page.type('[data-architecture-search]','Appraisal');
  assert.equal(await page.$$eval('[data-list-node]:not([hidden])',els=>els.length),1);
  if(width===390) assert(await page.evaluate(()=>document.querySelector('.architecture-inspector').getBoundingClientRect().top>=document.querySelector('.architecture-map-shell').getBoundingClientRect().bottom-1));
  await page.click('[data-overview-reset]');
  await page.$eval('[data-overview]',e=>e.scrollIntoView());
  await (await page.$('[data-overview]')).screenshot({path:`.tmp/overview-${width}.png`});
  console.log(`${width}px: overview, selection, bundles, handoff, explorer connections, search and overflow PASS`);
 }
 await page.setJavaScriptEnabled(false);
 await page.goto('http://127.0.0.1:4321/architecture/',{waitUntil:'networkidle0'});
 await page.addStyleTag({content:'html {scroll-behavior:auto!important}'});
 assert.equal(await page.$$eval('.architecture-fallback article',els=>els.length),46);
 assert.equal(await page.$$eval('[data-overview-detail]:not([hidden])',els=>els.length),8);
 console.log('Keyboard focus/Space/Escape, desktop hover, and no-JS directories PASS');
 assert.deepEqual(errors,[]);
} finally {await browser.close();}

