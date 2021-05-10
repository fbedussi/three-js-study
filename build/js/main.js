import * as THREE from "../_snowpack/pkg/three.js";
import {GLTFLoader} from "../_snowpack/pkg/three/examples/jsm/loaders/GLTFLoader.js";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
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
const geometry = new THREE.PlaneGeometry(10, 10, 10, 10);
const uniforms = {
  uTime: {value: 0.0},
  uTexture: {value: new THREE.TextureLoader().load('https://picsum.photos/seed/picsum/200/300')},
}
const material = new THREE.ShaderMaterial({
  vertexShader: `
    precision mediump float;

    varying vec2 vUv;
    uniform float uTime;
    
    //
    // Description : Array and textureless GLSL 2D/3D/4D simplex
    //               noise functions.
    //      Author : Ian McEwan, Ashima Arts.
    //  Maintainer : ijm
    //     Lastmod : 20110822 (ijm)
    //     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
    //               Distributed under the MIT License. See LICENSE file.
    //               https://github.com/ashima/webgl-noise
    //
    
    vec3 mod289(vec3 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    
    vec4 mod289(vec4 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    
    vec4 permute(vec4 x) {
         return mod289(((x*34.0)+1.0)*x);
    }
    
    vec4 taylorInvSqrt(vec4 r)
    {
      return 1.79284291400159 - 0.85373472095314 * r;
    }
    
    float snoise(vec3 v) {
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      
      // First corner
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 =   v - i + dot(i, C.xxx) ;
      
      // Other corners
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
    
      //   x0 = x0 - 0.0 + 0.0 * C.xxx;
      //   x1 = x0 - i1  + 1.0 * C.xxx;
      //   x2 = x0 - i2  + 2.0 * C.xxx;
      //   x3 = x0 - 1.0 + 3.0 * C.xxx;
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
      vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
      
      // Permutations
      i = mod289(i);
      vec4 p = permute( permute( permute(
                 i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
               + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
               
      // Gradients: 7x7 points over a square, mapped onto an octahedron.
      // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
      float n_ = 0.142857142857; // 1.0/7.0
      vec3  ns = n_ * D.wyz - D.xzx;
    
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)
    
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
    
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
    
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
    
      //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
      //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
    
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      
      // Normalise gradients
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      
      // Mix final noise value
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                    dot(p2,x2), dot(p3,x3) ) );
    }
    
    void main() {
      vUv = uv;
    
      vec3 pos = position;
      float noiseFreq = 3.5;
      float noiseAmp = 0.45; 
      vec3 noisePos = vec3(pos.x * noiseFreq + uTime, pos.y, pos.z);
      pos.z += snoise(noisePos) * noiseAmp;
    
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
    }
    `,
  fragmentShader: `
varying vec2 vUv;
uniform sampler2D uTexture;

void main() {
  vec3 texture = texture2D(uTexture, vUv).rgb;
  gl_FragColor = vec4(texture, 1.);
}
`,
  uniforms,
  side: THREE.DoubleSide
});

const pageLink = new THREE.Group();
const pageImage = new THREE.Mesh(geometry, material);
pageLink.add(pageImage)
pageLink.rotation.y = Math.PI

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
  text.position.z = 1
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
let currentDeltaAngle = 0
let angle = 0 - (Math.PI / 2)

function moveCard(card, angle) {
  card.position.x = 10 * Math.cos(angle);
  card.position.z = 10 * Math.sin(angle);
  card.position.y = 6 * Math.sin(angle);
  pageLink.rotation.y = 0 - angle + (Math.PI / 2)
}

moveCard(pageLink, angle)

function slowDown(velocity) {
  angle -= velocity
  rotateObjects()

  if (Math.abs(velocity) > 0.01) {
    requestAnimationFrame(() => {
      slowDown(velocity *= 0.9)
    })

  }
}

window.addEventListener('mousedown', function (event) {
  isClicked = true
  prevClientX = event.clientX
});
window.addEventListener('mouseup', function () {
  isClicked = false
  console.log('currentDeltaAngle', currentDeltaAngle)
  slowDown(currentDeltaAngle)
});

function rotateObjects() {
  moveCard(pageLink, angle)

  if (car) {
    car.rotation.y -= 0.0005;
  }
}

const mouseSensibility = 2
function onMouseMove(event) {
  if (isClicked) {
    currentDeltaAngle = (event.clientX - prevClientX) / window.innerWidth * mouseSensibility
    angle = (angle - currentDeltaAngle);
    prevClientX = event.clientX
    rotateObjects()
  }
}
window.addEventListener('mousemove', onMouseMove);


function render(time) {
  time *= 0.001;  // convert to seconds
  uniforms.uTime.value = time;
  requestAnimationFrame(render);
  pickHelper.pick(pickPosition, scene, camera);

  renderer.render(scene, camera);
}
requestAnimationFrame(render);
