const Constants = {
  Game: {
    FirstWaveTime: 1000 * 1,
    WaveTime: 1000 * 8,
  },
  Destination: {
    Waypoint: 0,
    Displacement: 1,
  },
  Wave: {
    Delay: {
      Short: 50,
      Medium: 100,
      Long: 200,
    },
    MinionBasic: 'MinionBasic',
    MinionSiege: 'MinionSiege',
    MinionSuper: 'MinionSuper',
    Raptor: 'Raptor',
    Wolf: 'Wolf',
    Krug: 'Krug',
    Gromp: 'Gromp',
    Blue: 'Blue',
    Red: 'Red',
    RiftHerald: 'RiftHerald',
  },
  Lane: {
    Top: 1,
    Mid: 2,
    Bot: 3,
  },
  Structure: {
    Tower: 'Tower',
    Inhibitor: 'Inhibitor',
    Nexus: 'Nexus',
  },
  Enemy: {
    CasterMinion: 'CasterMinion',
    MeleeMinion: 'MeleeMinion',
    SiegeMinion: 'SiegeMinion',
    SuperMinion: 'SuperMinion',
    Raptor: 'Raptor',
    SmallRaptor: 'SmallRaptor',
    Wolf: 'Wolf',
    SmallWolf: 'SmallWolf',
    Krug: 'Krug',
    MediumKrug: 'MediumKrug',
    SmallKrug: 'SmallKrug',
    Gromp: 'Gromp',
    RedGolem: 'RedGolem',
    BlueGolem: 'BlueGolem',
    RiftHerald: 'RiftHerald',
  },
  Champion: {
    Anivia: 'Anivia',
    Alistar: 'Alistar',
    Cassiopeia: 'Cassiopeia',
    Janna: 'Janna',
    JarvanIV: 'JarvanIV',
    Karthus: 'Karthus',
    Leona: 'Leona',
    Nami: 'Nami',
    Ornn: 'Ornn',
    Twitch: 'Twitch',
    TwistedFate: 'TwistedFate',
    Vayne: 'Vayne',
    Ziggs: 'Ziggs',
    Zilean: 'Zilean',
  },
  Keycodes: Phaser.Input.Keyboard.KeyCodes,
};

export default Constants;
