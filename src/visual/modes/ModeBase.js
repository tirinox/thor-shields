import {TitleLabel3D} from "@/visual/TitleLabel3D";

export class ModeBase {
    constructor(scene) {
        this.scene = scene
        this.labels = []
        this.active = false
    }

    handleObject(physObj) {
        +physObj // do nothing
    }

    makeLabel(text, position, scale = 20, rotation = -45.0, bb = false) {
        if (!text) {
            return
        }

        const titleLabel = new TitleLabel3D(text, scale, rotation, bb)
        titleLabel.position.copy(position)
        this.scene.add(titleLabel)
        this.labels.push(titleLabel)
        return titleLabel
    }

    onEnter() {
    }

    _triggerOnEnter(a, b) {
        this.onEnter(a, b)

        this.active = true
        this.labels.forEach(label => label.animateIn())
    }

    onLeave() {
    }

    _triggerOnLeave(a, b) {
        this.onLeave(a, b)

        this.active = false
        this.labels.forEach(label => label.animateOut(true))
        this.labels = []
    }

    update(dt) {
        +dt
    }
}