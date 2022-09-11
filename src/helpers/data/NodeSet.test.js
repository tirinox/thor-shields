import {expect, test} from '@jest/globals';
import {defaultNodeSet} from "@/helpers/data/NodeSetExamples";


test('NodeSet top chain', () => {
    expect(defaultNodeSet.total).toBe(179)

    expect(defaultNodeSet.topHeights['LTC']).toBe(2326981)
    expect(defaultNodeSet.topHeights['BNB']).toBe(264265300)
    expect(defaultNodeSet.topHeights['BCH']).toBe(756034)
    expect(defaultNodeSet.topHeights['BTC']).toBe(752401)
    expect(defaultNodeSet.topHeights['DOGE']).toBe(4375206)
    expect(defaultNodeSet.topHeights['ETH']).toBe(15465509)
    expect(defaultNodeSet.topHeights['GAIA']).toBe(11909135)
    expect(defaultNodeSet.topHeights['THOR']).toBe(7134913)
})

test('Top Version', () => {
    expect(defaultNodeSet.topVersion.toString()).toBe('1.95.1')
})