uniform float simulationTime;

attribute vec3 position2;  // x,y,t

/**
 * First, second, third infection statuses are in .xyz each
 */
attribute vec3 infectionTime;
attribute vec3 infectionStatus;

// this gets passed from vertex to fragment shader
varying float myInfectionStatus;


float calculateStatus() {

    // is there only one infection state?
    if (infectionStatus.y == -1.0) return infectionStatus.x;

    // are we before the second infection state?
    if (simulationTime < infectionTime.y) return infectionStatus.x;

    // are there only two infection states?
    if (infectionTime.z == -1.0) return infectionStatus.y;

    // are we before the third infection state?
    if (simulationTime < infectionTime.z) return infectionStatus.y;

    // there can only be three infection states, and we are at the end
    return infectionStatus.z;
}


float calculateSize() {

    if (myInfectionStatus != 0.0 && myInfectionStatus != 1.0 && myInfectionStatus != 2.0) {
        return 100.0;
    }

    return (myInfectionStatus + 1.0) * 7.0 - 4.0;
}


float calculateTimestep(in vec3 point1, in vec3 point2) {

    if (point1 == point2) return 0.0;

    // position vars have time in the .z to save some space
    if (simulationTime < position.z) return 0.0;
    if (simulationTime > position2.z) return 1.0;

    float progress = simulationTime - position.z;
    float duration = position2.z - position.z;

    return progress / duration;
}


vec3 interpolate(in vec3 point1, in vec3 point2, in float timestepFraction) {

    if (timestepFraction == 0.0) {

        return point1;

    } else if (timestepFraction >= 1.0 ) {

        return point2;

    } else {

        vec3 direction = point2 - point1;

        return (direction * timestepFraction) + point1;
    }
}


void main() {

    myInfectionStatus = calculateStatus();

    // unpack coords from position buffers - x,y,time. Deal w/z later
    vec3 point1 = vec3(position.xy, 2);
    vec3 point2 = vec3(position2.xy, 2);

    float timestepFraction = calculateTimestep(point1, point2);

    vec3 newPosition = interpolate(point1, point2, timestepFraction);

    gl_PointSize = calculateSize();

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
