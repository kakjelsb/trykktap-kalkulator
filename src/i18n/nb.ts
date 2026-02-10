/**
 * Norwegian (Bokmål) localization strings
 * All UI text is centralized here for easy localization
 */

export const nb = {
  app: {
    title: 'Trykktap Kalkulator',
    description: 'Dra utstyr fra paletten for å bygge oppsettet',
    rotateDevice: 'Vennligst roter enheten til liggende visning',
  },

  toolbar: {
    save: 'Lagre',
    share: 'Del',
    clear: 'Tøm',
    undo: 'Angre',
    redo: 'Gjør om',
  },

  palette: {
    title: 'Utstyr',
    pumps: 'Pumper',
    hoses: 'Slanger',
    connectors: 'Koblinger',
    terminals: 'Terminaler',
  },

  equipment: {
    // Source
    source: 'Vannkilde',
    sourceDesc: 'Vannkilde (brønn, hydrant, etc.)',

    // Pumps
    ziegler: 'Ziegler',
    zieglerDesc: 'Stor pumpe - 3000 l/min',
    otter: 'Otter',
    otterDesc: 'Liten pumpe - 800 l/min',

    // Hoses
    hose1_5: 'Slange 1½"',
    hose1_5Desc: '1½" (38mm) - 20m',
    hose2_5: 'Slange 2½"',
    hose2_5Desc: '2½" (65mm) - 20m',
    hose4: 'Slange 4"',
    hose4Desc: '4" (102mm) - 20m',

    // Connectors
    splitter2: 'Grenrør 1→2',
    splitter2Desc: 'Deler til 2 utganger',
    splitter3: 'Grenrør 1→3',
    splitter3Desc: 'Deler til 3 utganger',

    // Terminals
    waterCannon: 'Vannkanon',
    waterCannonDesc: 'Strålerør - krever 6-8 bar',
    fireWall: 'Vannvegg',
    fireWallDesc: 'Brannvegg - krever 4-6 bar',
  },

  properties: {
    elevation: 'Høyde (moh)',
    pressure: 'Trykk',
    flow: 'Vannføring',
    length: 'Lengde',
    diameter: 'Diameter',
  },

  calculation: {
    totalPressureLoss: 'Totalt trykktap',
    pressureAtPoint: 'Trykk ved punkt',
    flowRate: 'Vannføring',
    elevationLoss: 'Høydetap',
    frictionLoss: 'Friksjonsstap',
  },

  units: {
    bar: 'bar',
    litersPerMinute: 'l/min',
    meters: 'm',
    metersAboveSeaLevel: 'moh',
  },

  status: {
    pressureGood: 'Godt trykk',
    pressureOk: 'Tilstrekkelig trykk',
    pressureLow: 'For lavt trykk',
    flowExceeded: 'Kapasitet overskredet',
  },

  tooltip: {
    pressureLoss: 'Trykktap',
    maxPressure: 'Maks trykk',
    maxFlow: 'Maks kapasitet',
    requiredPressure: 'Påkrevd trykk',
  },

  share: {
    title: 'Del oppsett',
    copyLink: 'Kopier lenke',
    copied: 'Kopiert!',
    exportJson: 'Last ned JSON',
    importJson: 'Importer JSON',
  },

  errors: {
    connectionInvalid: 'Ugyldig tilkobling',
    pressureTooLow: 'For lavt trykk ved terminal',
    flowExceeded: 'Kapasitet overskredet',
    noPump: 'Mangler pumpe i oppsettet',
  },

  actions: {
    add: 'Legg til',
    delete: 'Slett',
    edit: 'Rediger',
    connect: 'Koble til',
    disconnect: 'Koble fra',
  },
} as const

export type Translations = typeof nb
