import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const canvas=document.querySelector("#canvas1")
const renderer = new THREE.WebGLRenderer({canvas:canvas});
renderer.setSize(window.innerWidth, window.innerHeight);

// Texture Loader
const textureLoader = new THREE.TextureLoader();
const moonTexture = textureLoader.load('/textures/moon.jpg');

// Lighting (Sun as a light source)
const pointLight = new THREE.PointLight(0xffffff, 2, 500);
scene.add(pointLight);
const ambientLight = new THREE.AmbientLight(0x808080, 2.5);
scene.add(ambientLight);

// Additional light to improve planet visibility
const planetLight = new THREE.PointLight(0xffffff, 1.5, 150);
planetLight.position.set(0, 0, 0); // Near the Sun
scene.add(planetLight);

// Sun
const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ map: textureLoader.load('/textures/sun.jpg') });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Planets Data
const planets = [];
const planetOrbits = [];
const moons = [];
const planetData = [
    { size: 0.5, distance: 10, speed: 0.02, texture: '/textures/mercury.jpg', moons: [] },
    { size: 0.8, distance: 15, speed: 0.015, texture: '/textures/venus.jpg', moons: [] },
    { size: 1, distance: 20, speed: 0.01, texture: '/textures/earth.jpg', moons: [
        { size: 0.2, distance: 2, speed: 0.04 }
    ]},
    { size: 0.7, distance: 25, speed: 0.008, texture: '/textures/mars.jpg', moons: [
        { size: 0.1, distance: 1.5, speed: 0.03 },
        { size: 0.1, distance: 2, speed: 0.02 } 
    ]},
    { size: 2, distance: 35, speed: 0.005, texture: '/textures/jupiter.jpg', moons: [
        { size: 0.3, distance: 3, speed: 0.02 } 
    ]},
    { size: 1.5, distance: 45, speed: 0.003, texture: '/textures/saturn.jpg', moons: [
        { size: 0.4, distance: 4, speed: 0.018 } 
    ]},
    { size: 1.2, distance: 55, speed: 0.002, texture: '/textures/uranus.jpg', moons: [] },
    { size: 1.1, distance: 65, speed: 0.001, texture: '/textures/neptune.jpg', moons: [] }
];


planetData.forEach(data => {
    // Create planet
    const geometry = new THREE.SphereGeometry(data.size, 32, 32);
    const material = new THREE.MeshStandardMaterial({ 
        map: textureLoader.load(data.texture),
        emissive: 0x222222, 
        emissiveIntensity: 0.6, 
        metalness: 0.4, 
        roughness: 0.6 
    });
    const planet = new THREE.Mesh(geometry, material);
    planet.userData = { distance: data.distance, speed: data.speed, angle: Math.random() * Math.PI * 2 };
    planets.push(planet);
    scene.add(planet);

    // Create orbit ring
    const orbitGeometry = new THREE.RingGeometry(data.distance - 0.1, data.distance + 0.1, 64);
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    planetOrbits.push(orbit);
    scene.add(orbit);

     // Create moons
    data.moons.forEach(moonData => {
        const moonGeometry = new THREE.SphereGeometry(moonData.size, 32, 32);
        const moonMaterial = new THREE.MeshStandardMaterial({ 
            map: moonTexture,
            emissive: 0x222222, 
            emissiveIntensity: 0.4, 
            metalness: 0, 
            roughness: 0.9 
        });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.userData = { planet: planet, distance: moonData.distance, speed: moonData.speed, angle: Math.random() * Math.PI * 2 };
        moons.push(moon);
        scene.add(moon);
    });

});

// Asteroid Belt
const asteroidGeometry = new THREE.SphereGeometry(0.2, 8, 8);
const asteroidMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const asteroids = new THREE.Group();

for (let i = 0; i < 300; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 10; // Between Mars and Jupiter
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    const y = (Math.random() - 0.5) * 2; 
    
    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    asteroid.position.set(x, y, z);
    asteroids.add(asteroid);
}
scene.add(asteroids);

// Stars (Static)
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, transparent: true }); 
const starVertices = [];
const starOpacities = [];

for (let i = 0; i < 5000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starVertices.push(x, y, z);
    starOpacities.push(Math.random() * Math.PI * 2);
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const stars = new THREE.Points(starGeometry, starMaterial);
stars.position.set(0, 0, 0);
scene.add(stars);

// Camera Position
camera.position.set(0,30, 100);
camera.lookAt(0, 0, 0);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotateSpeed = 0.5;

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    planets.forEach(planet => {
        planet.userData.angle += planet.userData.speed;
        planet.position.x = Math.cos(planet.userData.angle) * planet.userData.distance;
        planet.position.z = Math.sin(planet.userData.angle) * planet.userData.distance;
        planet.rotation.y += 0.05;
    });


    // Rotate moons around their respective planets
    moons.forEach(moon => {
        moon.userData.angle += moon.userData.speed;
        moon.position.x = moon.userData.planet.position.x + Math.cos(moon.userData.angle) * moon.userData.distance;
        moon.position.z = moon.userData.planet.position.z + Math.sin(moon.userData.angle) * moon.userData.distance;
    });

    controls.update();
    renderer.render(scene, camera);
}

animate();

// Handle Window Resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
