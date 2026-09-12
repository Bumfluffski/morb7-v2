// selling scene. Mounted by src/pages/selling.astro. Shared helpers live in src/lib/world.js.

import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
export function mount(){
gsap.registerPlugin(ScrollTrigger);
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,mobile=innerWidth<820;
const canvas=document.getElementById('gl');const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(2,devicePixelRatio));renderer.setSize(innerWidth,innerHeight);
const scene=new THREE.Scene();scene.fog=new THREE.Fog(new THREE.Color('#EEF0EF'),20,140);
const camera=new THREE.PerspectiveCamera(mobile?60:46,innerWidth/innerHeight,.1,600);
const INK=new THREE.Color('#141816'),TQ=new THREE.Color('#16C2B5');
const lineMat=new THREE.LineBasicMaterial({color:INK,transparent:true,opacity:.85}),faintMat=new THREE.LineBasicMaterial({color:INK,transparent:true,opacity:.14});
{const g=new THREE.BufferGeometry();const pts=[];for(let z=-80;z<=260;z+=8){pts.push(-160,0,z,160,0,z)}for(let x=-160;x<=160;x+=8){pts.push(x,0,-80,x,0,260)}g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));scene.add(new THREE.LineSegments(g,faintMat))}
{const g=new THREE.BufferGeometry();const pts=[];for(let z=-80;z<260;z+=6){pts.push(0,.02,z,0,.02,z+3)}g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));scene.add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:INK,transparent:true,opacity:.5})))}
let seed=2026;const R=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
const houses=[];
function house(x,z,yours){const w=yours?8:5+R()*3,d=yours?9:6+R()*4,h=yours?3.6:3+R()*2.2,roof=yours?2:1.6+R()*1.4;
 const v=new Float32Array([-w/2,0,0,w/2,0,0,w/2,0,d,-w/2,0,d,-w/2,h,0,w/2,h,0,w/2,h,d,-w/2,h,d,0,h+roof,0,0,h+roof,d]);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(v,3));g.setIndex([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7,4,8,5,8,6,9,7,9,8,9]);
 const edges=new THREE.LineSegments(g,lineMat.clone());
 const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.BufferAttribute(v,3));fg.setIndex([0,2,1,0,3,2,0,1,5,0,5,4,1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7,4,5,8,5,6,9,5,9,8,6,7,9,7,4,8,7,8,9]);
 const fill=new THREE.Mesh(fg,new THREE.MeshBasicMaterial({color:TQ,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}));
 const grp=new THREE.Group();grp.add(fill,edges);grp.position.set(x,0,z);scene.add(grp);const H={grp,fill,edges,x,z,yours,t:0,sold:false,soldAt:R()};houses.push(H);return H}
for(let i=0;i<(mobile?30:48);i++){const side=i%2?1:-1;house(side*(10+R()*3),-70+(i>>1)*8.5+R()*1.5,false)}
const YOURS=house(11,22,true);YOURS.fill.material.opacity=.5;YOURS.edges.material.color.copy(TQ);
/* for-sale board outside your house */
{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([6.2,0,22,6.2,2.6,22,6.2,2.6,22,6.2,2.6,24,6.2,2.6,24,6.2,1.4,24,6.2,1.4,24,6.2,1.4,22],3));scene.add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:TQ})))}
/* cars: wireframe boxes with a pair of headlights */
const cars=[];const carGeo=(()=>{const g=new THREE.BufferGeometry();const v=new Float32Array([-1,.3,-2,1,.3,-2,1,.3,2,-1,.3,2,-1,1.1,-1.6,1,1.1,-1.6,1,1.1,1.6,-1,1.1,1.6,-.7,1.6,-.6,.7,1.6,-.6,.7,1.6,.9,-.7,1.6,.9]);g.setAttribute('position',new THREE.BufferAttribute(v,3));g.setIndex([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7,8,9,9,10,10,11,11,8,4,8,5,9,6,10,7,11]);return g})();
function spawnCar(){const c=new THREE.LineSegments(carGeo,new THREE.LineBasicMaterial({color:INK,transparent:true,opacity:.9}));c.position.set(2.6,0,-90);scene.add(c);
 const lamp=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.35),new THREE.MeshBasicMaterial({color:TQ,transparent:true,opacity:.9}));lamp.position.set(0,.6,2.01);c.add(lamp);
 cars.push({m:c,z:-90,v:.55+R()*.15,state:'drive',pause:0,decided:false});}
