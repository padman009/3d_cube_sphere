var camera, scene, renderer;
var geometry, material, mesh;

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.03, 20 );
    camera.position.z = 5;

    scene = new THREE.Scene();

    geometry = new THREE.BoxGeometry( 1, 1, 1 );
    material = new THREE.MeshNormalMaterial();

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );

}

function animate() {

    requestAnimationFrame( animate );

    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;
    mesh.rotation.z += 0.03;

    renderer.render( scene, camera );

}