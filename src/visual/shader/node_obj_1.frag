uniform float time;

varying vec2 vUv;

const float r = 0.42;

void main(void) {
    vec2 position = vUv - vec2(0.5, 0.5);
    float d = length(position) - r;

    float color = d < 0.05 && d > -0.05 ? 1.0 : 0.0;

    gl_FragColor = vec4(
        vec3(
            0.0,
            cos(time / 3.0) * 0.5 + 0.5,
            sin(time / 3.0) * 0.5 + 0.5
        ), color);
}
