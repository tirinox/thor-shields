import * as THREE from "three";
import {NodeGroup} from "@/visual/NodeGroup";
import {NodeTracker} from "@/helpers/NodeTracker";
import {NodeEvent} from "@/helpers/NodeEvent";
import {URLDataSource} from "@/helpers/data/URLDataSource";
import {Config} from "@/config";
import {clearObject} from "@/helpers/3D";
import {emitter, EventTypes} from "@/helpers/EventTypes";
import {NodeSet} from "@/helpers/data/NodeSet";

import {MeshLine, MeshLineMaterial} from 'three.meshline';

export class MainScene {
    constructor(scene, vueComp) {
        this.scene = scene
        this.vueComp = vueComp
        this.prevNodes = new NodeSet([])
        this.nodes = new NodeSet([])

        this._makeSomeLight()
        this.nodeGroup = new NodeGroup(this.scene)

        this._firstTime = true
        this._runDataSource()

        this._fullyLoaded = false

        // this._debugSection()
    }

    _runDataSource() {
        this.dataSource = new URLDataSource(Config.DataSource.NodesURL, Config.DataSource.PollPeriod)
        this.dataSource.callback = this.handleData.bind(this)
        this.dataSource.run()
    }

    _makeSomeLight() {
        // const light = new THREE.DirectionalLight('hsl(0, 100%, 100%)')
        // light.position.set(0, 10, 1000)
        // this.scene.add(light)

        const ambientLight = new THREE.AmbientLight(0xffffff); // soft white light
        this.scene.add(ambientLight);
    }

    // async _loadAdditionalInfoAbout(node) {
    //     const ipAddress = node.IPAddress
    //     if (ipAddress) {
    //         node.IPInfo = await this.ipAddressLoader.load(ipAddress)
    //     }
    //
    //     // debug
    //     if(node.IPInfo) {
    //         console.info(`got IPInfo for ${ipAddress} node = ${node.address} => ${node.IPInfo.countryCode}`)
    //     } else {
    //         console.warn(`no IPInfo for ${ipAddress} node = ${node.address}`)
    //     }
    // }

    handleData(nodes) {
        if (!nodes) {
            console.error('No nodes to handle!')
            return
        }

        if(!this._fullyLoaded) {
            this._fullyLoaded = true
            emitter.emit(EventTypes.FullyLoaded)
        }

        emitter.emit(EventTypes.DataSourceTick, nodes)

        // Random.removeRandomItem(nodes)

        this.prevNodes = this.nodes
        this.nodes = nodes
        const tracker = new NodeTracker(this.prevNodes, this.nodes)
        const events = tracker.extractEvents()

        console.info(`Handle Data tick! Total: ${events.length} events.`)

        for (const event of events) {
            const node = event.node
            if (node.address) {
                if (event.type === NodeEvent.EVENT_TYPE.CREATE) {
                    this.nodeGroup.createNewNode(node)
                } else if (event.type === NodeEvent.EVENT_TYPE.DESTROY) {
                    this.nodeGroup.destroyNode(node)
                } else {
                    this.nodeGroup.reactEvent(event)
                }
            }
        }

        if (this._firstTime) {
            for (let i = 0; i < Config.Physics.Startup.SimulationSteps; ++i) {
                this.nodeGroup.update(Config.Physics.Startup.DeltaTime)
            }
            this._firstTime = false
        }

        if (events.length && this.vueComp) {
            this.vueComp.pokeActivity()
        }
    }

    update(delta) {
        this.nodeGroup.update(delta)
    }

    dispose() {
        this.dataSource.stop()
        this.nodeGroup.dispose()
        clearObject(this.scene)
    }

    findNodeByAddress(address) {
        return this.nodes.byAddress[address]
    }

    pick(name) {
        const node = this.findNodeByAddress(name)
        console.log(node)
    }

    _debugSection() {
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
        this.scene.add(mesh);
    }
}
