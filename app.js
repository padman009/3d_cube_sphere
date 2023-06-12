var camera, scene, renderer;
var geometry, material, mesh;
var sideSize = 0.5;
var radius = 4.5;

init();
animate();

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  

function init() {

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.03, 20 );
    camera.position.z = 5;

    scene = new THREE.Scene();

    var cubCircleMap = Array(radius * 2).fill().map(() => Array(radius * 2).fill(0));
    
    for (let x = 0; x < cubCircleMap.length; x++) {
        console.log([Math.pow(radius, 2), Math.pow(Math.abs(radius - x) - (sideSize / 2), 2)]);
        let horda = Math.round(Math.sqrt(Math.pow(radius, 2) - Math.pow(Math.abs(radius - x) - (sideSize / 2), 2)));
        console.log(horda);
        for (let y = 0; y < cubCircleMap[x].length; y++) {
            if (Math.round(Math.abs(y - radius)) < horda) {
                cubCircleMap[x][y] = 1;
            }

            console.log([x, y, cubCircleMap[x][y], Math.round(Math.abs(y - radius))]);
        }
    }
    console.log(cubCircleMap);


    let row = 9;
    let col = 9;
    let group = new THREE.Group();
    for (let x = 0; x < row; x++) {
        for (let y = 0; y < col; y++) {
            if(!cubCircleMap[x][y]){
                continue;
            }
            geometry = new THREE.BoxGeometry( sideSize, sideSize, sideSize );
            material = new THREE.MeshBasicMaterial( { color: getRandomColor(), side: THREE.DoubleSide } );
            
            mesh = new THREE.Mesh( geometry, material );
            // mesh.rotation.x += 0.75;
            // mesh.rotation.y += 0.9;
            mesh.position.x = (x - Math.floor(row / 2)) * sideSize;
            mesh.position.y = (y - Math.floor(col / 2)) * sideSize;
            // mesh.position.z += index * sideSize;
            
            group.add(mesh);
        }
    }
    let circle = new THREE.RingGeometry(radius * sideSize, (radius * sideSize) + 1, 32);
    let circleMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00, side: THREE.DoubleSide } );
    mesh = new THREE.Mesh( circle, circleMaterial ); 
    // mesh.position.z = sideSize;
    group.add( mesh );
    scene.add( group );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );

}

function animate() {

    requestAnimationFrame( animate );

    // mesh.rotation.x = 0.75;
    // mesh.rotation.y = 0.75;
    // mesh.rotation.z = 0.75;
    // console.log([mesh.rotation.x, mesh.rotation.y, mesh.rotation.z]);

    renderer.render( scene, camera );

}