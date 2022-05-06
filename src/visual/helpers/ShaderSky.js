import * as THREE from "three";

export class ShaderSky extends THREE.Mesh {
    constructor(size) {
        const shader = ShaderSky.SkyShader;

        const material = new THREE.ShaderMaterial({
            name: 'SkyShader',
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: THREE.UniformsUtils.clone(shader.uniforms),
            side: THREE.BackSide,
            depthWrite: false
        });

        super(new THREE.BoxGeometry(size, size, size), material);
    }
}

ShaderSky.prototype.isSky = true;

ShaderSky.SkyShader = {
    uniforms: {
        'turbidity': {value: 2},
        'rayleigh': {value: 1},
        'mieCoefficient': {value: 0.005},
        'mieDirectionalG': {value: 0.8},
        'sunPosition': {value: new THREE.Vector3()},
        'up': {value: new THREE.Vector3(0, 1, 0)}
    },

    vertexShader: /* glsl */`
		uniform vec3 up;

		varying vec3 vWorldPosition;

		void main() {
			vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
			vWorldPosition = worldPosition.xyz;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			gl_Position.z = gl_Position.w; // set z to camera.far
		}`,

    fragmentShader: /* glsl */`
		varying vec3 vWorldPosition;
	
		uniform vec3 up;
		const vec3 cameraPos = vec3( 0.0, 0.0, 0.0 );

		void main() {
			vec3 direction = normalize( vWorldPosition - cameraPos );
			float zenithAngle = acos( max( 0.0, dot( up, direction ) ) );

			gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );

			#include <tonemapping_fragment>
			#include <encodings_fragment>
		}`
};
