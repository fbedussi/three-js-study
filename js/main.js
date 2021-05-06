import * as THREE from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";

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
const intensity = 10;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-10, 2, 4);
scene.add(light);

var lightAmb = new THREE.AmbientLight(0x777777);
scene.add(lightAmb);

// const geometry = new THREE.BoxGeometry();
// const material1 = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
// const material2 = new THREE.MeshPhongMaterial({ color: 0x0000ff });
// const cube1 = new THREE.Mesh(geometry, material1);
// const cube2 = new THREE.Mesh(geometry, material2);
// scene.add(cube1);
// scene.add(cube2);
// cube2.position.x += 5;

let car
const loader = new GLTFLoader();
loader.load(
  "pony_cartoon/scene.gltf",
  function (gltf) {
    car = gltf.scene
    scene.add(gltf.scene);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

camera.position.z = 20;

// function animate() {
//   requestAnimationFrame(animate);
//   cube1.rotation.x += 0.01;
//   cube1.rotation.y += 0.01;
//   cube2.rotation.x -= 0.01;
//   cube2.rotation.y -= 0.01;
//   renderer.render(scene, camera);
// }
// animate();


// var sunGeo = new THREE.SphereGeometry(1,15,15);
// var sunMat = new THREE.MeshPhongMaterial({ color: 0xff0000 }); 
// var sun = new THREE.Mesh(sunGeo, sunMat); 
// sun.position.set(0,0,0);
// scene.add(sun); // add Sun

var mercuryGeo = new THREE.SphereGeometry(1, 15, 15);
var mercuryMat = new THREE.MeshPhongMaterial({color: 0x0000ff});
var mercury = new THREE.Mesh(mercuryGeo, mercuryMat);
scene.add(mercury); // add Mercury


const textureLoader = new THREE.TextureLoader();
textureLoader.load('https://images.pexels.com/photos/1205301/pexels-photo-1205301.jpeg', function (texture) {
  scene.background = texture;
});


// let mercury
// textureLoader.load('http://media.gettyimages.com/vectors/sunglasses-in-transparent-background-vector-id657850302?s=170x170', function (texture) {
//   mercury = texture;
//   scene.add(mercury)
// });

// var texture = new THREE.TextureLoader().load( "initiative2.jpg" );
// // Create a geometry
// 	// 	Create a box (cube) of 10 width, length, and height
// 	const geometry = new THREE.BoxGeometry( 10, 10, 10 );
// 	// Create a MeshBasicMaterial with a loaded texture
//   const material = new THREE.MeshBasicMaterial( { map: texture} );
//   // Combine the geometry and material into a mesh
// 	const mercury = new THREE.Mesh( geometry, material );
// 	// Add the mesh to the scene
// 	scene.add( mercury );

class PickHelper {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.pickedObject = null;
    this.pickedObjectSavedColor = 0;
  }
  pick(normalizedPosition, scene, camera, time) {
    // restore the color if there is a picked object
    if (this.pickedObject) {
      this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
      this.pickedObject = undefined;
    }

    // cast a ray through the frustum
    this.raycaster.setFromCamera(normalizedPosition, camera);
    // get the list of objects the ray intersected
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length) {
      // pick the first object. It's the closest one
      this.pickedObject = intersectedObjects[0].object;
      // save its color
      this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
      // set its emissive color to flashing red/yellow
      this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
      window.location = 'https://www.google.it'; 
    }
  }
}

const pickPosition = {x: 0, y: 0};
const pickHelper = new PickHelper();
clearPickPosition();
 
const canvas = renderer.domElement
function getCanvasRelativePosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * canvas.width  / rect.width,
    y: (event.clientY - rect.top ) * canvas.height / rect.height,
  };
}

function setPickPosition(event) {
  const pos = getCanvasRelativePosition(event);
  pickPosition.x = (pos.x / canvas.width ) *  2 - 1;
  pickPosition.y = (pos.y / canvas.height) * -2 + 1;  // note we flip Y
}

function clearPickPosition() {
  // unlike the mouse which always has a position
  // if the user stops touching the screen we want
  // to stop picking. For now we just pick a value
  // unlikely to pick something
  pickPosition.x = -100000;
  pickPosition.y = -100000;
}
window.addEventListener('mousedown', setPickPosition);
window.addEventListener('mouseup', clearPickPosition);
// window.addEventListener('mouseleave', clearPickPosition);

// window.addEventListener('touchstart', (event) => {
//   // prevent the window from scrolling
//   event.preventDefault();
//   setPickPosition(event.touches[0]);
// }, {passive: false});

// window.addEventListener('touchmove', (event) => {
//   setPickPosition(event.touches[0]);
// });

// window.addEventListener('touchend', clearPickPosition);

let isClicked = false
let prevClientX = 0
let oldAngle = 0
let angle = 0
window.addEventListener('mousedown', function(event) {
  isClicked = true
  prevClientX = event.clientX
});
window.addEventListener('mouseup', function() {
  isClicked = false
  oldAngle = angle
});

function rotateObjects(event) {
  if (isClicked) {
    angle = oldAngle + (( (event.clientX-prevClientX) / window.innerWidth ) * 2 - 1) * -1;
    mercury.position.x = 10 * Math.cos(angle) + 0;
    mercury.position.z = 10 * Math.sin(angle) + 0; // These to strings make it work
    requestAnimationFrame(render);

  }
}
window.addEventListener('mousemove', rotateObjects);

var t = 0;
function render() {
  // requestAnimationFrame(render);

  pickHelper.pick(pickPosition, scene, camera, t);


  t += 0.01;
  // sun.rotation.y += 0.005;
  if (car) {
    car.rotation.y += 0.005;
  }
  // mercury.rotation.y += 0.03;



  renderer.render(scene, camera);
}
render();
