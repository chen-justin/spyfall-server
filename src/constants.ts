export enum SpyfallEvent {
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    JOIN = 'join',
    LEAVE = 'leave',
    CREATEROOM = 'createroom',
    CHANGENAME = 'changename',
    STARTGAME = 'startgame',
    ENDGAME = 'endgame',
    RECEIVEPAYLOAD = 'receivepayload'
}

export enum Locations {
    SP1,
    SP2,
    BOTH,
    CUSTOM
}

const locations = require('./locations.json');
export const Spyfall1Locations = locations["locations"];
