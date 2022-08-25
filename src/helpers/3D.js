import * as THREE from "three";

export function countObjects(parent) {
    let numOfMeshes = 0;
    parent.traverse(function () {
        numOfMeshes++;
    });
    return numOfMeshes
}

export function clearObject(obj) {
    if (obj) {
        obj.remove.apply(obj, obj.children);
    }
}

export function longLatTo3D(long, lat, r = 1) {
    // const phi = (lat + 180.0) * PI180
    // const theta = (long + 180.0) / PI180
    // const x = -r * Math.cos(phi) * Math.cos(theta)
    // const y = r * Math.cos(phi) * Math.sin(theta)
    // const z = r * Math.sin(phi)

    const phi = Math.PI * (0.5 - (lat / 180));
    const theta = Math.PI * (0.5 + long / 180);
    const spherical = new THREE.Spherical(r, phi, theta);
    return new THREE.Vector3().setFromSpherical(spherical);
}

export function distanceXY(v1, v2) {
    const dx = v1.x - v2.x
    const dy = v1.y - v2.y
    return Math.sqrt(
        dx * dx + dy * dy
    )
}
