import {expect, test} from '@jest/globals';
import * as fs from "fs";
import {NodeSet} from "@/helpers/data/NodeSet";
import _ from "lodash";
import {NodeInfo} from "@/helpers/data/NodeInfo";

function loadNodeExamples() {
    const data = fs.readFileSync('./aux/nodes_example.json')
    const parsed = JSON.parse(data)
    return new NodeSet(
        _.map(parsed, json => new NodeInfo(json))
    )
}

const defaultNodeSet = loadNodeExamples()

test('NodeSet top chain', () => {
    expect(defaultNodeSet.total).toBe(179)

    expect(defaultNodeSet.topHeights['LTC']).toBe(2326981)
    expect(defaultNodeSet.topHeights['BNB']).toBe(264265300)
    expect(defaultNodeSet.topHeights['BCH']).toBe(756034)
    expect(defaultNodeSet.topHeights['BTC']).toBe(752401)
    expect(defaultNodeSet.topHeights['DOGE']).toBe(4375206)
    expect(defaultNodeSet.topHeights['ETH']).toBe(15465509)
    expect(defaultNodeSet.topHeights['GAIA']).toBe(11909135)
})
