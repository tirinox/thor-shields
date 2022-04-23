export class THORChainLogoShape {
    static original() {
        return [
            [
                {x: 0, y: 0},
                {x: 133, y: -133},
                {x: -238, y: -291},
            ],
            [
                {x: 0, y: 0},
                {x: -133, y: 135},
                {x: 291, y: 311},
            ]
        ]
    }

    static triangles(dx = 0, dy = 0, scale = 1.0) {
        const transformed = []
        for(const triangle of this.original()) {
            const pts = []
            for(const {x, y} of triangle) {
                pts.push({
                    x: x * scale + dx,
                    y: y * scale + dy
                })
            }
            transformed.push(pts)
        }
        return transformed
    }
}
