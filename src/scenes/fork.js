// fork scene. Mounted by src/pages/index.astro. Shared helpers live in src/lib/world.js.

import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
export function mount(){
const mobile=innerWidth<820;
['/buying','/selling'].forEach(h=>{const l=document.createElement('link');l.rel='prefetch';l.href=h;document.head.appendChild(l)});
const canvas=document.getElementById('gl');const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(2,devicePixelRatio));renderer.setSize(innerWidth,innerHeight);
const scene=new THREE.Scene();scene.fog=new THREE.Fog(new THREE.Color('#EEF0EF'),20,150);
const camera=new THREE.PerspectiveCamera(mobile?62:50,innerWidth/innerHeight,.1,600);
const INK=new THREE.Color('#141816'),TQ=new THREE.Color('#16C2B5');
const lineMat=new THREE.LineBasicMaterial({color:INK,transparent:true,opacity:.85}),faintMat=new THREE.LineBasicMaterial({color:INK,transparent:true,opacity:.14});
{const g=new THREE.BufferGeometry();const pts=[];for(let z=-60;z<=320;z+=8){pts.push(-200,0,z,200,0,z)}for(let x=-200;x<=200;x+=8){pts.push(x,0,-60,x,0,320)}g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));scene.add(new THREE.LineSegments(g,faintMat))}
/* the road: straight, then a Y. two branch centrelines we can light */
function dashed(points,mat){const g=new THREE.BufferGeometry();const pts=[];for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1];const n=Math.ceil(a.distanceTo(b)/6);for(let k=0;k<n;k++){const p=a.clone().lerp(b,k/n),q=a.clone().lerp(b,Math.min(1,(k+.5)/n));pts.push(p.x,.02,p.z,q.x,.02,q.z)}}g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));return new THREE.LineSegments(g,mat)}
const V=(x,z)=>new THREE.Vector3(x,0,z);
const trunk=dashed([V(0,-40),V(0,60)],new THREE.LineBasicMaterial({color:INK,transparent:true,opacity:.5}));scene.add(trunk);
const leftMat=new THREE.LineBasicMaterial({color:INK,transparent:true,opacity:.5}),rightMat=leftMat.clone();
const left=dashed([V(0,60),V(18,110),V(60,200),V(110,300)],leftMat),right=dashed([V(0,60),V(-18,110),V(-60,200),V(-110,300)],rightMat);scene.add(left,right);
/* kerbs */
function kerb(points,off){const g=new THREE.BufferGeometry();const pts=[];for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1];const d=b.clone().sub(a).normalize();const n=new THREE.Vector3(-d.z,0,d.x).multiplyScalar(off);pts.push(a.x+n.x,0,a.z+n.z,b.x+n.x,0,b.z+n.z)}g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));return new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:INK,transparent:true,opacity:.35}))}
scene.add(kerb([V(0,-40),V(0,60),V(18,110),V(60,200),V(110,300)],5.5),kerb([V(0,-40),V(0,60),V(-18,110),V(-60,200),V(-110,300)],-5.5),kerb([V(0,60),V(18,110),V(60,200),V(110,300)],-5.5),kerb([V(0,60),V(-18,110),V(-60,200),V(-110,300)],5.5));
/* houses along the trunk and both branches */
let seed=1989;const R=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
const houses=[];function house(x,z,rot,side){const w=5+R()*3,d=6+R()*4,h=3+R()*2.2,roof=1.6+R()*1.4;
 const v=new Float32Array([-w/2,0,0,w/2,0,0,w/2,0,d,-w/2,0,d,-w/2,h,0,w/2,h,0,w/2,h,d,-w/2,h,d,0,h+roof,0,0,h+roof,d]);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(v,3));g.setIndex([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7,4,8,5,8,6,9,7,9,8,9]);
 const edges=new THREE.LineSegments(g,lineMat.clone());
 const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.BufferAttribute(v,3));fg.setIndex([0,2,1,0,3,2,0,1,5,0,5,4,1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7,4,5,8,5,6,9,5,9,8,6,7,9,7,4,8,7,8,9]);
 const fill=new THREE.Mesh(fg,new THREE.MeshBasicMaterial({color:TQ,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}));
 const grp=new THREE.Group();grp.add(fill,edges);grp.position.set(x,0,z);grp.rotation.y=rot;scene.add(grp);houses.push({grp,fill,edges,side,t:0})}
