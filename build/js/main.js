import * as THREE from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 20;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
const canvas = renderer.domElement
document.body.appendChild(canvas);

// LIGHTS
const color = 0xffffff;
const intensity = 10;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-10, 2, 4);
scene.add(light);

var lightAmb = new THREE.AmbientLight(0x777777);
scene.add(lightAmb);

// BACKGROUND
const textureLoader = new THREE.TextureLoader();
textureLoader.load('https://images.pexels.com/photos/1205301/pexels-photo-1205301.jpeg', function (texture) {
  scene.background = texture;
});

// CENTRAL OBJECT
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

// PAGE LINK - IMAGE
const texture = new THREE.TextureLoader().load('initiative2.jpg');
const geometry = new THREE.PlaneGeometry(10, 10);
const material = new THREE.MeshBasicMaterial({map: texture});
const pageLink = new THREE.Group();
const pageImage = new THREE.Mesh(geometry, material);
pageLink.add(pageImage)
scene.add(pageLink);

// PAGE LINK - TEXT
const fontLoader = new THREE.FontLoader();
fontLoader.load('fonts/helvetiker_regular.typeface.json', function (font) {
  const color = 0x006699;
  const matLite = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide
  });

  const message = "Three.js\nSimple text.";
  const shapes = font.generateShapes(message, 1);
  const geometry = new THREE.ShapeGeometry(shapes);
  const text = new THREE.Mesh(geometry, matLite);
  pageLink.add(text);
});


class PickHelper {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.pickedObject = null;
    this.pickedObjectSavedColor = 0;
  }
  pick(normalizedPosition, scene, camera) {
    // cast a ray through the frustum
    this.raycaster.setFromCamera(normalizedPosition, camera);
    // get the list of objects the ray intersected
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length) {
      // pick the first object. It's the closest one
      this.pickedObject = intersectedObjects[0].object;
      // do something
      // window.location = 'https://www.google.it'; 
    }
  }
}

const pickPosition = {x: 0, y: 0};
const pickHelper = new PickHelper();
clearPickPosition();

function getCanvasRelativePosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * canvas.width / rect.width,
    y: (event.clientY - rect.top) * canvas.height / rect.height,
  };
}

function setPickPosition(event) {
  const pos = getCanvasRelativePosition(event);
  pickPosition.x = (pos.x / canvas.width) * 2 - 1;
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

let isClicked = false
let prevClientX = 0
let oldAngle = 0
let angle = 0
window.addEventListener('mousedown', function (event) {
  isClicked = true
  prevClientX = event.clientX
});
window.addEventListener('mouseup', function () {
  isClicked = false
  oldAngle = angle
});

function rotateObjects(event) {
  if (isClicked) {
    angle = oldAngle + (((event.clientX - prevClientX) / window.innerWidth) * 2 - 1) * -1;
    pageLink.position.x = 10 * Math.cos(angle) + 0;
    pageLink.position.z = 10 * Math.sin(angle) + 0;
    
    if (car) {
      car.rotation.y -= 0.0005;
    }
  }
}
window.addEventListener('mousemove', rotateObjects);


function render() {
  requestAnimationFrame(render);
  pickHelper.pick(pickPosition, scene, camera);
  
  renderer.render(scene, camera);
}
render();
