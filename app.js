var camera, scene, renderer;
var geometry, material, mesh;
var animationId;

init();
animate();

// Cleanup function to prevent memory leaks
function cleanup() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    window.removeEventListener('resize', onWindowResize, false);
    
    if (geometry) geometry.dispose();
    if (material) material.dispose();
    if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup, false);

function init() {

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.03, 20 );
    camera.position.z = 5;

    scene = new THREE.Scene();

    geometry = new THREE.BoxGeometry( 1, 1, 1 );
    material = new THREE.MeshNormalMaterial();

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    try {
        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );
    } catch (error) {
        console.error('WebGL not supported or failed to initialize:', error);
        document.body.innerHTML = '<div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">WebGL is not supported on this device or browser.</div>';
        return;
    }

    // Add window resize handler
    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {

    animationId = requestAnimationFrame( animate );

    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;
    mesh.rotation.z += 0.03;

    renderer.render( scene, camera );

}