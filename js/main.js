import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const color = 0xffffff;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-10, 2, 4);
scene.add(light);

// const geometry = new THREE.BoxGeometry();
// const material1 = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
// const material2 = new THREE.MeshPhongMaterial({ color: 0x0000ff });
// const cube1 = new THREE.Mesh(geometry, material1);
// const cube2 = new THREE.Mesh(geometry, material2);
// scene.add(cube1);
// scene.add(cube2);
// cube2.position.x += 5;


// const loader = new GLTFLoader();
// loader.load(
//   "pony_cartoon/scene.gltf",
//   function (gltf) {
//     scene.add(gltf.scene);
//   },
//   undefined,
//   function (error) {
//     console.error(error);
//   }
// );

camera.position.z = 50;

// function animate() {
//   requestAnimationFrame(animate);
//   cube1.rotation.x += 0.01;
//   cube1.rotation.y += 0.01;
//   cube2.rotation.x -= 0.01;
//   cube2.rotation.y -= 0.01;
//   renderer.render(scene, camera);
// }
// animate();


var sunGeo = new THREE.SphereGeometry(1,15,15);
var sunMat = new THREE.MeshPhongMaterial({ color: 0xff0000 }); 
var sun = new THREE.Mesh(sunGeo, sunMat); 
sun.position.set(0,0,0);
scene.add(sun); // add Sun

var mercuryGeo = new THREE.SphereGeometry(1,15,15);
var mercuryMat = new THREE.MeshPhongMaterial({ color: 0x0000ff }); 
var mercury = new THREE.Mesh(mercuryGeo, mercuryMat); 
scene.add(mercury); // add Mercury

var t = 0;
function render() { 
    requestAnimationFrame(render); 
    t += 0.01;          
    sun.rotation.y += 0.005;
    mercury.rotation.y += 0.03;

    mercury.position.x = 10*Math.cos(t) + 0;
    mercury.position.z = 10*Math.sin(t) + 0; // These to strings make it work

    renderer.render(scene, camera); 
} 
render();
