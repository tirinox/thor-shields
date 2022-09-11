import {expect, test} from '@jest/globals';
import {Version} from "@/helpers/data/Version";
import {defaultNodeSet, loadNodeExamples} from "@/helpers/data/NodeSetExamples";

test('version construction', () => {
    const v100 = new Version()
    expect(v100.x).toBe(1)
    expect(v100.y).toBe(0)
    expect(v100.z).toBe(0)

    const v1 = new Version(1, 95, 5)
    expect(v1.x).toBe(1)
    expect(v1.y).toBe(95)
    expect(v1.z).toBe(5)
    expect(v1.equal(new Version(1, 95, 5))).toBeTruthy()
})

test('parsing', () => {
    const v1 = Version.fromString('1.95.5')
    expect(v1.x).toBe(1)
    expect(v1.y).toBe(95)
    expect(v1.z).toBe(5)

    const v2 = Version.fromString('10.2.3.4')
    expect(v2.x).toBe(10)
    expect(v2.y).toBe(2)
    expect(v2.z).toBe(3)

    const v3 = Version.fromString('7.8')
    expect(v3.x).toBe(7)
    expect(v3.y).toBe(8)
    expect(v3.z).toBe(0)

    const v4 = Version.fromString('6')
    expect(v4.x).toBe(6)
    expect(v4.y).toBe(0)
    expect(v4.z).toBe(0)

    expect(Version.fromString('foo.BAR').isInvalid).toBeTruthy()
})

test('inc version', () => {
    expect(Version.fromString('1.95.5').inc().equal(new Version(1, 95, 6)))
    expect(Version.fromString('1.95.9').inc().equal(new Version(1, 96, 0)))
    expect(Version.fromString('1.99.9').inc().equal(new Version(2, 0, 0)))
    expect(Version.fromString('10.99.9').inc().equal(new Version(11, 0, 0)))
    expect(Version.fromString('1').inc().equal(new Version(1, 0, 1)))
    expect(Version.fromString('1.0.9').inc(100).equal(new Version(1, 0, 10)))
})

test('to string version', () => {
    expect(Version.fromString('1.95.5').toString()).toBe('1.95.5')
    expect(Version.fromString('9').toString()).toBe('9.0.0')
    expect(Version.fromString('9.8.7.4').toString()).toBe('9.8.7')
    expect((new Version(4, 5, 6)).toString()).toBe('4.5.6')
})

test('compare version', () => {
    expect(Version.fromString('1.10.5').greater(Version.fromString('1.11.3'))).toBeTruthy()
    expect(Version.fromString('1.10.5').greater(Version.fromString('1.10.3'))).toBeTruthy()
    expect(Version.fromString('1.10.5').greater(Version.fromString('1.10.9'))).toBeFalsy()
    expect(Version.fromString('2.10.5').greater(Version.fromString('1.10.9'))).toBeTruthy()
})

test('semantic distribution', () => {
    const nodes = loadNodeExamples('./aux/nodes_example_96.json').nodes
    const dist = Version.getSemanticVersionsDistribution(nodes, 'version', 'isActive')
    expect(dist['1.96.0'].comment).toBe('Latest version')
    expect(dist['1.95.1'].comment).toBe('Intermediate version')
    expect(dist['1.95.0'].comment).toBe('Active version')

    expect(dist['1.96.0'].objects).toHaveLength(2)
    expect(dist['1.95.1'].objects).toHaveLength(100)
    expect(dist['1.95.0'].objects).toHaveLength(3)
    expect(dist['1.95.1'].mostPopular).toBeTruthy()

    expect(dist['1.X.X']).toBeTruthy()
    expect(dist['0.X.X']).toBeTruthy()
    expect(dist['2.X.X']).not.toBeTruthy()

    expect(dist['Unknown version'].objects).toHaveLength(42)
})

test('semantic distribution empty', () => {
    const v = Version.getSemanticVersionsDistribution([])
    expect(v).toEqual({})
})