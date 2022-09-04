import * as THREE from "three";
import {MeshLine, MeshLineMaterial} from "three.meshline";

export class MeshLineExample {
    do(scene) {
        const points = [];
        const r = 600.0
        for (let t = 0.0; t < 100.0; t += 0.1) {
            points.push(
                new THREE.Vector3(
                    Math.cos(t * 0.33) * r,
                    Math.sin(t * 0.6211) * r,
                    Math.sin(t * 0.1143) * r)
            );
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new MeshLine();
        line.setGeometry(geometry);

        const material = new MeshLineMaterial({
            color: 0x11ff88,
            lineWidth: 10.0,
            sizeAttenuation: true,
        });

        const mesh = new THREE.Mesh(line, material);
        scene.add(mesh);
    }
}