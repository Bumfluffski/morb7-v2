// drive scene. Mounted by src/pages/buying.astro. Shared helpers live in src/lib/world.js.

import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
export function mount(){
gsap.registerPlugin(ScrollTrigger,ScrollToPlugin);
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile=innerWidth<820;
/* ---------- scene ---------- */
const canvas=document.getElementById('gl');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(1.5,devicePixelRatio));renderer.setSize(innerWidth,innerHeight);
const scene=new THREE.Scene();const BG=new THREE.Color('#EEF0EF');scene.fog=new THREE.Fog(BG,18,mobile?110:150);
const camera=new THREE.PerspectiveCamera(mobile?62:48,innerWidth/innerHeight,.1,600);
const INK=new THREE.Color('#141816'),TQ=new THREE.Color('#16C2B5');
const lineMat=new THREE.LineBasicMaterial({color:INK,transparent:true,opacity:.85});
const faintMat=new THREE.LineBasicMaterial({color:INK,transparent:true,opacity:.14});
const tqLine=new THREE.LineBasicMaterial({color:TQ,transparent:true,opacity:1});
/* terrain: the road dips at z≈110. that dip is the flood */
const DIP={z:86,w:30,d:2.4};const dipY=z=>{const t=Math.min(1,Math.abs(z-DIP.z)/DIP.w);const k=1-t;return -DIP.d*(k*k*(3-2*k))};
/* ground grid */
{const g=new THREE.BufferGeometry();const pts=[];for(let z=-60;z<=420;z+=8){pts.push(-160,dipY(z),z,160,dipY(z),z)}for(let x=-160;x<=160;x+=8){for(let z=-60;z<420;z+=8){pts.push(x,dipY(z),z,x,dipY(z+8),z+8)}}g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));scene.add(new THREE.LineSegments(g,faintMat))}
/* street centre line */
{const g=new THREE.BufferGeometry();const pts=[];for(let z=-60;z<270;z+=6){pts.push(0,dipY(z)+.02,z,0,dipY(z+3)+.02,z+3)}g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));scene.add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:INK,transparent:true,opacity:.5})))}
/* houses */
let seed=1989;const R=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
const houses=[];
function house(x,z,tag){const w=5+R()*3,d=6+R()*4,h=3+R()*2.2,roof=1.6+R()*1.4;
 const g=new THREE.BufferGeometry();const v=new Float32Array([ -w/2,0,0, w/2,0,0, w/2,0,d, -w/2,0,d,  -w/2,h,0, w/2,h,0, w/2,h,d, -w/2,h,d,  0,h+roof,0, 0,h+roof,d ]);
 g.setAttribute('position',new THREE.BufferAttribute(v,3));
 g.setIndex([0,1,1,2,2,3,3,0, 4,5,5,6,6,7,7,4, 0,4,1,5,2,6,3,7, 4,8,5,8,6,9,7,9,8,9]);
 const edges=new THREE.LineSegments(g,lineMat.clone());
 // fill: a closed box+prism mesh for highlight
 const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.BufferAttribute(v,3));
 fg.setIndex([0,2,1,0,3,2, 0,1,5,0,5,4, 1,2,6,1,6,5, 2,3,7,2,7,6, 3,0,4,3,4,7, 4,5,8, 5,6,9,5,9,8, 6,7,9, 7,4,8,7,8,9]);fg.computeVertexNormals();
 const fill=new THREE.Mesh(fg,new THREE.MeshBasicMaterial({color:TQ,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}));
 const grp=new THREE.Group();grp.add(fill,edges);grp.position.set(x,dipY(z),z);scene.add(grp);
 houses.push({grp,fill,edges,x,z,tag,t:0,dip:tag==='main'&&Math.abs(z-DIP.z)<DIP.w*.7,tree:R()<.4});
 // a tree: two crossed line-triangles
 if(houses[houses.length-1].tree){const tx=x+(x>0?7:-7),tz=z+R()*d;const tg=new THREE.BufferGeometry();const th=2.5+R()*2;const ty=dipY(tz);tg.setAttribute('position',new THREE.Float32BufferAttribute([tx-1.2,ty+1,tz,tx,ty+th+1,tz,tx+1.2,ty+1,tz,tx-1.2,ty+1,tz, tx,ty+1,tz-1.2,tx,ty+th+1,tz,tx,ty+1,tz+1.2,tx,ty+1,tz-1.2, tx,ty,tz,tx,ty+1,tz],3));scene.add(new THREE.Line(tg,faintMat))}}
