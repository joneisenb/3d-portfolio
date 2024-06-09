// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.tsx'
import './index.css'
//@ts-ignore
import * as THREE from 'three/src/Three.js';
//@ts-ignore
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';


class Planet {
    planetMesh: THREE.Mesh;
    orbitCurve: THREE.Line;
    orbitRadius: number;
    orbitSpeed: number;
    offset: number;
    planetText: string;

    constructor(planetRadius: number, orbitRadius: number, color: number, speed: number, offset: number, text: string) {
        this.createPlanetMesh(planetRadius,color,text);
        this.createOrbitCurve(orbitRadius,color);
        this.orbitRadius = orbitRadius;
        this.orbitSpeed = speed;
        this.offset = offset
        this.planetText = text;
    }
    createOrbitCurve(radius: number, color: number) {
        const curve = new THREE.EllipseCurve(
            0,  0,            // ax, aY
            radius, radius,           // xRadius, yRadius
            0,  2 * Math.PI,  // aStartAngle, aEndAngle
            false,            // aClockwise
            0                 // aRotation
        );

        const points = curve.getPoints( 50 );
        const orbitGeometry = new THREE.BufferGeometry().setFromPoints( points );

        const orbitMaterial = new THREE.LineBasicMaterial( { color: color } );

        // Create the final object to add to the scene
        const ellipse = new THREE.Line( orbitGeometry, orbitMaterial );
        ellipse.rotation.set(Math.PI/2,0,0);
        this.orbitCurve = ellipse;
    }
    createPlanetMesh(radius: number, color: number, text:string) {
        const geometry = new THREE.SphereGeometry(radius);
        const material = new THREE.MeshPhysicalMaterial({color: color});
        material.emissive = new THREE.Color(color);
        material.emissiveIntensity = 0.01;
        material.transparent = true;
        this.planetMesh = new THREE.Mesh(geometry, material);
        this.planetMesh.name = text;
    }
  }

const planetMeshes = new THREE.Group();

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 2000)
camera.position.set(1000,200,1000);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
});



renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
camera.position.setZ(30);

renderer.render(scene, camera);

const sunGeometry = new THREE.SphereGeometry(50);
const sunMaterial = new THREE.MeshPhysicalMaterial( {color: 0xFFD858});
sunMaterial.transparent=true;
sunMaterial.emissiveIntensity=2;
sunMaterial.emissive=new THREE.Color(0xFFD858);

const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.name = "RESUME";
planetMeshes.add(sun);

const sunlight1 = new THREE.PointLight(0xFFD858, 500000, 10000);
sunlight1.position.set(0,0,0);
sunlight1.castShadow = true; // default false
scene.add(sunlight1);

const ambientlight = new THREE.AmbientLight( 0x404040, 1);
scene.add( ambientlight );

let val = 0.0;

const controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 1000;
controls.minDistance = 400;
controls.enableDamping = true;
controls.dampingFactor = 0.01;
controls.enablePan = false;

const planets: Planet[] = [
    new Planet(23, 175, 0xabcdef, 1, 1, "RESUME"),
    new Planet(17, 250, 0xffee00, 2, 2, "PROJECTS"),
    new Planet(14, 125, 0x000ddd, 2, 3, "ABOUT ME"),
    new Planet(30, 300, 0xffde55, 1, 5, "CONTACT")
];


planets.push();

for (let i = 0; i < planets.length; i++) {
    planetMeshes.add(planets[i].planetMesh);
    scene.add(planets[i].orbitCurve);
}



const raycaster = new THREE.Raycaster();
let hovering = false;
let hoveredObject = sun;
window.addEventListener( 'pointermove', onPointerMove )
window.addEventListener( 'mousedown', onClick )

const followText = document.getElementById('planet_text');

function onPointerMove(event: MouseEvent) {
    resetMaterials()
	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components
    const coords = new THREE.Vector2(
        (event.clientX/renderer.domElement.clientWidth) * 2 - 1,
        -((event.clientY/renderer.domElement.clientHeight) * 2 - 1)
    )
    raycaster.setFromCamera(coords, camera);
    const intersects = raycaster.intersectObjects(planetMeshes.children);
    if(intersects.length > 0) {
        hoveredObject=intersects[0].object
        hovering = true;
        followText!.innerText = hoveredObject.name;
        hoveredObject.material.opacity = 0.6;
    }

}




function resetMaterials() {
    for (let i = 0; i < planetMeshes.children.length; i++) {
        hoveredObject.material.opacity = 1;
        hovering = false;
    }
}

function onClick(event: MouseEvent) {
    const coords = new THREE.Vector2(
        (event.clientX/renderer.domElement.clientWidth) * 2 - 1,
        -((event.clientY/renderer.domElement.clientHeight) * 2 - 1)
    )
    raycaster.setFromCamera(coords, camera);
    const intersects = raycaster.intersectObjects(planetMeshes.children);
    if(intersects.length > 0) {
        console.log(intersects[0].object.name);
    }
}



scene.add(planetMeshes)

function animate() {

    requestAnimationFrame( animate );

    if (hovering) {
        val += 0.00003;
        if (parseFloat(followText!.style.opacity) < 1) {
            followText!.style.opacity = (parseFloat(followText!.style.opacity) + 0.01).toString();
            console.log(followText!.style.opacity)
        }

    }
    else {
        val +=0.0001;
        if (parseFloat(followText!.style.opacity) > 0) {
            followText!.style.opacity = (parseFloat(followText!.style.opacity) - 0.01).toString();
            console.log(followText!.style.opacity)
        }

    }

    for (let i = 0; i < planets.length; i++) {
        planets[i].planetMesh.position.x = calculateSin((val * planets[i].orbitSpeed) + planets[i].offset, planets[i].orbitRadius);
        planets[i].planetMesh.position.z = calculateCos(val * planets[i].orbitSpeed + planets[i].offset, planets[i].orbitRadius);
    }

    controls.update();
    renderer.render( scene, camera );

}



animate()


function calculateSin(val: number, max: number ) {

    return Math.sin(val) * max;
}
function calculateCos(val: number, max: number ) {

    return Math.cos(val) * max;
}


function addStar() {
    const geometry = new THREE.SphereGeometry(0.25,24,24);
    const material = new THREE.MeshStandardMaterial( {color:0xffffff});
    const star = new THREE.Mesh(geometry, material);

    const [x,y,z] = Array(3).fill(0).map(() => THREE.MathUtils.randFloatSpread(1000));

    star.position.set(x,y,z);
    scene.add(star);
}

Array(200).fill(0).forEach(addStar);

