import mitt from "mitt";

export const EventTypes = {
    FullyLoaded: 'fully_loaded',
    DataSourceTick: 'data_source_tick',
    Activity: 'activity',
}

export const emitter = mitt();

export function dbgEmmitAfter(name, after_ms = 1000) {
    setTimeout(() => {
        emitter.emit(name)
    }, after_ms)
}

export function dbgSimulateLoaded() {
    dbgEmmitAfter(EventTypes.FullyLoaded, 1000)
}