function cluster(cx,cz,n,tag){for(let i=0;i<n;i++){const side=i%2?1:-1;house(cx+side*(9.5+R()*3),cz+(i>>1)*8.5+R()*1.5,tag)}}
cluster(0,0,mobile?44:64,'main');cluster(-78,150,26,'A');cluster(72,190,26,'B');
/* street lamps (little T's) */
for(let z=-10;z<230;z+=24){const g=new THREE.BufferGeometry();const y=dipY(z);g.setAttribute('position',new THREE.Float32BufferAttribute([-6,y,z,-6,y+5,z,-6,y+5,z,-4.6,y+5,z],3));scene.add(new THREE.LineSegments(g,faintMat))}
/* water line (gutter) */
const WN=140;const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(WN*3),3));const water=new THREE.Line(wg,new THREE.LineBasicMaterial({color:TQ,transparent:true,opacity:0}));scene.add(water);
/* rain: streaks, not dots */
const RN=mobile?400:900;const rg=new THREE.BufferGeometry();const rp=new Float32Array(RN*6);for(let i=0;i<RN;i++){const x=(R()-.5)*70,y=R()*34,z=R()*90;rp[i*6]=x;rp[i*6+1]=y;rp[i*6+2]=z;rp[i*6+3]=x+.15;rp[i*6+4]=y+1.1+R()*.8;rp[i*6+5]=z}rg.setAttribute('position',new THREE.BufferAttribute(rp,3));const rain=new THREE.LineSegments(rg,new THREE.LineBasicMaterial({color:TQ,transparent:true,opacity:0,depthWrite:false}));scene.add(rain);
/* flood: a plane that fills the dip */
const FW=110,FL=DIP.w*2.2;const fgeo=new THREE.PlaneGeometry(FW,FL,44,26);fgeo.rotateX(-Math.PI/2);const flood=new THREE.Mesh(fgeo,new THREE.MeshBasicMaterial({color:TQ,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));flood.position.set(0,-DIP.d-1,DIP.z);scene.add(flood);
const floodEdge=new THREE.LineSegments(new THREE.EdgesGeometry(fgeo,1),new THREE.LineBasicMaterial({color:TQ,transparent:true,opacity:0}));flood.add(floodEdge);
const WET=-DIP.d+1.55,DRY=-DIP.d-1;let floodT=0;
/* camera path */
const path=new THREE.CatmullRomCurve3([-24,20,50,66,76,86,96,108,140,180,215].map((z,i)=>new THREE.Vector3([0,0,-1,-2.5,-2.5,-2.5,-1.5,0,2.5,1.5,0][i],1.7+Math.max(dipY(z),WET-1.2)+(i===10?1.3:0),z)));
const state={u:0,lift:0,beat:0};const look=new THREE.Vector3();const tmp=new THREE.Vector3();
let mx=0,my=0;addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2});
const OVER=new THREE.Vector3(0,330,70);
function updateCamera(){const p=path.getPointAt(Math.min(1,state.u));tmp.copy(path.getPointAt(Math.min(1,state.u+.02)));
 // lift: blend to overhead
 const L=state.lift;p.lerp(OVER,L);tmp.lerp(new THREE.Vector3(0,0,150),L);scene.fog.far=(mobile?110:150)+L*600;scene.fog.near=18+L*300;
 camera.position.copy(p);if(!mobile&&L<.5){camera.position.x-=mx*.6*(1-L*2);camera.position.y+=-my*.3*(1-L*2)}
 look.copy(tmp);if(!mobile&&L<.5){look.x-=mx*5*(1-L*2);look.y-=my*2.5*(1-L*2)}camera.lookAt(look);camera.up.set(0,1,0);}
