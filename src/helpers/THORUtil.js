export const THOR_DECIMAL = Math.pow(10, 8)
export const THOR_DECIMAL_INV = 1.0 / THOR_DECIMAL

export function thorToFloat(x) {
    return parseFloat(x) * THOR_DECIMAL_INV
}

export function providerShortName(name) {
    name = name.toUpperCase()
    for(const component of name.split('-')) {
        if(component !== 'AS') {
            return component
        }
    }
    return name
}