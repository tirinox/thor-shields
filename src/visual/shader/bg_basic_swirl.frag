varying vec2 vUv;

#define PI 3.14159


vec4 checkboard(vec2 uv) {
    // makes a square
    float horz = floor(uv.x * 10.0);
    float vert = floor(uv.y * 10.0);
    float total = (horz + vert);

    if (mod(total, 2.0) == 0.0) {
        return vec4(1.0, 1.0, 1.0, 1.0);
    } else {
        return vec4(0.0, 0.0, 0.0, 1.0);
    }
}

void main() {
    float effectRadius = .2;
    float effectAngle = 2.0;

    // Ref: vec2 uv = fragCoord.xy / iResolution.xy - center;
    // vUv = 0..1
    vec2 uv = vUv * vec2(2.0, 1.0);
    vec2 center = vec2(1.0, .5);

    uv = uv - center;
    float len = length(uv);
    float angle = atan(uv.y, uv.x) + effectAngle * smoothstep(effectRadius, 0., len);
    float radius = length(uv);

    uv = vec2(radius * cos(angle), radius * sin(angle)) + center;

    gl_FragColor = checkboard(uv);
}