/* beats → highlights */
const beats={1:h=>h.tag==='main'&&h.x>0,2:h=>h.tag==='main'&&h.dip,3:h=>h.tag==='main'&&h.x<0,4:h=>true};
function setBeat(i){state.beat=i;document.querySelectorAll('.rail span').forEach((s,k)=>s.classList.toggle('on',k===i))}
/* one progress value (0..1 across the drive), smoothed, drives everything */
const drive={p:0,target:0};
const driveEnd=()=>document.querySelector('.end').offsetTop-innerHeight;
ScrollTrigger.create({trigger:'main',start:'top top',end:driveEnd,onUpdate:st=>{drive.target=st.progress},onRefresh:st=>{drive.target=st.progress}});
function applyProgress(p){
 // 0..0.78 = the drive, 0.78..1 = the lift
 const d=Math.min(1,p/.78),l=Math.max(0,(p-.78)/.22);const e=l<.5?2*l*l:1-Math.pow(-2*l+2,2)/2;
 state.u=.82*d+(1-.82)*e;state.lift=e;
 // beats keyed to the same progress the camera uses
 const b=p<.13?0:p<.35?1:p<.57?2:p<.78?3:4;if(b!==state.beat)setBeat(b)}
const clock=new THREE.Clock();
/* damping: frame-rate independent, tuned so wheel steps blur into one motion. K=2.6 ≈ 0.4s to settle */
const K=2.6;
let fpsEl=null,fN=0,fT=0;if(location.search.includes('fps')){fpsEl=document.createElement('div');fpsEl.style.cssText='position:fixed;left:1rem;bottom:1rem;z-index:99;font:500 12px/1 monospace;background:#141816;color:#16C2B5;padding:6px 8px;border-radius:6px';document.body.appendChild(fpsEl)}
function frame(){const dt=Math.min(.05,clock.getDelta());const t=clock.elapsedTime;
 if(fpsEl){fN++;fT+=dt;if(fT>=.5){fpsEl.textContent=Math.round(fN/fT)+' fps · dpr '+renderer.getPixelRatio();fN=0;fT=0}}
 drive.p+=(drive.target-drive.p)*(reduce?1:1-Math.exp(-dt*K));applyProgress(drive.p);updateCamera();
 const cz=camera.position.z,L=state.lift;
 houses.forEach(h=>{const pred=beats[state.beat];let target=0;
  if(state.beat===4){target=.5}else if(pred&&pred(h)&&h.z>cz+4&&h.z<cz+70){target=.55}
  h.t+=(target-h.t)*.08;h.fill.material.opacity=h.t;h.edges.material.color.copy(INK).lerp(TQ,Math.min(1,h.t*1.6))});
 // water
 if(water.material.opacity>.01||state.beat===1){const wp=water.geometry.attributes.position.array;for(let i=0;i<WN;i++){const z=cz+2+i*.9;wp[i*3]=4.6+Math.sin(z*.35+t*3)*.35;wp[i*3+1]=.06+Math.sin(z*.8-t*4)*.04;wp[i*3+2]=z}water.geometry.attributes.position.needsUpdate=true}
 water.material.opacity+=((state.beat===1?1:0)-water.material.opacity)*.08;
 // weather: rain falls, the dip fills, the road goes under
 const wet=state.beat===2?1:0;floodT+=(wet-floodT)*.035;
 rain.material.opacity+=((wet?.75:0)-rain.material.opacity)*.06;
 if(rain.material.opacity>.02){const a=rain.geometry.attributes.position.array;for(let i=0;i<RN;i++){a[i*6+1]-=.9;a[i*6+4]-=.9;if(a[i*6+1]<-3){a[i*6+1]+=34;a[i*6+4]+=34}const nz=cz+4+((a[i*6+2]-cz-4+90)%90);a[i*6+2]=nz;a[i*6+5]=nz}rain.geometry.attributes.position.needsUpdate=true}
 flood.position.y=DRY+(WET-DRY)*floodT;flood.material.opacity=.42*floodT;floodEdge.material.opacity=.5*floodT;
 if(floodT>.01){const fp=flood.geometry.attributes.position.array;for(let i=0;i<fp.length;i+=3){const x=fp[i],z=fp[i+2];fp[i+1]=Math.sin(x*.25+t*2.2)*.08+Math.sin(z*.4-t*1.7)*.06+Math.sin((x+z)*.12+t)*.05}flood.geometry.attributes.position.needsUpdate=true}
 // overhead labels
 [[0,0,120],[-78,0,205],[72,0,245]].forEach((c,i)=>{const v=new THREE.Vector3(c[0],0,c[2]);v.project(camera);const el=document.getElementById('l'+i);el.style.left=((v.x+1)/2*innerWidth)+'px';el.style.top=((1-v.y)/2*innerHeight)+'px'});
 renderer.render(scene,camera);requestAnimationFrame(frame)}