for(let i=0;i<(mobile?14:22);i++){const s=i%2?1:-1;house(s*(10+R()*3),-30+(i>>1)*8.5,0,'trunk')}
function branch(pts,side){for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];const d=b.clone().sub(a);const len=d.length();d.normalize();const n=new THREE.Vector3(-d.z,0,d.x);const rot=Math.atan2(d.x,d.z);for(let k=8;k<len;k+=9){const p=a.clone().add(d.clone().multiplyScalar(k));[1,-1].forEach(sg=>{const q=p.clone().add(n.clone().multiplyScalar(sg*(10+R()*3)));if(q.z<150&&Math.abs(q.x)<11)return;if(q.z<150&&Math.sign(q.x)!==Math.sign(b.x))return;house(q.x,q.z,rot,side)})}}}
branch([V(0,60),V(18,110),V(60,200),V(110,300)],'L');branch([V(0,60),V(-18,110),V(-60,200),V(-110,300)],'R');
/* camera */
const cam={x:0,y:1.7,z:-30,lx:0,lz:60};let mx=0,my=0,lean=0,chosen=null;const sm={x:0,y:0};addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2});
const clock=new THREE.Clock();
function frame(){const t=clock.getElapsedTime();
 // idle creep forward toward the junction, lean toward hovered road
 if(!chosen){cam.z+=(12-cam.z)*.004;lean+=(mx-lean)*.06}
 // look out of the window: the camera turns smoothly with the cursor, no snap at the centreline
 sm.x+=((mobile?0:mx)-sm.x)*.05;sm.y+=(my-sm.y)*.05;
 camera.position.set(cam.x-sm.x*.8,cam.y-sm.y*.2,cam.z);camera.lookAt(cam.lx-sm.x*22,1.6-sm.y*2.5,cam.lz);
 houses.forEach(h=>{let target=0;if(h.side==='L'&&lean<-.3)target=.4;if(h.side==='R'&&lean>.3)target=.4;if(chosen&&h.side===chosen)target=.55;h.t+=(target-h.t)*.08;h.fill.material.opacity=h.t;h.edges.material.color.copy(INK).lerp(TQ,Math.min(1,h.t*1.8))});
 leftMat.color.copy(INK).lerp(TQ,lean<-.3||chosen==='L'?1:0);rightMat.color.copy(INK).lerp(TQ,lean>.3||chosen==='R'?1:0);
 renderer.render(scene,camera);requestAnimationFrame(frame)}frame();
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()});
/* hover leans, click drives */
const L=document.getElementById('roadL'),Rr=document.getElementById('roadR');

function choose(side,href){return e=>{e.preventDefault();if(chosen)return;chosen=side;document.cookie=`morb7_journey=${side==='L'?'buying':'selling'};path=/;max-age=${60*60*24*90}`;
 const dir=side==='L'?1:-1;
 gsap.timeline({onComplete:()=>location.href=href})
  .to(cam,{z:60,duration:1.6,ease:'power2.in'},0).to(cam,{lx:dir*18,lz:110,duration:1.6,ease:'power2.inOut'},0)
  .to(cam,{x:dir*18,z:110,lx:dir*60,lz:200,duration:1.4,ease:'power2.in'},1.4)
  .to(['.q','.road','.mid','nav'],{opacity:0,duration:.6},0)
  .to('#wipe',{scaleY:1,duration:.8,ease:'power4.inOut'},2.1)}}
L.addEventListener('click',choose('L',L.getAttribute('href')));Rr.addEventListener('click',choose('R',Rr.getAttribute('href')));
/* welcome back */
const prev=(document.cookie.match(/morb7_journey=(\w+)/)||[])[1];
/* loader */
const n={v:0};const tl=gsap.timeline({onComplete:()=>document.getElementById('ld').remove()})
 .to('#ldb',{scaleX:1,duration:1.4,ease:'power2.inOut'},0).to(n,{v:37,duration:1.4,ease:'power2.inOut',onUpdate:()=>document.getElementById('ldn').textContent=Math.round(n.v)},0)
 .to('#ld',{yPercent:-100,duration:1,ease:'power4.inOut'},'+=.25')
 .to('.q',{opacity:1,duration:1,ease:'power3.out'},'-=.4').to(['.road','.mid','nav'],{opacity:1,duration:.8,stagger:.1},'-=.6');
if(prev){tl.to('#back',{opacity:1,y:0,transform:'translate(-50%,0)',duration:.8,ease:'power3.out'},'-=.2');document.getElementById('backTxt').textContent=`Welcome back. Last time you were ${prev}.`;
 document.getElementById('backGo').onclick=()=>(prev==='buying'?L:Rr).click();document.getElementById('backSwitch').onclick=e=>{e.preventDefault();(prev==='buying'?Rr:L).click()}}


}
