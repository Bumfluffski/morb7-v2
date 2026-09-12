import * as THREE from 'three';
export const COLORS = { bg: '#EEF0EF', ink: '#141816', tq: '#16C2B5' };
export function mkRenderer(canvas) { const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); r.setPixelRatio(Math.min(2, devicePixelRatio)); r.setSize(innerWidth, innerHeight); return r; }
export function mkMaterials() { const INK = new THREE.Color(COLORS.ink), TQ = new THREE.Color(COLORS.tq); return { INK, TQ, line: new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: .85 }), faint: new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: .14 }), centre: new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: .5 }) }; }
export function rng(seed) { return () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }; }
export function grid(scene, mat, { x0=-160, x1=160, z0=-60, z1=420, step=8, y=() => 0 } = {}) { const pts = []; for (let z = z0; z <= z1; z += step) pts.push(x0, y(z), z, x1, y(z), z); for (let x = x0; x <= x1; x += step) for (let z = z0; z < z1; z += 4) pts.push(x, y(z), z, x, y(z + 4), z + 4); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); scene.add(new THREE.LineSegments(g, mat)); }
export function centreLine(scene, mat, { z0=-60, z1=270, y=() => 0 } = {}) { const pts = []; for (let z = z0; z < z1; z += 6) pts.push(0, y(z) + .02, z, 0, y(z + 3) + .02, z + 3); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); scene.add(new THREE.LineSegments(g, mat)); }
/** Wireframe house with a hidden turquoise fill that can be faded in. */
export function house(scene, M, R, { x, z, y=0, rot=0, w, d, h, roof, tag='main' } = {}) {
  w = w ?? 5 + R() * 3; d = d ?? 6 + R() * 4; h = h ?? 3 + R() * 2.2; roof = roof ?? 1.6 + R() * 1.4;
  const v = new Float32Array([-w/2,0,0, w/2,0,0, w/2,0,d, -w/2,0,d, -w/2,h,0, w/2,h,0, w/2,h,d, -w/2,h,d, 0,h+roof,0, 0,h+roof,d]);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(v, 3)); g.setIndex([0,1,1,2,2,3,3,0, 4,5,5,6,6,7,7,4, 0,4,1,5,2,6,3,7, 4,8,5,8,6,9,7,9,8,9]);
  const edges = new THREE.LineSegments(g, M.line.clone());
  const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(v, 3)); fg.setIndex([0,2,1,0,3,2, 0,1,5,0,5,4, 1,2,6,1,6,5, 2,3,7,2,7,6, 3,0,4,3,4,7, 4,5,8, 5,6,9,5,9,8, 6,7,9, 7,4,8,7,8,9]);
  const fill = new THREE.Mesh(fg, new THREE.MeshBasicMaterial({ color: M.TQ, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
  const grp = new THREE.Group(); grp.add(fill, edges); grp.position.set(x, y, z); grp.rotation.y = rot; scene.add(grp);
  return { grp, fill, edges, x, z, w, d, tag, t: 0 };
}
export function tint(h, M, target, k=.08) { h.t += (target - h.t) * k; h.fill.material.opacity = h.t; h.edges.material.color.copy(M.INK).lerp(M.TQ, Math.min(1, h.t * 1.8)); }
export const carGeometry = (() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1,.3,-2, 1,.3,-2, 1,.3,2, -1,.3,2, -1,1.1,-1.6, 1,1.1,-1.6, 1,1.1,1.6, -1,1.1,1.6, -.7,1.6,-.6, .7,1.6,-.6, .7,1.6,.9, -.7,1.6,.9]), 3)); g.setIndex([0,1,1,2,2,3,3,0, 4,5,5,6,6,7,7,4, 0,4,1,5,2,6,3,7, 8,9,9,10,10,11,11,8, 4,8,5,9,6,10,7,11]); return g; })();
export function onResize(renderer, camera) { addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }); }
