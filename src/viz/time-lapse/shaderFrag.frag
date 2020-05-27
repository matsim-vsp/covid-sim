// fragment shader: pixel colors

uniform float simulationTime;
uniform vec3 cSusceptible;
uniform vec3 cInfectedButNotContagious;
uniform vec3 cContagious;
uniform vec3 cSymptomatic;
uniform vec3 cSeriouslyIll;
uniform vec3 cCritical;
uniform vec3 cRecovered;

// passed in from vertex shader:
varying float myInfectionStatus;
varying float skip;

vec4 getColor() {

    if (myInfectionStatus == 0.0) {
        return vec4(cSusceptible, 1.0);  // susceptible; not moving

    } else if (myInfectionStatus == 1.0) {

        return vec4(cInfectedButNotContagious, 1.0);  // infected; cyan

    } else if (myInfectionStatus == 2.0) {

        return vec4(cContagious, 1.0);  // contagious; red

    } else if (myInfectionStatus == 3.0) {

        return vec4(cSymptomatic, 1.0);

    } else if (myInfectionStatus == 4.0) {

        return vec4(cSeriouslyIll, 1.0);

    } else if (myInfectionStatus == 5.0) {

        return vec4(cCritical, 1.0);
    }
    return vec4(cRecovered, 1.0);
}


void main() {
    // don't do anything if this trip is currently out of time bounds
    if (skip == 1.0) {

        gl_FragColor = vec4(0,0,0,0);

    } else {

        gl_FragColor = getColor();

    }
}
