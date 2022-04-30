uniform float time;
uniform float saturation;
uniform vec3 color;

varying vec2 vUv;

const float r = 0.42;

void main(void) {
    vec2 position = vUv - vec2(0.5, 0.5);
    float d = r - length(position);

    float opacity = d < 0.0 ? 0.0 : (1.0 - d * 2.0);
    gl_FragColor = vec4(color, opacity);
}
