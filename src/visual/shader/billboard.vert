#ifdef USE_LOGDEPTHBUF
#ifdef USE_LOGDEPTHBUF_EXT
varying float vFragDepth;
varying float vIsPerspective;
#else
uniform float logDepthBufFC;
#endif
#endif

// optional: pass 2D rotation angle as an uniform
uniform float rotation;
// optional: pass 2D center point as an uniform
uniform vec2 center;

varying vec2 vUv;

// optional: use this define to scale the model according to distance from the camera
#define USE_SIZEATTENUATION

// [skipped includes]

void main() {
    vUv = uv;

    // discard rotation and scale
    vec4 mvPosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);

    // extract model's scale
    vec2 scale;
    scale.x = length(vec3(modelMatrix[0].x, modelMatrix[0].y, modelMatrix[0].z));
    scale.y = length(vec3(modelMatrix[1].x, modelMatrix[1].y, modelMatrix[1].z));

    // if not defined, keep model the same size regardless of distance from the camera
    #ifndef USE_SIZEATTENUATION
    bool isPerspective = isPerspectiveMatrix(projectionMatrix);
    if (isPerspective) scale *= - mvPosition.z;
    #endif

    // if center is not passed as uniform, create vec2 center = vec2(0.0);

    // aligned with the camera [and scaled]
    vec2 alignedPosition = (position.xy - center) * scale;

    // if rotation is not passed as uniform, skip the next block

    // rotate 2D
    vec2 rotatedPosition;
    rotatedPosition.x = cos(rotation) * alignedPosition.x - sin(rotation) * alignedPosition.y;
    rotatedPosition.y = sin(rotation) * alignedPosition.x + cos(rotation) * alignedPosition.y;

    // billboard
    mvPosition.xy += rotatedPosition;

    gl_Position = projectionMatrix * mvPosition;

    // [skipped includes]
    #ifdef USE_LOGDEPTHBUF
        #ifdef USE_LOGDEPTHBUF_EXT
    vFragDepth = 1.0 + gl_Position.w;
//    vIsPerspective = float(isPerspectiveMatrix(projectionMatrix));
    vIsPerspective = 1.0;
        #else
//    if (isPerspectiveMatrix(projectionMatrix)) {
        gl_Position.z = log2(max(EPSILON, gl_Position.w + 1.0)) * logDepthBufFC - 1.0;
        gl_Position.z *= gl_Position.w;
//    }
        #endif
    #endif
}