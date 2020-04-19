// fragment shader: pixel colors
uniform float simulationTime;

// passed in from vertex shader:
varying float myInfectionStatus;
varying float skip;
varying float atRest;

vec4 getColor() {

    if (myInfectionStatus == 0.0) {
        return vec4(1.0, 1.0, 0.2, 0.5);  // susceptible; not moving
        /*
        if (atRest == 1.0) {
            return vec4(0.1, 0.0, 0.1, 0.25);  // susceptible; not moving
        } else {
            return vec4(0.1, 0.0, 0.1, 0.25);  // susceptible; not moving
            // return vec4(1.0, 1.0, 0.0, 1.0);  // susceptible; yellow
        }
        */
    } else if (myInfectionStatus == 1.0) {

        return vec4(0.25, 1.0, 1.0, 1.0);  // infected; cyan

    } else if (myInfectionStatus == 2.0) {

        return vec4(0.8, 0.0, 0.1, 1.0);  // contagious; red

    }

    return vec4(1.0, 0.4, 1.0, 1.0);  // ERROR: grey.
}


void main() {
    // don't do anything if this trip is currently out of time bounds
    if (skip == 1.0) {

        gl_FragColor = vec4(0,0,0,0);

    } else {

        gl_FragColor = getColor();

    }
}

/******
uniform vec3 color;
uniform vec3 selectedColor;
uniform float timestepFraction;

uniform sampler2D triangle;
uniform sampler2D circle;

varying float vRotation;
varying float vShouldInterpolate;
varying float vIsSelected;

vec2 rotateCoordinates() {
    mat2 rotationMatrix = mat2(cos(vRotation), sin(vRotation), -sin(vRotation), cos(vRotation));

    vec2 centerBasedCoord = vec2(gl_PointCoord.x -0.5, gl_PointCoord.y - 0.5);
    vec2 centerBasedRotatedCoord = centerBasedCoord * rotationMatrix;
    return centerBasedRotatedCoord + 0.5;
}

vec4 getColor() {

    vec4 result;

    if (vIsSelected >= 1.0) {
        result = vec4(selectedColor, 1.0);
    }
    else {
        result = vec4(color, 1.0);
    }
    return result;
}

void main() {

    vec4 opaqueColor = getColor();

    if (vShouldInterpolate >= 1.0) {
        vec2 coord = rotateCoordinates();
        gl_FragColor = opaqueColor * texture2D(triangle, coord);
    } else {
        opaqueColor.a = 1.0 - timestepFraction;
        gl_FragColor = opaqueColor * texture2D(circle, gl_PointCoord);
    }

    if ( gl_FragColor.a < ALPHATEST ) discard;
}
******/
