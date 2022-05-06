varying vec2 vUv;

#define PI 3.14159

float swirlEffectRadius = .2;
float swirlEffectAngle = 2.0;

vec2 swirl(vec2 uv, vec2 center) {
    // Ref: vec2 uv = fragCoord.xy / iResolution.xy - center;
    // vUv = 0..1
    uv = uv - center;
    float len = length(uv);
    float angle = atan(uv.y, uv.x) + swirlEffectAngle * smoothstep(swirlEffectRadius, 0., len);
    float radius = length(uv);
    return vec2(radius * cos(angle), radius * sin(angle)) + center;
}


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
    vec2 uv = swirl(vUv, vec2(0.5, 0.5));
    gl_FragColor = checkboard(uv);
}