frame();
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()});
/* ---------- smooth scroll ---------- */

/* ---------- scroll choreography ---------- */

document.querySelectorAll('.beat[data-i]').forEach(s=>{const i=+s.dataset.i;
  const lines=s.querySelectorAll('h2 .l i');
 gsap.to(s.querySelector('.box'),{opacity:0,ease:'none',scrollTrigger:{trigger:s,start:'bottom 80%',end:'bottom 45%',scrub:true}});
 gsap.timeline({scrollTrigger:{trigger:s,start:'top 60%',toggleActions:'play none none reverse'}})
  .to(s.querySelector('.k'),{opacity:1,duration:.5},0).to(lines,{y:0,duration:1,stagger:.09,ease:'power4.out'},0).to(s.querySelector('p'),{opacity:1,y:0,duration:.8,ease:'power3.out'},.5)
  .to(s.querySelector('.num'),{opacity:1,scale:1,duration:1.2,ease:'power3.out'},0)});

gsap.set('#b4 .num',{scale:.6});
gsap.to('.lbl',{opacity:1,stagger:.15,scrollTrigger:{trigger:'#b4',start:'top 40%',end:'bottom 70%',toggleActions:'play reverse play reverse'}});
gsap.to('.hint',{opacity:0,scrollTrigger:{trigger:'main',start:'top top',end:'+=300',scrub:true}});
/* ---------- drive on: click to move to the next stop, scroll still works ---------- */
const stops=()=>[0,...[...document.querySelectorAll('.beat[data-i]')].map(b=>b.offsetTop+innerHeight*.28),document.querySelector('.end').offsetTop];
const btn=document.getElementById('driveon');const btnL=btn.querySelector('span');
function nextStop(){const y=scrollY+2;return stops().find(t=>t>y)}
function labelFor(){const st=stops();const i=st.findIndex(t=>t>scrollY+2);btnL.textContent=i===-1||i===st.length-1?'Talk to me':i===st.length-2?'One more stop':'Drive on'}
btn.addEventListener('click',()=>{const t=nextStop();if(t===undefined){document.querySelector('.end .btn').focus();return}
 gsap.to(window,{scrollTo:{y:t,autoKill:true},duration:1.9,ease:'power2.inOut'})});
addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='Enter'&&document.activeElement===btn){e.preventDefault();btn.click()}});
addEventListener('scroll',labelFor,{passive:true});labelFor();
/* ---------- loader ---------- */
const n={v:0};const ldn=document.getElementById('ldn');
gsap.timeline({onComplete:()=>document.getElementById('ld').remove()})
 .to('#ldb',{scaleX:1,duration:1.6,ease:'power2.inOut'},0)
 .to(n,{v:37,duration:1.6,ease:'power2.inOut',onUpdate:()=>ldn.textContent=Math.round(n.v)},0)
 .to('#ld .s1',{opacity:1,y:0,duration:.6,ease:'power3.out'},'-=.5').to('#ld .s2',{opacity:1,y:0,duration:.6,ease:'power3.out'},'-=.3')
 .to('#ld',{yPercent:-100,duration:1,ease:'power4.inOut'},'+=1.3')
 .to('#b0 h1 .l i',{y:0,duration:1.1,stagger:.12,ease:'power4.out'},'-=.55')
 .to(['nav','.rail','#b0 .who','.hint','#driveon'],{opacity:1,duration:.8,stagger:.05},'-=.5');


}
