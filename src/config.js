// const Live = process.env.NODE_ENV !== 'development'
const Live = process.env.USE_LOCAL_DATA !== "1"


export const Config = {
    DataSource: {
        NodesURL: (Live ?
                'https://thornode.ninerealms.com/thorchain/nodes' :
                'http://localhost:8080/data/samplenodes.json'),

        PollPeriod: 3, // sec
        ReactRandomDelay: 2.5, // sec
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
                Max: 2500,
                Start: 1800,
            },
            AzimuthAngleLimit: 30,
            PolarAngleLimit: 30,
            MouseMoveStrength: 0.0002,

            Animation: {
                Duration: 0.6,
                Z_DistanceWhenZoomed: 320.0,
                Shift: {
                    X: -200.0
                }
            }
        },
    },
    Scene: {
        Sky: {
            SkyBox: 'texture/skybox/star',
            SkyBoxExt: 'png',
        },
        NodeObject: {
            PlaneScale: 1.0,
            MaxScale: 80.0,
            MinScale: 10.0,
            ScaleFactor: 1.0,
        }
    },
    Physics: {
        BaseForce: 3500.0,
        RepelForce: 200.0,
        Startup: {
            SimulationSteps: 10,
            DeltaTime: 0.1
        },
        BaseFriction: 0.04,
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
