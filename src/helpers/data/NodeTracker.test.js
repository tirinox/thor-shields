import {expect, test} from '@jest/globals';
import {DebugNodeJuggler} from "@/helpers/data/NodeTracker";

const nodeJuggler = new DebugNodeJuggler()

test('juggler', () => {
    expect(nodeJuggler.enabled).toBeTruthy()
})

test('juggler version', () => {
    expect(nodeJuggler._nextVersion('1.95.9')).toBe('1.96.0')
    expect(nodeJuggler._nextVersion('1.99.9')).toBe('2.0.0')
    expect(nodeJuggler._nextVersion('0.0.0')).toBe('0.0.1')
})