import _ from "lodash";

export class Simulation {
    constructor() {
        this.objects = {}
        this.repelForce = 101.0
    }

    getByName(name) {
        return this.objects[name]
    }

    addObject(name, physObj) {
        const existing = this.getByName(name)
        if (existing) {
            console.warn('PhysObj already exists. No nothing')
            return existing
        }
        this.objects[name] = physObj
    }

    removeObject(name) {
        const physObj = this.getByName(name)
        if (!physObj) {
            console.error('PhysObj not found!')
            return
        }

        physObj.dispose()
        delete this.objects[name]
    }

    _repelForceCalculation(obj) {
        for (const otherObj of this.nodeObjList) {
            if (otherObj !== obj) {
                obj.repel(otherObj, this.repelForce)
            }
        }
    }

    _updateObject(obj, delta) {
        obj.nullifyForce()
        this._repelForceCalculation(obj)
        obj.update(delta)
    }

    update(dt) {
        if (isNaN(dt)) {
            return
        }
        _.forEach(this.nodeObjList, obj => this._updateObject(obj, dt))
    }

    doNSteps(n, dt = 0.016) {
        for (let step = 0; step < n; ++step) {
            this.update(dt)
        }
    }

    get nodeObjList() {
        return _.values(this.objects)
    }

    dispose() {
        // for (const otherObj of this.nodeObjList) {
        //     otherObj.dispose()
        //     // this.parent.remove(otherObj.realObject)
        // }
        this.objects = {}
    }

    get size() {
        return _.size(this.objects)
    }
}
