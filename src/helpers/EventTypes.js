import mitt from "mitt";

export const EventTypes = {
    FullyLoaded: 'fully_loaded',
    DataSourceTick: 'data_source_tick',
}

export const emitter = mitt();
