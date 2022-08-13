import _ from "lodash";
import RBush from "rbush";

export class Simulation {
    constructor() {
        this._objects = {}

        this.repelForce = 0.0
        this.rBush = new RBush()
    }

    getByName(name) {
        return this._objects[name]
    }

    addObject(name, physObj) {
        const existing = this.getByName(name)
        if (existing) {
            console.warn('PhysObj already exists. No nothing')
            return existing
        }

        this._objects[name] = physObj
    }

    removeObject(name) {
        const physObj = this.getByName(name)
        if (!physObj) {
            console.error('PhysObj not found!')
            return
        }

        physObj.dispose()
        delete this._objects[name]
    }

    _repelForceCalculation(obj) {
        let vicinity = this.rBush.search(obj.boundingBox)

        for (const rBushLeaf of vicinity) {
            if (rBushLeaf.o !== obj) {
                obj.repel(rBushLeaf.o, this.repelForce)
            }
        }
    }

    _updateObject(physObj, delta) {
        physObj.nullifyForce()
        this._repelForceCalculation(physObj)
        physObj.update(delta)
    }

    update(dt) {
        if (isNaN(dt)) {
            return
        }
        this.rBush = new RBush()
        this.rBush.load(_.map(_.values(this._objects), physObj => ({
            ...physObj.boundingBox,
            o: physObj
        })))
        _.forEach(_.values(this._objects), obj => this._updateObject(obj, dt))
    }

    doNSteps(n, dt = 0.016) {
        for (let step = 0; step < n; ++step) {
            this.update(dt)
        }
    }

    get physicalObjects() {
        return _.values(this._objects)
    }

    get allNames() {
        return _.keys(this._objects)
    }

    dispose() {
        this._objects = {}
        this.rBush.clear()
    }

    get size() {
        return _.size(this._objects)
    }

    get entries() {
        return _.entries(this._objects)
    }
}
