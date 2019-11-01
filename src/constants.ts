import { sf1locations, sf2locations } from "./locations.json";

export enum SpyfallEvent {
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  JOIN = "join",
  LEAVE = "leave",
  CREATEROOM = "createroom",
  CHANGENAME = "changename",
  STARTGAME = "startgame",
  ENDGAME = "endgame",
  LOADLOCATIONS = "loadlocations",
  RECEIVEPAYLOAD = "receivepayload"
}

export enum Locations {
  SP1,
  SP2,
  BOTH,
  CUSTOM
}

export const Spyfall1Locations = sf1locations;
export const Spyfall2Locations = sf2locations;
