// const Live = process.env.NODE_ENV !== 'development'
const Live = true

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
            Strength: 0.3,
            Threshold: 0.1,
            Radius: 0.5,
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
            MouseMoveStrength: 0.0002
        },
    },
    Scene: {
        Sky: {
            SkyBox: '/texture/skybox/star',
            SkyBoxExt: 'jpg',
        },
        NodeObject: {
            PlaceScale: 2.0,
            MaxScale: 84.0,
            MinScale: 20.0,
        }
    },
    Physics: {
        BaseForce: 1500.0,
        RepelForce: 200.0,
        Startup: {
            SimulationSteps: 10,
            DeltaTime: 0.1
        },
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
