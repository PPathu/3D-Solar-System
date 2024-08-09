let scene, camera, renderer, controls;
let sun, planets = [];
let raycaster, mouse, isDragging = false;
let zoomingIn = true;
let zoomSpeed = 0.04;
let startZoomDistance = 325;
const rotationSpeedScale = 1000; 

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = startZoomDistance;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('scene-container').appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();

    
    const sunTexture = textureLoader.load('textures/sun.jpg');
    const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    sun = new THREE.Mesh(sunGeometry, sunMaterial);

    const sunLight = new THREE.PointLight(0xffffff, 1.5, 100); 
    sun.add(sunLight); 
    scene.add(sun);

    // Planets array with realistic rotation speeds scaled down
    const planetData = [
        { name: "Mercury", size: 0.3, distance: 4, texture: 'textures/mercury.jpg', speed: 0.0047, rotationPeriod: 140.76 },  
        { name: "Venus", size: 0.9, distance: 6, texture: 'textures/venus.jpg', speed: 0.0035, rotationPeriod: -583.25 },   
        { name: "Earth", size: 1, distance: 8, texture: 'textures/earth.jpg', speed: 0.003, rotationPeriod: 2.4 },          
        { name: "Mars", size: 0.5, distance: 10, texture: 'textures/mars.jpg', speed: 0.0024, rotationPeriod: 2.46 },       
        { name: "Jupiter", size: 2, distance: 14, texture: 'textures/jupiter.jpg', speed: 0.0013, rotationPeriod: 0.99 },   
        { name: "Saturn", size: 1.7, distance: 18, texture: 'textures/saturn.jpg', speed: 0.0009, rotationPeriod: 1.07 },   
        { name: "Uranus", size: 1.2, distance: 22, texture: 'textures/uranus.jpg', speed: 0.0006, rotationPeriod: -1.72 },  
        { name: "Neptune", size: 1.2, distance: 26, texture: 'textures/neptune.jpg', speed: 0.0005, rotationPeriod: 1.61 }  
    ];

    planetData.forEach(data => {
        const rotationSpeed = (2 * Math.PI) / (data.rotationPeriod * 60 * 60 * rotationSpeedScale); 
        
        const planetTexture = textureLoader.load(data.texture);
        const planetGeometry = new THREE.SphereGeometry(data.size, 32, 32);
        const planetMaterial = new THREE.MeshStandardMaterial({ map: planetTexture });
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);

        planet.position.x = data.distance;
        scene.add(planet);

        planets.push({
            mesh: planet,
            distance: data.distance,
            speed: data.speed,
            angle: 0,  
            rotationSpeed: data.rotationPeriod < 0 ? -rotationSpeed : rotationSpeed 
        });

        // Create the orbit ring
        const ringGeometry = new THREE.RingGeometry(data.distance - 0.15, data.distance - 0.10, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff, 
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.2
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        scene.add(ring);
    });

    // Create star particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 15000;
    const vertices = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        vertices[i] = (Math.random() - 0.5) * 1000;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    const particleTexture = textureLoader.load('textures/particles/star.png'); 
    const particlesMaterial = new THREE.PointsMaterial({
        map: particleTexture,
        size: 0.5,
        sizeAttenuation: true,
        transparent: true,
    });

    const stars = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(stars);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); 
    scene.add(ambientLight);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Initialize OrbitControls with zoom limits
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.zoomSpeed = 1.0;
    controls.minDistance = 4;
    controls.maxDistance = startZoomDistance;

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    animate();
}

function onMouseDown(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    isDragging = true;
}

function onMouseMove(event) {
    if (isDragging) {
        controls.update();
    }
}

function onMouseUp(event) {
    isDragging = false;
}

function animate() {
    requestAnimationFrame(animate);

    // Rotate planets around the sun and on their own axis
    planets.forEach(planet => {
        planet.angle += planet.speed;
        planet.mesh.position.x = planet.distance * Math.cos(planet.angle);
        planet.mesh.position.z = planet.distance * Math.sin(planet.angle);

        planet.mesh.rotation.y += planet.rotationSpeed;
    });

    // Rotate the stars slightly to add some dynamism
    scene.children.forEach(child => {
        if (child instanceof THREE.Points) {
            child.rotation.y += 0.0001;
        }
    });

    // Handle zoom-in animation
    if (zoomingIn) {
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, controls.minDistance + 3, zoomSpeed);
        if (Math.abs(camera.position.z - (controls.minDistance + 3)) < 0.1) {
            zoomingIn = false;
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
window.addEventListener('resize', onWindowResize);
