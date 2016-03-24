## From Digital Elevation Models to Virtual Reality
This tutorial shows you how to manipulate a Digital Elevation Model (DEM) that can be used with Three.js to create rich Virtual Reality interactives. The bulk of it will get you from a DEM to a wireframe.

## Why?

Two reasons:
1)I recently attended a session at NICAR16 where the LA Times presented a graphic where they used [satellite imagery to render the Mars Gale Crater in 3D](https://github.com/datadesk/vr-interactives-three-js). The session was great, but because of time constraints, they couldn't go in detail about how they prepared the dataset for use. This tutorial digs into those missing steps.

2) I grew up in Bob Dylan's hometown, which is just south of one of the largest open pit mines. I wanted to see if that terrain could be represented.

## So you owe all your success to the LA Times team. You fraud.

Not entirely! They derived many of their processes from [Bjorn Sandvik's blog posts](http://blog.thematicmapping.org/2013/10/terrain-building-with-threejs-part-1.html). I used his posts to fill (most of) the gaps in my knowledge.

[Here's the final product.](http://www.mattwebdev.com/iron-range-terrain/ne_mn_wireframe.html) I wasn't all that crazy with it, but it was a fun little sandbox project, and I think there's enough good tidbits to share.

# Let's do this

## Getting the DEM file
There are tons of DEM files available online, specifically from the USGS. I found TONS of them on [this site](https://gisdata.mn.gov/dataset) -- their handy mapping tool got me datasets based on the location I specified, which was really nifty.

Note: The actual files are not included within the repo because the actual file is too big for GitHub. Don't forget to unzip. Here's a list of the ones I used -- 6 DEM images:

[Link 1](ftp://rockyftp.cr.usgs.gov/vdelivery/Datasets/Staged/NED/1/IMG/n47w093.zip)
[Link 2](ftp://rockyftp.cr.usgs.gov/vdelivery/Datasets/Staged/NED/1/IMG/n47w094.zip)
[Link 3](ftp://rockyftp.cr.usgs.gov/vdelivery/Datasets/Staged/NED/1/IMG/n47w095.zip)
[Link 4](ftp://rockyftp.cr.usgs.gov/vdelivery/Datasets/Staged/NED/1/IMG/n48w093.zip)
[Link 5](ftp://rockyftp.cr.usgs.gov/vdelivery/Datasets/Staged/NED/1/IMG/n48w094.zip)
[Link 6](ftp://rockyftp.cr.usgs.gov/vdelivery/Datasets/Staged/NED/1/IMG/n48w095.zip)

# Prepping the DEM with GDAL
Make sure you have GDAL installed (a quick ```pip install gdal``` worked just fine for me), and let's get going.


# 1. Create a combined virtual dataset.
This step is particularly useful if you've got several DEM files you need combined, like Mr. Sandvik had in his post. Combine all your demfiles. I left mine within their unzipped folders, hence the paths. Organize as you wish.

Command:
```gdalbuildvrt ne_minnesota.vrt n47w093/imgn47w093_1.img n47w094/imgn47w094_1.img n47w095/imgn47w095_1.img n48w093/imgn48w093_1.img n48w094/imgn48w094_1.img n48w095/imgn48w095_1.img```

Pseudocommand:
```gdalbuildvrt <path to VRT file> <path to DEM file>```

# 2. Get some info, convert to GeoTIFF:

You've got your dataset, now you want it to be a GeoTIFF. A GeoTIFF is a big file that typically has a ton of information in it about elevation, topography, etc. On a GeoTIFF, the brighter the pixel, the higher the elevation. This is useful for many reasons.

You'll use the [gdalwarp command](http://www.gdal.org/gdalwarp.html) to convert it, but there's some information you need before you can really use it.

So, use another command on your tahoe.vrt file to get some stats. The "-mm" portion is necessary because it shows the maximum and minimum elevation of your dataset.

```gdalinfo -mm ne_minnesota.vrt```

You're going to see something like this:

```
Driver: VRT/Virtual Raster
Size is 10812, 7212
Coordinate System is:
GEOGCS["GCS_North_American_1983",
    DATUM["North_American_Datum_1983",
        SPHEROID["GRS_1980",6378137.0,298.257222101]],
    PRIMEM["Greenwich",0.0],
    UNIT["Degree",0.017453292519943295],
    VERTCS["Unknown VCS",
        VDATUM["Unknown"],
        PARAMETER["Vertical_Shift",0.0],
        PARAMETER["Direction",1.0],
        UNIT["Meter",1.0]]]
Origin = (-95.001666666670019,48.001666666664150)
Pixel Size = (0.000277777777778,-0.000277777777778)
Corner Coordinates:
Upper Left  ( -95.0016667,  48.0016667) ( 95d 0' 6.00"W, 48d 0' 6.00"N)
Lower Left  ( -95.0016667,  45.9983333) ( 95d 0' 6.00"W, 45d59'54.00"N)
Upper Right ( -91.9983333,  48.0016667) ( 91d59'54.00"W, 48d 0' 6.00"N)
Lower Right ( -91.9983333,  45.9983333) ( 91d59'54.00"W, 45d59'54.00"N)
Center      ( -93.5000000,  47.0000000) ( 93d30' 0.00"W, 47d 0' 0.00"N)
Band 1 Block=128x128 Type=Float32, ColorInterp=Undefined
  Min=181.536 Max=594.238   Computed Min/Max=181.536,594.238
  NoData Value=-3.40282346638528898e+38

```

There's loads of information here, but the numbers you really need are contained in the "Corner Coordinates" section. Looking at them, build this command:

```gdalwarp -te -95.0016667 45.9983333 -91.9983333 48.0016667 ne_minnesota.vrt ne_minnesota.tif```

```gdalwarp -te {x-min} {y-min} {x-max} {y-max} <path to .vrt> <path to .tif>```

You've got the tif now, and if you run ```gdalinfo -mm``` on it, you'll see a bunch of interesting facts.

3. Translate the TIF file to a PNG heightmap

We're going to use [gdal_translate](http://www.gdal.org/gdal_translate.html) for this. I'm picking 200x200 as the width and height of the PNG image, following Sandvik's example. I could probably pick a better one, but I'm going to keep it simple.

Command:
```gdal_translate -scale 181.536 594.238 0 255 -outsize 200 200 -of PNG ne_minnesota.tif ne_minnesota.png```

Pseudocommand:
```gdal_translate -scale {elevation-minimum} {elevation-maximum} {lowest number of colors, by default 0} {255 colors} -outsize {width of png} {height of png} -of PNG tahoe.tif tahoe.png```

4. Take that PNG and convert it to some 16-bit unsigned integers
Mr. Sandvik does a better job explaining this than I can, so I'm just going to share my command here:

```gdal_translate -scale 181.536 594.238 0 65535 -ot UInt16 -outsize 200 200 -of ENVI ne_minnesota.tif ne_minnesota.bin```

Pseudo:
```gdal_translate -scale {min elevation} {max elevation} {0} {number of unsigned integers} -ot UInt16 -outsize {width of the png} {height of the png} -of ENVI tahoe.tif tahoe.bin```

You're ready to start wireframing!

## Getting wired up

Check out [Bjorn Sandvik's post](http://blog.thematicmapping.org/2013/10/terrain-building-with-threejs.html) for more resources.

I'm going to gloss over setting up the Javascript for this (Bjorn and the LA Times folks do an excellent job, and all of the values except for the Plane Geometry translate really well) but this is a good time to get a little satisfaction. If you want to do some cutting and pasting, put the following code between the script tags in tutorial.html:

```
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
            color: "#000000", 
            wireframe: true
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
```

Fire up a little python webserver with ```python -m SimpleHTTPServer``` and navigate to localhost:8000/wireframe.html to see your frame in action.

# Manipulating the terrain

You can add some shading effects using either QGIS or the gdaldem commands:

```gdaldem hillshade ne_minnesota.tif ne_minnesota_hillshade.tif```

I also added some land cover effects, like lakes and some mining pits, by using QGIS, finding the relevant shapefiles, and creating a composite PNG image on the hillshaded map.

# Draping the terrain

Once you have your final texture ready to go, swap out the material:
```
var material = new THREE.MeshPhongMaterial({
    map: THREE.ImageUtils.loadTexture('dem/final2.png')
});
```

My results were not as good as I had hoped, but after futzing for quite a while, I decided I needed to move on to other projects. This was a nice little crash course in GDAL, terrain mapping and some of the data that is available out there.