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

const PI180 = Math.PI / 180.0

export function longLatTo3D(long, lat, r = 1) {
    const phi = lat * PI180
    const theta = (long + 180.0) / PI180
    const x = -r * Math.cos(phi) * Math.cos(theta)
    const y = r * Math.cos(phi) * Math.sin(theta)
    const z = r * Math.sin(phi)
    return {
        x, y, z
    }
}

export function distanceXY(v1, v2) {
    const dx = v1.x - v2.x
    const dy = v1.y - v2.y
    return Math.sqrt(
        dx * dx + dy * dy
    )
}
