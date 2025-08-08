var camera, scene, renderer;
var geometry, material, mesh;
var isAnimating = true;
var rotationSpeed = 1;
var stats = { last: performance.now(), frames: 0 };
var pixelRatioMode = 'auto';
var container = document.body;

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

var radiusInp = document.getElementById('radius');
var sizeInp = document.getElementById('size');
if (radiusInp) radiusInp.onchange = init;
if (sizeInp) sizeInp.onchange = init;

function init() {
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.03, 20);
  camera.position.set(2.5, 2.2, 5);

  scene = new THREE.Scene();

  geometry = new THREE.BoxGeometry(1, 1, 1);
  material = new THREE.MeshNormalMaterial();

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  updatePixelRatio();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  } else if ('outputEncoding' in renderer && THREE.sRGBEncoding) {
    renderer.outputEncoding = THREE.sRGBEncoding;
  }

  container.appendChild(renderer.domElement);

  // Interaction
  setupInteraction();
  // UI controls
  setupControls();
  // Resize
  window.addEventListener('resize', onWindowResize, { passive: true });
  // Fullscreen hint
  window.addEventListener('dblclick', toggleFullscreen);

  // WebGL context loss handling
  renderer.domElement.addEventListener('webglcontextlost', function (e) {
    e.preventDefault();
    isAnimating = false;
  });
  renderer.domElement.addEventListener('webglcontextrestored', function () {
    isAnimating = true;
  });
}

function updatePixelRatio() {
  var ratio = window.devicePixelRatio || 1;
  if (pixelRatioMode !== 'auto') {
    ratio = parseFloat(pixelRatioMode) || 1;
  } else {
    // Cap pixel ratio for performance
    ratio = Math.min(ratio, 2);
  }
  renderer.setPixelRatio(ratio);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(now) {
  requestAnimationFrame(animate);

  if (isAnimating) {
    mesh.rotation.x += 0.01 * rotationSpeed;
    mesh.rotation.y += 0.02 * rotationSpeed;
    mesh.rotation.z += 0.03 * rotationSpeed;
  }

  renderer.render(scene, camera);
  updateFps(now || performance.now());
}

function updateFps(now) {
  stats.frames++;
  var delta = now - stats.last;
  if (delta >= 500) {
    var fps = Math.round((stats.frames * 1000) / delta);
    var fpsEl = document.getElementById('fps');
    if (fpsEl) fpsEl.textContent = fps + ' fps';
    stats.frames = 0;
    stats.last = now;
  }
}

function setupControls() {
  var btn = document.getElementById('toggle-anim');
  if (btn) {
    btn.addEventListener('click', function () {
      isAnimating = !isAnimating;
      btn.textContent = isAnimating ? 'Pause' : 'Play';
      btn.setAttribute('aria-pressed', String(!isAnimating));
    });
  }

  var speed = document.getElementById('speed');
  if (speed) {
    speed.addEventListener('input', function (e) {
      var val = parseFloat(e.target.value);
      rotationSpeed = isFinite(val) ? val : 1;
    });
  }

  var wire = document.getElementById('wireframe');
  if (wire) {
    wire.addEventListener('change', function (e) {
      material.wireframe = !!e.target.checked;
    });
  }

  var pr = document.getElementById('pixelRatio');
  if (pr) {
    pr.addEventListener('change', function (e) {
      var value = e.target.value;
      pixelRatioMode = value === 'auto' ? 'auto' : value;
      updatePixelRatio();
    });
  }

  var reset = document.getElementById('reset-camera');
  if (reset) {
    reset.addEventListener('click', function () {
      camera.position.set(2.5, 2.2, 5);
      spherical.setFromVector3(new THREE.Vector3().subVectors(camera.position, target));
      camera.lookAt(target);
    });
  }

  var fs = document.getElementById('fullscreen');
  if (fs) fs.addEventListener('click', toggleFullscreen);
}

function toggleFullscreen() {
  var elem = renderer.domElement;
  if (!document.fullscreenElement) {
    if (elem.requestFullscreen) elem.requestFullscreen();
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
  }
}

// Lightweight orbit-like interaction
var isPointerDown = false;
var lastX = 0, lastY = 0;
var spherical = new THREE.Spherical(7, Math.PI / 3, -Math.PI / 6);
var target = new THREE.Vector3(0, 0, 0);
var damping = 0.1;
var velocityTheta = 0;
var velocityPhi = 0;
var zoomVelocity = 0;

function setupInteraction() {
  updateCameraFromSpherical();

  var canvas = renderer.domElement;
  canvas.style.touchAction = 'none';

  canvas.addEventListener('pointerdown', function (e) {
    isPointerDown = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!isPointerDown) return;
    var dx = e.clientX - lastX;
    var dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    var rotSpeed = 0.005;
    velocityTheta -= dx * rotSpeed;
    velocityPhi -= dy * rotSpeed;
  });
  canvas.addEventListener('pointerup', function (e) {
    isPointerDown = false;
    canvas.releasePointerCapture(e.pointerId);
  });
  canvas.addEventListener('wheel', function (e) {
    e.preventDefault();
    var delta = e.deltaY;
    zoomVelocity += delta * 0.0008;
  }, { passive: false });

  // Smooth update loop tied to animation
  var originalRender = renderer.render.bind(renderer);
  renderer.render = function (sc, cam) {
    applyInteractionDamping();
    updateCameraFromSpherical();
    originalRender(sc, cam);
  };
}

function applyInteractionDamping() {
  spherical.theta += velocityTheta;
  spherical.phi += velocityPhi;

  var minPhi = 0.01;
  var maxPhi = Math.PI - 0.01;
  spherical.phi = Math.max(minPhi, Math.min(maxPhi, spherical.phi));

  spherical.radius *= Math.exp(zoomVelocity);
  spherical.radius = Math.max(2, Math.min(20, spherical.radius));

  velocityTheta *= 1 - damping;
  velocityPhi *= 1 - damping;
  zoomVelocity *= 1 - damping;
}

function updateCameraFromSpherical() {
  var offset = new THREE.Vector3().setFromSpherical(spherical);
  camera.position.copy(target).add(offset);
  camera.lookAt(target);
}

// Start after DOM and all variables are ready
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', function () {
    init();
    animate();
  });
} else {
  init();
  animate();
}