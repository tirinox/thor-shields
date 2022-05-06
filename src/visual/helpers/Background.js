
import BgShader from '@/visual/shader/bg_1.frag'
// import BgShader from '@/visual/shader/bg_basic_swirl.frag'
import ScreenQuad from "@/visual/helpers/ScreenQuad";

export class Background {
    constructor(scene) {
        this.scene = scene
        this.quad = new ScreenQuad({
            fragmentShader: BgShader
        });
    }

    install() {
        this.scene.add(this.quad)
    }

    update(dt) {
        this.quad.update(dt)
    }

    setSize(w, h) {
        if(this.quad) {
            this.quad.setScreenSize(w, h)
        }
    }
}