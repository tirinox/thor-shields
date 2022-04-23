export class ModeBase {
    constructor(scene) {
        this.scene = scene
    }

    handleObject(physObj) {
        +physObj // do nothing
    }

    update(dt) {
        +dt
    }
}