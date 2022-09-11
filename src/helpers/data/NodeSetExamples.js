import fs from "fs";
import {NodeSet} from "@/helpers/data/NodeSet";
import _ from "lodash";
import {NodeInfo} from "@/helpers/data/NodeInfo";

export function loadNodeExamples(name = './aux/nodes_example.json') {
    const data = fs.readFileSync(name)
    const parsed = JSON.parse(data)
    return new NodeSet(
        _.map(parsed, json => new NodeInfo(json))
    )
}

export const defaultNodeSet = loadNodeExamples()
