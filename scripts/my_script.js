;(function(){
    
  // Width and height of the browser window
    var WINDOW_WIDTH = window.innerWidth;
    var WINDOW_HEIGHT = window.innerHeight;

    // Where our lights and cameras will go
    var scene = new THREE.Scene();
    var axes = new THREE.AxisHelper(200);
    
    // Keeps track of time
    var clock = new THREE.Clock();

    // How we will see the scene
    var camera = new THREE.PerspectiveCamera(45, WINDOW_WIDTH / WINDOW_HEIGHT, 0.1, 1000);

    // Position the camera slightly above and in front of the scene
    camera.position.set(0, -50, 50);
    camera.up = new THREE.Vector3(0,0,1);

    // Look at the center of the scene
    camera.lookAt(scene.position);

    // Think of the renderer as the engine that drives the scene
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(WINDOW_WIDTH, WINDOW_HEIGHT);

    // Set the pixel ratio of the screen (for high DPI screens)
    renderer.setPixelRatio(window.devicePixelRatio);

    // Set the background of the scene to a orange/red
    renderer.setClearColor("#ededed");

    // Set renderer to the size of the window
    renderer.setSize(WINDOW_WIDTH, WINDOW_HEIGHT);

    

    // Apply VR stereo rendering to renderer
    var effect = new THREE.VREffect(renderer);
    effect.setSize(WINDOW_WIDTH, WINDOW_HEIGHT);

    var manager = new WebVRManager(renderer, effect);

    // URL to our DEM resource
    var terrainURL = "dem/ne_minnesota.bin";

    // Utility to load the DEM data
    var terrainLoader = new THREE.TerrainLoader();

    // We'll need this later
    var surface;

    // Create the plane geometry
    var geometry = new THREE.PlaneGeometry(60, 60, 199, 199);

    // The terrainLoader loads the DEM file and defines a function to be called when the file is successfully downloaded.
    terrainLoader.load(terrainURL, function(data){

        // Adjust each vertex in the plane to correspond to the height value in the DEM file.
        for (var i = 0, l = geometry.vertices.length; i < l; i++) {
            geometry.vertices[i].z = data[i] / 65535 * 10;
        }

        var material = new THREE.MeshPhongMaterial({
            map: THREE.ImageUtils.loadTexture('dem/final2.png')
        });

        var plane = new THREE.Mesh(geometry, material);

        scene.add(plane);
    });

    // Lights!
    var dirLight = new THREE.DirectionalLight( 0xffffff, 0.75);
    dirLight.position.set( -1, 1, 1).normalize();

    var ambiLight = new THREE.AmbientLight(0x999999);

    // Add the lights to the scene
    scene.add(ambiLight);
    scene.add(dirLight);

    // Detect mobile devices in the user agent
    var is_mobile= /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Conditionally load VR or Fly controls, based on whether we're on a mobile device
    if (is_mobile) {
        var controls = new THREE.VRControls(camera);
    } else {
        // WASD-style movement controls
        var controls = new THREE.FlyControls(camera);

        // Disable automatic forward movement
        controls.autoForward = false;

        // Click and drag to look around with the mouse
        controls.dragToLook = true;

        // Movement and roll speeds, adjust these and see what happens!
        controls.movementSpeed = 20;
        controls.rollSpeed = Math.PI / 12;
    }

    // Append the renderer to the DOM
    document.body.appendChild( renderer.domElement );

    // Render loop
    // This should go at the bottom of the script.
    function render() {

        // Get the difference from when the clock was last updated and update the controls based on that value.
        var delta = clock.getDelta();
        controls.update(delta);

        // Update the scene through the manager.
        manager.render(scene, camera);

        // Call the render function again
        requestAnimationFrame( render );

    }

    render();



})();