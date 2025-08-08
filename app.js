var camera, scene, renderer;
var geometry, material, instancedMesh, rootGroup;
var targetPositions = [];
var currentPositions = [];
var assemblyStart = 0;
var assemblyDurationMs = 1200;
var needsAssemblyUpdate = false;
var cubeSize = 0.9;
var spacing = 1.05;
var instancedCapacity = 0;
var currentRadiusCubes = 10;
var _tempObject3D = new THREE.Object3D();
var isAnimating = true;
var rotationSpeed = 1;
var stats = { last: performance.now(), frames: 0 };
var pixelRatioMode = 'auto';
var container = document.body;

function init() {
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.03, 200);
  camera.position.set(2.5, 2.2, 5);

  scene = new THREE.Scene();

  geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  material = new THREE.MeshNormalMaterial();
  rootGroup = new THREE.Group();
  scene.add(rootGroup);
  var radiusSlider = document.getElementById('sphereRadius');
  var initialRadius = radiusSlider ? parseInt(radiusSlider.value, 10) || 10 : 10;
  setRadius(initialRadius);

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

  updateAssemblyAnimation(now || performance.now());
  if (rootGroup && isAnimating) {
    rootGroup.rotation.y += 0.01 * rotationSpeed;
    rootGroup.rotation.x += 0.005 * rotationSpeed;
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

  var radiusSlider = document.getElementById('sphereRadius');
  if (radiusSlider) {
    radiusSlider.addEventListener('input', function (e) {
      var r = parseInt(e.target.value, 10);
      if (!isFinite(r)) r = 10;
      setRadius(r);
    });
  }

  var reset = document.getElementById('reset-camera');
  if (reset) {
    reset.addEventListener('click', function () {
      var dist = Math.max(currentRadiusCubes * spacing * 3.0, 6);
      var angleY = Math.PI / 3;
      var angleX = -Math.PI / 6;
      var offset = new THREE.Vector3().setFromSpherical(new THREE.Spherical(dist, angleY, angleX));
      camera.position.copy(offset);
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

// Cube sphere generation and animation
function generateSpherePositions(radiusCubes) {
  var positions = [];
  var shell = radiusCubes <= 3 ? 0.9 : 0.6; // a bit thicker shell for small radii
  for (var x = -radiusCubes; x <= radiusCubes; x++) {
    for (var y = -radiusCubes; y <= radiusCubes; y++) {
      for (var z = -radiusCubes; z <= radiusCubes; z++) {
        var d = Math.sqrt(x * x + y * y + z * z);
        if (Math.abs(d - radiusCubes) <= shell) {
          positions.push(new THREE.Vector3(x * spacing, y * spacing, z * spacing));
        }
      }
    }
  }
  return positions;
}

function ensureInstancedCapacity(required) {
  if (!instancedMesh || required > instancedCapacity) {
    if (instancedMesh) {
      rootGroup.remove(instancedMesh);
    }
    instancedCapacity = required;
    instancedMesh = new THREE.InstancedMesh(geometry, material, instancedCapacity);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    rootGroup.add(instancedMesh);
  }
  instancedMesh.count = required;
}

function randomScatterPosition(radiusCubes) {
  var R = (radiusCubes + 8) * spacing;
  var u = Math.random();
  var v = Math.random();
  var theta = 2 * Math.PI * u;
  var phi = Math.acos(2 * v - 1);
  var r = R * (1.0 + Math.random() * 0.5);
  var x = r * Math.sin(phi) * Math.cos(theta);
  var y = r * Math.sin(phi) * Math.sin(theta);
  var z = r * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function setRadius(radiusCubes) {
  currentRadiusCubes = Math.max(2, Math.floor(radiusCubes));
  var newTargets = generateSpherePositions(currentRadiusCubes);
  ensureInstancedCapacity(newTargets.length);

  var oldCount = currentPositions.length;
  var newCount = newTargets.length;
  var common = Math.min(oldCount, newCount);

  var newFrom = new Array(newCount);
  for (var i = 0; i < common; i++) {
    newFrom[i] = currentPositions[i].clone();
  }
  for (var j = common; j < newCount; j++) {
    newFrom[j] = randomScatterPosition(currentRadiusCubes);
  }

  currentPositions = newFrom;
  targetPositions = newTargets;
  assemblyStart = performance.now();
  needsAssemblyUpdate = true;

  var chip = document.getElementById('cubeCount');
  if (chip) chip.textContent = 'Cubes: ' + String(newCount);

  // adjust camera distance if too close/far
  var desired = Math.max(currentRadiusCubes * spacing * 3.0, 6);
  spherical.radius = Math.max(2, Math.min(40, desired));
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function updateAssemblyAnimation(now) {
  if (!instancedMesh || !needsAssemblyUpdate) return;
  var t = Math.min(1, (now - assemblyStart) / assemblyDurationMs);
  var e = easeInOutCubic(t);
  for (var i = 0; i < instancedMesh.count; i++) {
    var from = currentPositions[i] || new THREE.Vector3();
    var to = targetPositions[i] || new THREE.Vector3();
    _tempObject3D.position.set(
      from.x + (to.x - from.x) * e,
      from.y + (to.y - from.y) * e,
      from.z + (to.z - from.z) * e
    );
    _tempObject3D.rotation.set(0, 0, 0);
    _tempObject3D.updateMatrix();
    instancedMesh.setMatrixAt(i, _tempObject3D.matrix);
  }
  instancedMesh.instanceMatrix.needsUpdate = true;
  if (t === 1) {
    // Snap to targets and stop
    currentPositions = targetPositions.map(function (v) { return v.clone(); });
    needsAssemblyUpdate = false;
  }
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