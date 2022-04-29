uniform float time;

varying vec2 vUv;

const float r = 0.42;

void main(void) {
    vec2 position = vUv - vec2(0.5, 0.5);
    float d = r - length(position);

    float color = d < 0.0 ? 0.0 : (1.0 - d * 2.0);

    gl_FragColor = vec4(
        vec3(
            0.0,
            pow(cos(time / 3.0), 2.0) * 0.5 + 0.5,
            pow(sin(time / 3.0), 2.0) * 0.5 + 0.5
        ), color);
}
