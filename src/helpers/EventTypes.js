import mitt from "mitt";

export const EventTypes = {
    FullyLoaded: 'fully_loaded',
    DataSourceTick: 'data_source_tick',
    Activity: 'activity',
}

export const emitter = mitt();
