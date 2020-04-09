var view;
var ctx;
var scene;
var start_time;

var w;
var h;

// Initialization function - called when web page loads
function Init() {
    w = 800;
    h = 600;
    view = document.getElementById('view');
    view.width = w;
    view.height = h;

    ctx = view.getContext('2d');

    // initial scene... feel free to change this
    scene = {
        view: {
            type: 'parallel',
            prp: Vector3(44, 20, -16),
            srp: Vector3(20, 20, -40),
            vup: Vector3(0, 1, 0),
            clip: [-19, 5, -10, 8, 12, 100]
        },
        models: [
            {
                type: 'generic',
                vertices: [
                    Vector4( 0,  0, -30, 1),
                    Vector4(20,  0, -30, 1),
                    Vector4(20, 12, -30, 1),
                    Vector4(10, 20, -30, 1),
                    Vector4( 0, 12, -30, 1),
                    Vector4( 0,  0, -60, 1),
                    Vector4(20,  0, -60, 1),
                    Vector4(20, 12, -60, 1),
                    Vector4(10, 20, -60, 1),
                    Vector4( 0, 12, -60, 1)
                ],
                edges: [
                    [0, 1, 2, 3, 4, 0],
                    [5, 6, 7, 8, 9, 5],
                    [0, 5],
                    [1, 6],
                    [2, 7],
                    [3, 8],
                    [4, 9]
                ],
                matrix: new Matrix(4, 4)
            }
        ]
    };

    // event handler for pressing arrow keys
    document.addEventListener('keydown', OnKeyDown, false);
    
    // start animation loop
    start_time = Date.now(); // current timestamp in milliseconds
    window.requestAnimationFrame(Animate);
}

// Animation loop - repeatedly calls rendering code
function Animate() {
    // step 1: calculate time (time since start) 
    // step 2: transform models based on time
    // step 3: draw scene
    // step 4: request next animation frame (recursively calling same function)


    var time = Date.now() - start_time;

    // ... step 2

    DrawScene();

    window.requestAnimationFrame(Animate);
}

// Main drawing code - use information contained in variable `scene`
function DrawScene() {
    ctx.clearRect(0, 0, w, h);

    let mtx = new Matrix(4, 4);
    Mat4x4Projection(mtx, scene.view.prp, scene.view.srp, scene.view.vup, scene.view.clip);

    let v = new Matrix(4, 4);
    let mper = new Matrix(4, 4);
    let mpar = new Matrix(4, 4);

    v.values = [
        [w/2,   0,   0, w/2],
        [  0, h/2,   0, h/2],
        [  0,   0,   1,   0],
        [  0,   0,   0,   1]
    ]
    mper.values = [
        [1, 0,  0, 0],
        [0, 1,  0, 0],
        [0, 0,  1, 0],
        [0, 0, -1, 0]
    ]
    mpar.values = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, scene.view.clip[4]],
        [0, 0, 0, 1]
    ]

    scene.models.forEach(model => {
        if (model.type === "generic") {
            let computed_vertices = [];

            model.vertices.forEach(vertex => {
                let computed_vertex = null;

                if (scene.view.type === "parallel") {
                    computed_vertex = Matrix.multiply([mpar, v, mtx, vertex]).data
                } else {
                    computed_vertex = Matrix.multiply([mper, v, mtx, vertex]).data
                }
                computed_vertices.push({
                    x: computed_vertex[0][0],
                    y: computed_vertex[1][0]
                });
            });
            
            model.edges.forEach(edge_group => {
                for (let i = 0; i < edge_group.length - 1; i++) {
                    DrawLine(computed_vertices[edge_group[i]].x, computed_vertices[edge_group[i]].y, computed_vertices[edge_group[i+1]].x, computed_vertices[edge_group[i+1]].y);
                }
            });
        }
    });
    

    scene.models
}

// Called when user selects a new scene JSON file
function LoadNewScene() {
    var scene_file = document.getElementById('scene_file');

    console.log(scene_file.files[0]);

    var reader = new FileReader();
    reader.onload = (event) => {
        scene = JSON.parse(event.target.result);
        scene.view.prp = Vector3(scene.view.prp[0], scene.view.prp[1], scene.view.prp[2]);
        scene.view.srp = Vector3(scene.view.srp[0], scene.view.srp[1], scene.view.srp[2]);
        scene.view.vup = Vector3(scene.view.vup[0], scene.view.vup[1], scene.view.vup[2]);

        for (let i = 0; i < scene.models.length; i++) {
            if (scene.models[i].type === 'generic') {
                for (let j = 0; j < scene.models[i].vertices.length; j++) {
                    scene.models[i].vertices[j] = Vector4(scene.models[i].vertices[j][0],
                                                          scene.models[i].vertices[j][1],
                                                          scene.models[i].vertices[j][2],
                                                          1);
                }
            }
            else {
                scene.models[i].center = Vector4(scene.models[i].center[0],
                                                 scene.models[i].center[1],
                                                 scene.models[i].center[2],
                                                 1);
            }
            scene.models[i].matrix = new Matrix(4, 4);
        }
    };
    reader.readAsText(scene_file.files[0], "UTF-8");
}

// Called when user presses a key on the keyboard down 
function OnKeyDown(event) {
    let v = 3;

    switch (event.keyCode) {
        case 37: // LEFT Arrow
            console.log("left");
            scene.view.prp = Vector3(scene.view.prp.x + v, scene.view.prp.y, scene.view.prp.z);
            scene.view.srp = Vector3(scene.view.srp.x + v, scene.view.srp.y, scene.view.srp.z);
            break;
        case 38: // UP Arrow
            console.log("up");
            scene.view.prp = Vector3(scene.view.prp.x, scene.view.prp.y - v, scene.view.prp.z);
            scene.view.srp = Vector3(scene.view.srp.x, scene.view.srp.y - v, scene.view.srp.z);
            break;
        case 39: // RIGHT Arrow
            console.log("right");
            scene.view.prp = Vector3(scene.view.prp.x - v, scene.view.prp.y, scene.view.prp.z);
            scene.view.srp = Vector3(scene.view.srp.x - v, scene.view.srp.y, scene.view.srp.z);
            break;
        case 40: // DOWN Arrow
            console.log("down");
            scene.view.prp = Vector3(scene.view.prp.x, scene.view.prp.y + v, scene.view.prp.z);
            scene.view.srp = Vector3(scene.view.srp.x, scene.view.srp.y + v, scene.view.srp.z);
            break;
        case 65: //A key
            console.log("a")
            scene.view.prp = Vector3(scene.view.prp.x - v, scene.view.prp.y, scene.view.prp.z);
            break;
        case 68: //D key
            console.log("d")
            scene.view.prp = Vector3(scene.view.prp.x + v, scene.view.prp.y, scene.view.prp.z);
            break;

    }
}

// Draw black 2D line with red endpoints 
function DrawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
    ctx.fillRect(x2 - 2, y2 - 2, 4, 4);
}
