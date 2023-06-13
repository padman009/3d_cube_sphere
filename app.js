var camera, scene, renderer;
var geometry, material, mesh;
var sideSize = 0.5;
var radius = 4;

init();
animate();

function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function constructCubCircleMap() {
    var cubCircleMap = Array(radius * 2)
        .fill()
        .map(() => Array(radius * 2).fill(0));

    console.log(
        sideSize / 2,
        Math.pow(radius, 2)
    );

    for (let x = 0; x < cubCircleMap.length; x++) {
        console.log(
            x,
            Math.abs(radius - x),
            Math.pow(Math.abs(radius - x), 2),
            Math.pow(radius, 2) - Math.pow(Math.abs(radius - x), 2)
        );

        let horda = Math.sqrt(
            Math.pow(radius, 2) -
                Math.pow(Math.abs(radius - x), 2)
        );

        console.log("\t" + horda);
        
        for (let y = 0; y < cubCircleMap[x].length; y++) {
            if (
                x == cubCircleMap[x].length / 2 ||
                y == cubCircleMap[x].length / 2 ||
                Math.abs(Math.abs(y - radius) - horda) -
                    Math.abs(Math.abs(y - radius) - Math.ceil(horda)) <
                    0
            ) {
                cubCircleMap[x][y] = 1;
            }

            console.log([
                x,
                y,
                cubCircleMap[x][y],
                Math.abs(y - radius),
                Math.abs(Math.abs(y - radius) - horda),
                Math.ceil(horda),
                Math.abs(Math.abs(y - radius) - Math.ceil(horda)),
                Math.abs(Math.abs(y - radius) - horda) -
                    Math.abs(Math.abs(y - radius) - Math.ceil(horda)),
            ]);
        }
    }
    console.log('');
    console.log(cubCircleMap.length);
    cubCircleMap.forEach((element, index) => {
        console.log(index)
        console.log(element)
    });

    return cubCircleMap;
}

function init() {
    var cubCircleMap = constructCubCircleMap();

    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.03,
        20
    );
    camera.position.z = 5;

    scene = new THREE.Scene();

    let group = new THREE.Group();
    for (let x = 0; x < cubCircleMap.length; x++) {
        for (let y = 0; y < cubCircleMap[x].length; y++) {
            if (!cubCircleMap[x][y]) {
                continue;
            }
            geometry = new THREE.BoxGeometry(sideSize, sideSize, sideSize);
            material = new THREE.MeshBasicMaterial({
                color: getRandomColor(),
                side: THREE.DoubleSide,
            });

            mesh = new THREE.Mesh(geometry, material);
            // mesh.rotation.x += 0.75;
            // mesh.rotation.y += 0.9;
            mesh.position.x = (x - Math.floor(cubCircleMap.length / 2)) * sideSize;
            mesh.position.y = (y - Math.floor(cubCircleMap[x].length / 2)) * sideSize;
            // mesh.position.z += index * sideSize;

            group.add(mesh);
        }
    }

    let circle = new THREE.RingGeometry(
        radius * sideSize,
        radius * sideSize + 1,
        32
    );
    let circleMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        side: THREE.DoubleSide,
    });
    mesh = new THREE.Mesh(circle, circleMaterial);

    group.add(mesh);
    scene.add(group);

    group.rotation.z = -(Math.PI / 2);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);
}

function animate() {
    requestAnimationFrame(animate);

    // mesh.rotation.x = 0.75;
    // mesh.rotation.y = 0.75;
    // mesh.rotation.z = 0.75;
    // console.log([mesh.rotation.x, mesh.rotation.y, mesh.rotation.z]);

    renderer.render(scene, camera);
}