spawnCar();cars[0].z=-30;
/* camera: parked at the opposite kerb, looking at your house */
camera.position.set(-6,1.8,10);const look=new THREE.Vector3(9,2,22);let mx=0,my=0;addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2});
/* price → interest */
let price=0,sat=1,passed=0,stopped=0,offers=0,satT=0;const say=document.getElementById('say');
const lines=[[0,'Priced where a buyer will actually pay, the people who were waiting come in the first three weeks. One of them makes an offer.'],[25,'A little high. Half of them slow down, compare you with the house down the road, and keep going.'],[55,'High. They look at the board, they look at the price, they do not stop. Your house is still on the street. Nobody is looking at it.'],[85,'This is the number an agent gave you to win the mandate. Six weeks from now you drop it, and everyone who watched knows you will drop it again.']];
document.getElementById('price').addEventListener('input',e=>{price=+e.target.value;const l=lines.filter(x=>x[0]<=price).pop();say.textContent=l[1];YOURS.fill.material.opacity=.5-price/100*.42;YOURS.edges.material.color.copy(TQ).lerp(INK,price/100)});
const interest=()=>Math.max(0,1-Math.pow(price/100,.8)*1.15);
const state={beat:0};const setBeat=b=>{state.beat=b};
let last=0;const clock=new THREE.Clock();
function frame(){const t=clock.getElapsedTime();const dt=Math.min(.05,t-last);last=t;
 // parked camera with a look-around
 camera.position.x=-6-mx*.3;camera.position.z=10+mx*.3;camera.position.y=1.8-my*.25;camera.lookAt(look.x-mx*4.5,look.y-my*3,look.z+mx*5.5);
 // saturdays tick
 satT+=dt;if(satT>3.2){satT=0;if(sat<16)sat++;else{sat=1;passed=stopped=offers=0}document.getElementById('sat').textContent=sat}
 if(cars.length<4&&R()<dt*.7)spawnCar();
 cars.forEach(c=>{const step=c.v*60*dt;if(c.state==='drive'){c.z+=step;const near=Math.abs(c.z-19)<2.5;
   if(near&&!c.decided){c.decided=true;const r=R(),i=interest();if(r<i*.85){c.state='stop';c.pause=2.4+R()*2;stopped++;if(R()<i*.7)offers++}else passed++;
    document.getElementById('passed').textContent=passed;document.getElementById('stopped').textContent=stopped;document.getElementById('offers').textContent=offers}}
  else if(c.state==='stop'){c.pause-=dt;c.z+=step*.05;if(c.pause<0)c.state='drive'}
  c.m.position.z=c.z;if(c.z>150){scene.remove(c.m);c.dead=true}});
 for(let i=cars.length-1;i>=0;i--)if(cars[i].dead)cars.splice(i,1);
 // beats: the street sells around you
 houses.forEach(h=>{if(h.yours)return;let target=0;
  if(state.beat===3&&h.soldAt<.55&&h.z>-20&&h.z<90)target=.45;
  if(state.beat===1&&h.z>26&&h.z<52&&h.x<0)target=.35;
  h.t+=(target-h.t)*.06;h.fill.material.opacity=h.t;h.edges.material.color.copy(INK).lerp(TQ,Math.min(1,h.t*2))});
 if(state.beat===3){YOURS.fill.material.opacity+=(0-YOURS.fill.material.opacity)*.05}
 renderer.render(scene,camera);requestAnimationFrame(frame)}frame();
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()});
/* beats from one progress value */
ScrollTrigger.create({trigger:'main',start:'top top',end:()=>document.querySelector('.end').offsetTop-innerHeight,onUpdate:st=>{const p=st.progress;setBeat(p<.22?0:p<.42?1:p<.62?2:p<.82?3:4)}});
document.querySelectorAll('.beat[data-i]').forEach(s=>{gsap.to(s.querySelector('.box'),{opacity:0,ease:'none',scrollTrigger:{trigger:s,start:'bottom 80%',end:'bottom 45%',scrub:true}});
 gsap.timeline({scrollTrigger:{trigger:s,start:'top 60%',toggleActions:'play none none reverse'}}).to(s.querySelector('.k'),{opacity:1,duration:.5},0).to(s.querySelectorAll('h2 .l i'),{y:0,duration:1,stagger:.09,ease:'power4.out'},0).to(s.querySelector('p'),{opacity:1,y:0,duration:.8,ease:'power3.out'},.5)});
gsap.to('#b0 .box',{opacity:0,ease:'none',scrollTrigger:{trigger:'#b0',start:'bottom 80%',end:'bottom 45%',scrub:true}});
gsap.to('.hud',{opacity:0,y:20,ease:'none',scrollTrigger:{trigger:'.end',start:'top 90%',end:'top 55%',scrub:true}});
gsap.to('.hint',{opacity:0,scrollTrigger:{trigger:'main',start:'top top',end:'+=240',scrub:true}});
/* loader */
const n={v:0};(function(){const fromFork=sessionStorage.getItem('morb7_from_fork')==='1';sessionStorage.removeItem('morb7_from_fork');
 const ld=document.getElementById('ld');
 if(fromFork){ld.style.background='#141816';ld.querySelector('.n').style.opacity=0;ld.querySelector('.s').style.opacity=0;ld.querySelector('.bar').style.opacity=0;
  return gsap.timeline({onComplete:()=>ld.remove()}).to('#ld',{yPercent:-100,duration:.9,ease:'power4.inOut',delay:.15})}
 return gsap.timeline({onComplete:()=>document.getElementById('ld').remove()})
 .to('#ldb',{scaleX:1,duration:1.4,ease:'power2.inOut'},0).to(n,{v:16,duration:1.4,ease:'power2.inOut',onUpdate:()=>document.getElementById('ldn').textContent=Math.round(n.v)},0)
 .to('#ld',{yPercent:-100,duration:1,ease:'power4.inOut'},'+=.25')})()
 .to('#b0 h1 .l i',{y:0,duration:1.1,stagger:.12,ease:'power4.out'},'-=.55')
 .to(['nav','.hud','.ctl','.hint'],{opacity:1,duration:.8,stagger:.08},'-=.5');


}
