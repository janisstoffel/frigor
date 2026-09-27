'use strict';
const stage = document.getElementById('stage');
const state = {fabric:'#e3e0d7',fabricName:'Stein',accent:'#ff5a24',accentName:'Frigor Orange',design:'panel',team:'DEIN TEAM',view:'back'};
const designs = {panel:'Schulterpartie',plain:'Einfarbig',stripe:'Diagonaler Streifen'};
const hex = /^#[0-9a-f]{6}$/i;
function update() {
  stage.style.setProperty('--fabric',state.fabric);
  stage.style.setProperty('--accent',state.accent);
  const rgb=state.fabric.slice(1).match(/.{2}/g).map(v=>parseInt(v,16));
  stage.style.setProperty('--ink',(rgb[0]*.299+rgb[1]*.587+rgb[2]*.114)>145?'#171717':'#f5f2e9');
  stage.dataset.design=state.design;stage.dataset.view=state.view;
  document.getElementById('back-logo').textContent=state.team;
  document.getElementById('front-logo').textContent=state.team;
  document.getElementById('back-logo').setAttribute('font-size',state.team.length>13?'20':'27');
  document.getElementById('front-logo').setAttribute('font-size',state.team.length>13?'9':'12');
  document.getElementById('vest-title').textContent=`Anpassbare Ventilatorweste, ${state.view==='back'?'Rückansicht':'Vorderansicht'}`;
  for(const key of ['fabric','accent']){
    document.getElementById(`${key}-name`).textContent=state[`${key}Name`];
    document.getElementById(`${key}-custom`).value=state[key];
    document.querySelectorAll(`#${key}-swatches button`).forEach(b=>{const active=b.dataset.color===state[key];b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});
  }
  document.querySelectorAll('.view-switch button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===state.view)));
  const body=`Guten Tag Janis\n\nWir interessieren uns für eine Vorführung und diese Gestaltungsidee:\n\nGrundfarbe: ${state.fabricName} (${state.fabric})\nAkzentfarbe: ${state.accentName} (${state.accent})\nDesign: ${designs[state.design]}\nBeschriftung: ${state.team||'Ohne'}\n\nUnser Betrieb:\nOrt:\nUngefähre Teamgrösse:\n\nFreundliche Grüsse`;
  document.getElementById('config-enquiry').href=`mailto:frigorindustries@gmail.com?subject=${encodeURIComponent('Frigor Teamweste: Gestaltung und Vorführung')}&body=${encodeURIComponent(body)}`;
  document.getElementById('config-status').textContent=`Vorschau: ${state.fabricName}, ${state.accentName}, ${designs[state.design]}.`;
}
for(const key of ['fabric','accent']){
  document.querySelectorAll(`#${key}-swatches button`).forEach(b=>b.addEventListener('click',()=>{state[key]=b.dataset.color;state[`${key}Name`]=b.dataset.name;update();}));
  document.getElementById(`${key}-custom`).addEventListener('input',e=>{if(!hex.test(e.target.value))return;state[key]=e.target.value;state[`${key}Name`]='Eigene Farbe';update();});
}
document.getElementById('design').addEventListener('change',e=>{state.design=e.target.value;update();});
document.getElementById('team').addEventListener('input',e=>{state.team=e.target.value.slice(0,18);update();});
document.getElementById('config-form').addEventListener('submit',e=>e.preventDefault());
document.querySelectorAll('.view-switch button').forEach(b=>b.addEventListener('click',()=>{state.view=b.dataset.view;update();}));
const motion=document.getElementById('motion');
function setMotion(enabled){stage.classList.toggle('motion-enabled',enabled);stage.classList.toggle('paused',!enabled);motion.setAttribute('aria-pressed',String(enabled));motion.innerHTML=enabled?'<span class="motion-icon" aria-hidden="true">Ⅱ</span> Animation pausieren':'<span class="motion-icon" aria-hidden="true">▷</span> Animation starten';}
motion.addEventListener('click',()=>setMotion(stage.classList.contains('paused')));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');setMotion(!reduced.matches);
reduced.addEventListener('change',e=>setMotion(!e.matches));update();
// Optional browser-agent access to the same local preview controls. Never sends an email.
if(document.modelContext?.registerTool){
  const lifecycle=new AbortController();
  try{Promise.resolve(document.modelContext.registerTool({name:'configure_vest_preview',title:'Frigor Weste gestalten',description:'Updates the local vest design preview. Does not order, submit or send an email.',inputSchema:{type:'object',properties:{fabric:{type:'string',pattern:'^#[0-9a-fA-F]{6}$'},accent:{type:'string',pattern:'^#[0-9a-fA-F]{6}$'},design:{type:'string',enum:['plain','panel','stripe']},team:{type:'string',maxLength:18},view:{type:'string',enum:['front','back']}},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute(input){if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Invalid configuration');for(const k of Object.keys(input)){if(!['fabric','accent','design','team','view'].includes(k))throw new Error('Unknown field');if(['fabric','accent'].includes(k)&&!(typeof input[k]==='string'&&hex.test(input[k])))throw new Error('Invalid colour');if(k==='design'&&!Object.hasOwn(designs,input[k]))throw new Error('Invalid design');if(k==='view'&&!['front','back'].includes(input[k]))throw new Error('Invalid view');if(k==='team'&&(typeof input[k]!=='string'||input[k].length>18))throw new Error('Invalid team text');}Object.assign(state,input);for(const k of ['fabric','accent'])if(input[k])state[`${k}Name`]='Eigene Farbe';document.getElementById('team').value=state.team;document.getElementById('design').value=state.design;update();return {...state};}},{signal:lifecycle.signal})).catch(()=>{});}catch{}window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
