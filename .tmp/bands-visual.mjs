import puppeteer from 'file:///C:/Users/Nathan Meloul/Documents/GitHub/llunna-core-brain-map-previews/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import assert from 'node:assert/strict';
const browser=await puppeteer.launch({executablePath:'C:/Users/Nathan Meloul/.cache/puppeteer/chrome/win64-146.0.7680.31/chrome-win64/chrome.exe',headless:true});
try {
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 for(const width of [1440,390]) {
  await page.setViewport({width,height:1400,isMobile:width===390,hasTouch:width===390});
  await page.goto('http://127.0.0.1:4322/architecture/',{waitUntil:'networkidle0'});
  await page.addStyleTag({content:'html {scroll-behavior:auto!important}'});
  assert.equal(await page.$$eval('[data-bundle-source]',els=>els.length),14);
  assert.equal(await page.$$eval('.ribbon-band',els=>els.length),14);
  assert.equal(await page.$$eval('.ribbon-strand,.ribbon-halo',els=>els.length),0);
  for(const state of ['rest','cognition','memory','inference']) {
   if(state==='rest') await page.click('[data-overview-reset]');
   else if(width===390) await page.tap(`[data-overview-choice="${state}"]`);
   else await page.click(`[data-overview-choice="${state}"]`);
   const active=await page.$$eval('[data-bundle-source].is-active',els=>els.map(e=>[e.dataset.bundleSource,e.dataset.bundleTarget]));
   const expected=await page.$$eval('[data-bundle-source]',(els,state)=>els.filter(e=>e.dataset.bundleSource===state||e.dataset.bundleTarget===state).map(e=>[e.dataset.bundleSource,e.dataset.bundleTarget]),state);
   assert.deepEqual(active,expected);
   await new Promise(resolve=>setTimeout(resolve,220));
   assert(await page.$$eval('[data-bundle-source]:not(.is-active)',els=>els.every(el=>Number(getComputedStyle(el).opacity)===0)));
   if(state==='inference') assert.deepEqual(active,[['cognition','inference']]);
   assert.equal(await page.$$eval('[data-overview-border].is-active',els=>els.length),state==='rest'?0:1);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.$eval('.overview-brain',el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY-100,behavior:'instant'}));
   await page.mouse.move(0,0);
   await new Promise(resolve=>setTimeout(resolve,220));
   await (await page.$('.overview-brain')).screenshot({path:`.tmp/bands-${width}-${state}.png`});
   console.log(`${width}px ${state}: correct active corridors, hierarchy and no overflow PASS`);
  }
  if(width===1440) {
   const collisions=await page.evaluate(()=>{
    const copy=[...document.querySelectorAll('.overview-lobe-copy h3,.overview-lobe-copy p,.overview-lobe-copy li,.overview-lobe-copy small')].map(el=>({label:el.textContent,rect:el.getBoundingClientRect()}));
    return [...document.querySelectorAll('[data-bundle-source]')].flatMap(group=>{
     const path=group.querySelector('.ribbon-band');const matrix=path.getScreenCTM();const pad=Number(path.getAttribute('stroke-width'))*matrix.a/2+2;const hits=new Set();
     for(let at=0;at<=path.getTotalLength();at+=2){const p=path.getPointAtLength(at).matrixTransform(matrix);for(const {label,rect} of copy)if(p.x>rect.left-pad&&p.x<rect.right+pad&&p.y>rect.top-pad&&p.y<rect.bottom+pad)hits.add(label);}
     return [...hits].map(label=>`${group.dataset.bundleSource}:${group.dataset.bundleTarget} overlaps ${label}`);
    });
   });
   console.log('Text clearance:',JSON.stringify(collisions));
   assert.deepEqual(collisions,[]);
  }
 }
 assert.deepEqual(errors,[]);
} finally {await browser.close();}
