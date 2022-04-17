export function countObjects(parent) {
    let numOfMeshes = 0;
    parent.traverse(function () {
        numOfMeshes++;
    });
    return numOfMeshes
}
