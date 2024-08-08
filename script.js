let scene, camera, renderer, earth, controls;

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
    );
    camera.position.z = 3;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('scene-container').appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('textures/2k_earth_daymap.jpg');  // Make sure this file is in your project folder

    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshStandardMaterial({ map: earthTexture });
    earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5).normalize();
    scene.add(directionalLight);

    // Add OrbitControls to allow clicking and dragging to rotate the planet
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;  // Smooth rotation
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;  // Disable zoom if you want to keep the camera distance fixed

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    
    // Update the controls on each frame
    controls.update();

    // Render the scene from the perspective of the camera
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
window.addEventListener('resize', onWindowResize);
