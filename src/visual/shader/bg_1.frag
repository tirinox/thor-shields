varying vec2 vUv;
uniform float time;

float hash(float x) {
    return fract(21654.6512 * sin(385.51 * x));
}

float hash(vec2 p) {
    return fract(21654.65155 * sin(35.51 * p.x + 45.51 * p.y));
}

float lhash(float x, float y) {
    float h = 0.0;

    for (int i = 0; i < 5; i++) {
        h += (fract(21654.65155 * float(i) * sin(35.51 * x + 45.51 * float(i) * y * (5.0 / float(i)))) * 2.0 - 1.0) / 10.0;
    }
    return h / 5.0 + 0.02;
    return (fract(21654.65155 * sin(35.51 * x + 45.51 * y)) * 2.0 - 1.0) / 20.0;
}

float noise(vec2 p) {
    vec2 fl = floor(p);
    vec2 fr = fract(p);

    fr.x = smoothstep(0.0, 1.0, fr.x);
    fr.y = smoothstep(0.0, 1.0, fr.y);

    float a = mix(hash(fl + vec2(0.0, 0.0)), hash(fl + vec2(1.0, 0.0)), fr.x);
    float b = mix(hash(fl + vec2(0.0, 1.0)), hash(fl + vec2(1.0, 1.0)), fr.x);

    return mix(a, b, fr.y);
}

//Fractal Brownian Motion
float fbm(vec2 p) {
    float v = 0.0, f = 1.0, a = 0.5;
    for (int i = 0; i < 6; i++) {
        v += noise(p * f) * a;
        f *= 2.0;
        a *= 0.5;
    }
    return v;
}

//Fun start here
void main() {
    //change the animation speed

    vec2 uv = vUv;
    uv = uv * 3.0 - 51.0;

    float p = fbm(vec2(noise(uv + time / 2.5), noise(uv * 2. + cos(time / 2.) / 2.)));
    //uncomment for more plasma/lighting/plastic effect..
//    p = (1. - abs(p * 2.0 - 1.0))*.8;

    vec3 col = pow(vec3(p), vec3(0.3)) - 0.4;
    col = mix(col, vec3(1.0), 1.0 - smoothstep(0.0, 0.2, pow(1.0 / 2.0, 0.5) - uv.y / 40.0));
    float s = smoothstep(.35, .6, col.x);
    float s2 = smoothstep(.47, .6, col.x);
    float s3 = smoothstep(.51, .6, col.x);
    //multiply by the inverse to get the "smoky" effect, first attempt
    col *= vec3(0.1, .1, 1.9) * s;
    col += vec3(0.1, 1.3, .1) * s2;
    col += vec3(0.1, 1.4, .1) * s3;
    //made it more bright
    col *= 0.2;
    gl_FragColor = vec4(col, 1.0);
    gl_FragColor.rgb += 0.05;
}