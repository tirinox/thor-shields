// import BgShader from '@/visual/shader/bg_1.frag'
import BgShader from '@/visual/shader/bg_smoke.frag'
// import BgShader from '@/visual/shader/bg_basic_swirl.frag'
import ScreenQuad from "@/visual/helpers/ScreenQuad";
import _ from "lodash";
import * as THREE from "three";

class BackgroundBase {
    constructor(scene) {
        this.scene = scene
    }

    install() {
    }

    // eslint-disable-next-line no-unused-vars
    update(dt) {
    }

    // eslint-disable-next-line no-unused-vars
    setSize(w, h) {
    }
}

export class Background extends BackgroundBase {
    constructor(scene) {
        super(scene);
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

export class BlackgroundStaticBox extends BackgroundBase {
    constructor(scene, baseUrl, ext='jpg') {
        super(scene);
        this.ext = ext
        this.baseUrl = baseUrl
    }

    install() {
        const ext = this.ext
        const urls = _.map([
            `right.${ext}`, `left.${ext}`,
            `top.${ext}`, `bottom.${ext}`,
            `front.${ext}`, `back.${ext}`
        ], (name) => `${this.baseUrl}/${name}`);

        this.scene.background = new THREE.CubeTextureLoader().load(urls)
    }
}
