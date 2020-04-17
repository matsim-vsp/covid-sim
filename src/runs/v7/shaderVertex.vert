uniform float simulationTime;

attribute vec3 position2;
attribute float time1;
attribute float time2;

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

    // then we must be at the end!
    return infectionStatus.z;
}


float calculateSize() {

    if (myInfectionStatus != 0.0 && myInfectionStatus != 1.0 && myInfectionStatus != 2.0) {
        return 100.0;
    }

    return (myInfectionStatus + 1.0) * 5.0 - 3.0;
}


float calculateTimestep() {

    if (position == position2) return 0.0;

    if (simulationTime < time1) return 0.0;
    if (simulationTime > time2) return 1.0;

    float progress = simulationTime - time1;
    float duration = time2 - time1;

    return progress / duration;
}


vec3 interpolate(in float timestepFraction) {

    if (timestepFraction == 0.0) {

        return position;

    } else if (timestepFraction >= 1.0 ) {

        return position2;

    } else {

        vec3 direction = (position2 - position);
        return (direction * timestepFraction) + position;

    }
}


void main() {

    float timestepFraction = calculateTimestep();

    vec3 newPosition = interpolate(timestepFraction);

    myInfectionStatus = calculateStatus();

    gl_PointSize = calculateSize();

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}


/******
attribute vec3 nextPosition;
attribute float shouldInterpolate;
attribute float id;

uniform float timestepFraction;
uniform float size;
uniform float hitTestThreshold;
uniform float selectedId;

varying float vRotation;
varying float vShouldInterpolate;
varying float vIsSelected;
varying float vIsHover;

vec3 interpolate(in vec3 pos1, in vec3 pos2, in float timestepFraction, in float shouldInterpolate) {

    if(shouldInterpolate >= 0.0) {
        vec3 direction = (pos2 - pos1);
        vRotation = atan(direction.x, direction.y);
        return (direction * timestepFraction) + pos1;
    }
    else {
        vRotation = 0.0;
        return pos1;
    }
}

float isIdSelected() {

    float result = 0.0;

    if(selectedId == id) {
        result = 1.0;
    }
    return result;
}

float getSize() {
    float result = 0.0;

    if (vIsSelected >= 1.0) {
        result = size * 3.0;
    } else if (shouldInterpolate < 1.0) {
        result = size * 0.7;
    } else {
        result = size;
    }
    return result;
}

void main() {

    vIsSelected = isIdSelected();

    gl_PointSize = getSize();

    vShouldInterpolate = shouldInterpolate;
    vec3 interpolated = interpolate(position, nextPosition, timestepFraction, shouldInterpolate);

    if (vIsSelected >= 1.0) {
        interpolated.z = 1.0;
    }
    gl_Position = projectionMatrix * modelViewMatrix * vec4(interpolated, 1.0);
}
**/
