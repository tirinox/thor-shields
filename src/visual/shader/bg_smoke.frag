/*
 * Copyright 2014 Roman Bobniev (FatumR)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

varying vec2 vUv;
uniform float time;

#define OCTAVES  8.0


float rand(vec2 co){
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float rand2(vec2 co){
    return fract(cos(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

// Rough Value noise implementation
float valueNoiseSimple(vec2 vl) {
    float minStep = 1.0;

    vec2 grid = floor(vl);
    vec2 gridPnt1 = grid;
    vec2 gridPnt2 = vec2(grid.x, grid.y + minStep);
    vec2 gridPnt3 = vec2(grid.x + minStep, grid.y);
    vec2 gridPnt4 = vec2(gridPnt3.x, gridPnt2.y);

    float s = rand2(grid);
    float t = rand2(gridPnt3);
    float u = rand2(gridPnt2);
    float v = rand2(gridPnt4);

    float x1 = smoothstep(0., 1., fract(vl.x));
    float interpX1 = mix(s, t, x1);
    float interpX2 = mix(u, v, x1);

    float y = smoothstep(0., 1., fract(vl.y));
    float interpY = mix(interpX1, interpX2, y);

    return interpY;
}


float fractalNoise(vec2 vl) {
    float persistance = 2.0;
    float amplitude = 0.5;
    float rez = 0.0;
    vec2 p = vl;

    for (float i = 0.0; i < OCTAVES; i++) {
        rez += amplitude * valueNoiseSimple(p);
        amplitude /= persistance;
        p *= persistance;
    }
    return rez;
}

float complexFBM(vec2 p) {
    float slow = time / 2.5;
    float fast = time / .5;
    vec2 offset1 = vec2(slow, 0.);// Main front
    vec2 offset2 = vec2(sin(fast)* 0.1, 0.);// sub fronts

    return
    fractalNoise(p + offset1 + fractalNoise(
    p + fractalNoise(
    p + 2. * fractalNoise(p - offset2)
    )
    )
    );
}

const vec3 blueColor = vec3(0.029411765, 0.207843137, 0.250392157);
const vec3 blackColor2 = vec3(0.00803922, 0.0203921569, 0.015686275);

void main() {
    vec2 uv = vUv;
    uv = uv * vec2(2.0, 0.5) - 1.0;

    vec3 rez = mix(blackColor2, blueColor, complexFBM(uv));
    gl_FragColor = vec4(rez, 1.0);
}