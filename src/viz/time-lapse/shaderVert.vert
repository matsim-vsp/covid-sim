// vertex shader: agent positions

uniform float simulationTime;
uniform float showSusceptible;

attribute float s1;
attribute float s2;
attribute float s3;
attribute float s4;
attribute float s5;
attribute float s6;

varying float skip;
varying float myInfectionStatus;

float calculateStatus() {

    // are we before the first infection state?
    if (s1 == 0.0) return 0.0;
    if (simulationTime < s1) return 0.0;
    if (simulationTime < s2) return 1.0;
    if (simulationTime < s3) return 2.0;
    if (simulationTime < s4) return 3.0;
    if (simulationTime < s5) return 4.0;
    if (simulationTime < s6) return 5.0;
    return 6.0;
}

float calculateSize() {

    float small = 2.0;
    float med = 4.0;
    float big = 7.0;

    if (myInfectionStatus == 0.0) return small;
    else if (myInfectionStatus == 1.0) return big;
    else if (myInfectionStatus < 6.0) return med;
    return med;
}

void main() {

    myInfectionStatus = calculateStatus();

    // figure out z-index based on infection status
    float zIndex = 0.2;
    if (myInfectionStatus == 0.0) zIndex = 0.1;
    else if (myInfectionStatus == 1.0) zIndex = 0.3;
    else if (myInfectionStatus == 2.0) zIndex = 0.4;

    // unpack coords from position buffers - x,y,time. Deal w/ z later
    vec3 point1 = vec3(position.xy, zIndex);

    gl_PointSize = calculateSize();
    gl_Position = projectionMatrix * modelViewMatrix * vec4(point1, 1.0);

    skip = 0.0;
}
