let scene, camera, renderer, earth, controls, starfield;
let raycaster, mouse, isDragging = false;
let zoomingIn = true;  
let zoomSpeed = 0.05;  
let startZoomDistance = 325;  

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
    );

    // Set the camera's initial position based on the startZoomDistance
    camera.position.z = startZoomDistance;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('scene-container').appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();

    // Load the Earth texture
    const earthTexture = textureLoader.load('textures/2k_earth_daymap.jpg');

    // Create the Earth sphere and apply the texture
    const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
    const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Create star particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 15000;
    const vertices = new Float32Array(particlesCount * 3); // x, y, z for each particle

    for (let i = 0; i < particlesCount * 3; i++) {
        vertices[i] = (Math.random() - 0.5) * 1000; // Distribute stars within a large cube
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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5).normalize();
    scene.add(directionalLight);

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

    const intersects = raycaster.intersectObject(earth);

    if (intersects.length > 0) {
        isDragging = true;
        controls.enabled = true;
    } else {
        controls.enabled = false;
    }
}

function onMouseMove(event) {
    if (isDragging) {
        controls.update();
    }
}

function onMouseUp(event) {
    isDragging = false;
    controls.enabled = false;
}

function animate() {
    requestAnimationFrame(animate);

    earth.rotation.y += 0.001;

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

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
window.addEventListener('resize', onWindowResize);
