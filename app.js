var camera, scene, renderer;
var geometry, material, mesh;
var sideSize = 0.5;
var radius = 1000.5;
var size = 1;
var z = 500;

init();

function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    // return color;
    return '#F00000';
}

function constructCubCircleMap() {
    var cubCircleMap = Array(radius * 2)
        .fill()
        .map(() => Array(radius * 2).fill(0));

    // console.info(
    //     sideSize / 2,
    //     Math.pow(radius, 2)
    // );

    let centralCell = Math.ceil(radius) -1;
    console.log(centralCell)

    for (let x = 0; x < cubCircleMap.length; x++) {
        // console.log(
        //     x,
        //     Math.abs(centralCell - x),
        //     Math.pow(Math.abs(centralCell - x), 2),
        //     Math.pow(centralCell, 2) - Math.pow(Math.abs(centralCell - x), 2)
        // );

        let horda = Math.sqrt(
            Math.pow(centralCell, 2) -
                Math.pow(Math.abs(centralCell - x), 2)
        );

        // console.log("\t" + horda);
        horda += horda === Math.ceil(horda) ?0.1:0;
        
        for (let y = 0; y < cubCircleMap[x].length; y++) {
            if (
                // x == centralCell ||
                // y == centralCell ||
                Math.abs(Math.abs(y - centralCell) - horda) -
                    Math.abs(Math.abs(y - centralCell) - Math.ceil(horda)) <
                    0
            ) {
                cubCircleMap[y][x] = 1;
            }

            // console.log([
            //     x,
            //     y,
            //     cubCircleMap[x][y],
            //     Math.abs(y - radius),
            //     Math.abs(Math.abs(y - radius) - horda),
            //     Math.ceil(horda),
            //     Math.abs(Math.abs(y - radius) - Math.ceil(horda)),
            //     Math.abs(Math.abs(y - radius) - horda) -
            //         Math.abs(Math.abs(y - radius) - Math.ceil(horda)),
            // ]);
        }
    }
    // console.log('');
    // console.log(cubCircleMap.length);
    // cubCircleMap.forEach((element, index) => {
    //     console.log(index)
    //     console.log(element)
    // });

    return cubCircleMap;
}

function init() {

    var cubCircleMap = constructCubCircleMap();

    createFromDivs(cubCircleMap);
    // createInThreeJS(cubCircleMap);
}

function createFromDivs(cubCircleMap) {
    let main = document.createElement('div');
    main.className = 'main';
    for (let x = 0; x < cubCircleMap.length; x++) {
        let row = document.createElement('div');
        row.className = 'row';
        let start = -1;
        let end = cubCircleMap[x].length - 1;
        do {
            start++;
        } while (!cubCircleMap[x][start])
        end = start;
        while (cubCircleMap[x][end]) {
            end++;
        }
        row.style.width = ((end - start + 1) * size) + 'px';
        main.appendChild(row);
    }
    document.querySelector('body').appendChild(main);
}

function createInThreeJS(cubCircleMap){
    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.03,
        2000
    );
    camera.position.z = z;

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
            mesh.position.x = (x - Math.floor(cubCircleMap.length / 2)) * sideSize;
            mesh.position.y = (y - Math.floor(cubCircleMap[x].length / 2)) * sideSize;

            group.add(mesh);
        }
    }

    // let circle = new THREE.RingGeometry(
    //     radius * sideSize,
    //     radius * sideSize + 1,
    //     32
    // );
    // let circleMaterial = new THREE.MeshBasicMaterial({
    //     color: 0xffff00,
    //     side: THREE.DoubleSide,
    // });
    // mesh = new THREE.Mesh(circle, circleMaterial);

    // group.add(mesh);
    scene.add(group);

    group.rotation.z = -(Math.PI / 2);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

    animate();
}

function animate() {
    requestAnimationFrame(animate);

    // mesh.rotation.x = 0.75;
    // mesh.rotation.y = 0.75;
    // mesh.rotation.z = 0.75;
    // console.log([mesh.rotation.x, mesh.rotation.y, mesh.rotation.z]);

    renderer.render(scene, camera);
}
