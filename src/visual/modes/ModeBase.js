import {TitleLabel3D} from "@/visual/TitleLabel3D";

export class ModeBase {
    constructor(scene) {
        this.scene = scene
        this.labels = []
    }

    handleObject(physObj) {
        +physObj // do nothing
    }

    makeLabel(text, position, scale = 20) {
        if (!text) {
            return
        }

        const titleLabel = new TitleLabel3D(text, scale)
        titleLabel.position.copy(position)
        this.scene.add(titleLabel)
        this.labels.push(titleLabel)
    }

    onEnter() {
        this.labels.forEach(label => label.animateIn())
    }

    onLeave() {
        this.labels.forEach(label => label.animateOut(true))
        this.labels = []
    }

    update(dt) {
        +dt
    }
}