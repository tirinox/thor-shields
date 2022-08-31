//uniform float time;
//uniform float saturation;
//uniform vec3 color;

varying vec2 vUv;
varying vec3 vNormal;

const vec3 ATMO_COLOR = vec3(0.3, 0.6, 1.0);
const vec3 FORWARD = vec3(0.0, 0.0, 1.0);

void main(void) {
    float intensity = 1.05 - dot(vNormal, FORWARD);
    vec3 atmo = ATMO_COLOR * pow(intensity, 1.5);
    gl_FragColor = vec4(atmo, 1.0);
}
