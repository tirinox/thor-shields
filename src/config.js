// const Live = process.env.NODE_ENV !== 'development'
// const Live = false // process.env.USE_LOCAL_DATA !== "1"
const Live = true


export const Config = {
    DataSource: {
        NodesURL: (Live ?
            'https://thornode.ninerealms.com/thorchain/nodes' :
            'http://localhost:8080/data/samplenodes.json'),

        PollPeriod: 3000.0, // msec
        ReactRandomDelay: 2500.0, // msec
    },
    Font: {
        // Main: 'fonts/NorseBold-2Kge.otf'
        Main: 'fonts/Exo2-VariableFont_wght.ttf'
    },
    Effects: {
        Bloom: {
            Enabled: true,
            Strength: 0.4,
            Threshold: 0.5,
            Radius: 0.02,
        }
    },
    Controls: {
        Camera: {
            Distance: {
                Min: 800,
                Max: 2900,
                Start: 2000,
            },
            AzimuthAngleLimit: 180,
            PolarAngleLimit: 180,
            MouseMoveStrength: 0.0002,

            Animation: {
                Duration: 500.0,
                X_DistanceWhenZoomed: 0.0,
                Z_DistanceWhenZoomed: 320.0,
                Shift: {
                    X: -200.0
                }
            }
        },
    },
    Scene: {
        Background: {
            Enabled: false,  // todo: enable. disabled for better performance
        },
        Sky: {
            SkyBox: 'texture/skybox/star',
            SkyBoxExt: 'png',
        },
        NodeObject: {
            PlaneScale: 1.0,
            MaxScale: 80.0,
            MinScale: 10.0,
            ScaleFactor: 1.0,
        },
        Globe: {
            Radius: 423.0,
            NodeElevation: 50.0
        },
    },
    Physics: {
        BaseForce: 3500.0,
        RepelForce: 200.0,
        Startup: {
            SimulationSteps: 10,
            DeltaTime: 0.1
        },
        BaseFriction: 0.07, //0.04
        MaxSpeedSq: Math.pow(1500, 2),
        Attractor: {
            Flat: {
                DeltaZ: 1.0,
            }
        }
    },
    Debug: {
        ShowFPS: false,
    }
}

export const Colors = {
    LightningBlue: 0x00CCFF,
    YggdrasilGreen: 0x33FF99,
    MidgardTurqoise: 0x23DCC8,
    NightBlack: 0x101921
}
