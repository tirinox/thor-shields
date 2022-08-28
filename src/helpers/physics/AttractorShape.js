import _ from "lodash";
import {Section, Util} from "@/helpers/MathUtil";
import {AttractorFlat} from "@/helpers/physics/Attractor";
import * as THREE from "three";


export class AttractorShape extends AttractorFlat {
    constructor(triangles, constCoeff = 0, linearCoeff = 0, quadraticCoeff = 0, z = 0) {
        const center = Util.centerOf(_.flatten(triangles))
        super(new THREE.Vector3(center.x, center.y, 0.0),
            constCoeff, linearCoeff, quadraticCoeff, 0, 0)
        this.triangles = triangles
        this.center = center
        this.z = z
    }

    get allSectors() {
        const sectors = []
        for (const triangle of this.triangles) {
            sectors.push(new Section(triangle[0], triangle[1]))
            sectors.push(new Section(triangle[1], triangle[2]))
            sectors.push(new Section(triangle[2], triangle[0]))
        }
        return sectors
    }

    applyForce(physObj) {
        if (!this.triangles || !this.triangles.length) {
            return
        }
        const objPosition = physObj.realObject.position
        const p = {x: objPosition.x, y: objPosition.y}
        const relaxed = _.some(this.triangles, tri => Util.pointInTriangle(p, tri))

        this.squishZ(physObj)

        if (relaxed) {
            return
        }

        const nearestSector = _.minBy(this.allSectors, sector => sector.pDistance(p.x, p.y))
        const nearestPoint = nearestSector.nearestPoint(p.x, p.y)
        const distance = new Section(nearestPoint, p).length
        this.applyForceToDistance(physObj, distance, new THREE.Vector3(nearestPoint.x, nearestPoint.y, this.z))
    }
}
