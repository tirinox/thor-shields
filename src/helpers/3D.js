export function countObjects(parent) {
    let numOfMeshes = 0;
    parent.traverse(function () {
        numOfMeshes++;
    });
    return numOfMeshes
}

export function clearObject(obj) {
    if(obj) {
        obj.remove.apply(obj, obj.children);
    }
}
