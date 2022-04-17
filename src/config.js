export const Config = {
    DataSource: {
        NodesURL: 'https://thornode.ninerealms.com/thorchain/nodes',
        PollPeriod: 3, // sec
    },
    Font: {
        // Main: 'fonts/NorseBold-2Kge.otf'
        Main: 'fonts/Exo2-VariableFont_wght.ttf'
    },
    Effects: {
        Bloom: {
            Enabled: true,
            Strength: 0.5,
            Threshold: 0.5,
            Radius: 0.5,
        }
    },
    Controls: {
        Distance: 1000,
        AzimuthAngleLimit: 30,
        PolarAngleLimit: 35,
    }
}

export const Colors = {
    LightningBlue: 0x00CCFF,
    YggdrasilGreen: 0x33FF99,
    MidgardTurqoise: 0x23DCC8,
    NightBlack: 0x101921
}
