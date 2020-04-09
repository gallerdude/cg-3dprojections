// set values of mat4x4 to the parallel projection / view matrix
function Mat4x4Parallel(mat4x4, prp, srp, vup, clip) {
    // 1. translate PRP to origin
    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    // 3. shear such that CW is on the z-axis
    // 4. translate near clipping plane to origin
    // 5. scale such that view volume bounds are ([-1,1], [-1,1], [-1,0])

    // ...
    // var transform = Matrix.multiply([...]);
    // mat4x4.values = transform.values;
}

// set values of mat4x4 to the perspective projection / view matrix
function Mat4x4Projection(mat4x4, prp, srp, vup, clip) {
    // 1. translate PRP to origin
    let stepOne = new Matrix(4, 4);
    let stepTwo = new Matrix(4, 4);
    let stepThree = new Matrix(4, 4);
    let stepFour = new Matrix(4, 4);

    stepOne.values = [
        [1, 0, 0, -prp.x],
        [0, 1, 0, -prp.y],
        [0, 0, 1, -prp.z],
        [0, 0, 0,      1]
    ];
    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    let n = prp.subtract(srp);
    n.normalize();

    let u = vup.cross(n);
    u.normalize();

    let v = n.cross(u);

    stepTwo.values = [
        [u.x, u.y, u.z, 0],
        [v.x, v.y, v.z, 0],
        [n.x, n.y, n.z, 0],
        [  0,   0,   0, 1]    
    ]
    // 3. shear such that CW is on the z-axis
    let [left, right, bottom, top, near, far] = clip;

    let CW = Vector3((left+right)/2, (top+bottom)/2, -near);
    let DOP = CW.subtract(Vector3(0, 0, 0));
    //DOP IS VECTOR POINTING FROM CAMERA TOWARDS CENTER OF THE WINDOW, DEFINED USING VRC LEFT -U TOP +V NEAR -N

    let shx = (-DOP.x / DOP.z);
    let shy = (-DOP.y / DOP.z);

    stepThree.values = [
        [   1,   0, shx,  0],
        [   0,   1, shy,  0],
        [   0,   0,   1,  0],
        [   0,   0,   0,  1]
    ]

    // 4. scale such that view volume bounds are ([z,-z], [z,-z], [-1,zmin])
    
    let spx = (2 * near) / ((right - left) * far);
    let spy = (2 * near) / ((top - bottom) * far);
    let spz = 1 / (far - near)

    stepFour.values = [
        [spx,   0,   0,   0],
        [  0, spy,   0,   0],
        [  0,   0, spz,   0],
        [  0,   0,   0,   1]
    ]

    // ...
    // var transform = Matrix.multiply([...]);
    // mat4x4.values = transform.values;
    console.log(stepOne.values);
    console.log(stepTwo.values);
    console.log(stepThree.values);
    console.log(stepFour.values);

    var transform = Matrix.multiply([stepFour, stepThree, stepTwo, stepOne])
    mat4x4.values = transform.values;
    console.log("transform.values");
    console.log(transform.values);
}

// set values of mat4x4 to project a parallel image on the z=0 plane
function Mat4x4MPar(mat4x4) {
    mat4x4.values = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 1]
    ];
}

// set values of mat4x4 to project a perspective image on the z=-1 plane
function Mat4x4MPer(mat4x4) {
    // mat4x4.values = ...;
}



///////////////////////////////////////////////////////////////////////////////////
// 4x4 Transform Matrices                                                         //
///////////////////////////////////////////////////////////////////////////////////

// set values of mat4x4 to the identity matrix
function Mat4x4Identity(mat4x4) {
    mat4x4.values = [[1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]];
}

// set values of mat4x4 to the translate matrix
function Mat4x4Translate(mat4x4, tx, ty, tz) {
    mat4x4.values = [[1, 0, 0, tx],
                     [0, 1, 0, ty],
                     [0, 0, 1, tz],
                     [0, 0, 0, 1]];
}

// set values of mat4x4 to the scale matrix
function Mat4x4Scale(mat4x4, sx, sy, sz) {
    mat4x4.values = [[sx,  0,  0, 0],
                     [ 0, sy,  0, 0],
                     [ 0,  0, sz, 0],
                     [ 0,  0,  0, 1]];
}

// set values of mat4x4 to the rotate about x-axis matrix
function Mat4x4RotateX(mat4x4, theta) {
    mat4x4.values = [[1,               0,                0, 0],
                     [0, Math.cos(theta), -Math.sin(theta), 0],
                     [0, Math.sin(theta),  Math.cos(theta), 0],
                     [0,               0,                0, 1]];
}

// set values of mat4x4 to the rotate about y-axis matrix
function Mat4x4RotateY(mat4x4, theta) {
    mat4x4.values = [[ Math.cos(theta), 0, Math.sin(theta), 0],
                     [               0, 1,               0, 0],
                     [-Math.sin(theta), 0, Math.cos(theta), 0],
                     [0, 0, 0, 1]];
}

// set values of mat4x4 to the rotate about z-axis matrix
function Mat4x4RotateZ(mat4x4, theta) {
    mat4x4.values = [[Math.cos(theta), -Math.sin(theta), 0, 0],
                     [Math.sin(theta),  Math.cos(theta), 0, 0],
                     [              0,                0, 1, 0],
                     [              0,                0, 0, 1]];
}

// set values of mat4x4 to the shear parallel to the xy-plane matrix
function Mat4x4ShearXY(mat4x4, shx, shy) {
    mat4x4.values = [[1, 0, shx, 0],
                     [0, 1, shy, 0],
                     [0, 0,   1, 0],
                     [0, 0,   0, 1]];
}

// create a new 3-component vector with values x,y,z
function Vector3(x, y, z) {
    let vec3 = new Vector(3);
    vec3.values = [x, y, z];
    return vec3;
}

// create a new 4-component vector with values x,y,z,w
function Vector4(x, y, z, w) {
    let vec4 = new Vector(4);
    vec4.values = [x, y, z, w];
    return vec4;
}
