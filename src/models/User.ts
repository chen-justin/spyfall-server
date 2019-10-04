import Room from "./Room";

export default class User {
    private socketID: string;
    private name: string;
    private joinedRoom: Room;

    constructor(socketID: string, displayName: string) {
        this.socketID = socketID;
        this.name = displayName;
    }

    public getSocketID(): string {
        return this.socketID
    }

    public getDisplayName(): string {
        return this.name;
    }

    public getJoinedRoom(): Room {
        return this.joinedRoom;
    }

    public setDisplayName(displayname: string) {
        this.name = displayname;
    }

    public setJoinedRoom(room: Room) {
        this.joinedRoom = room
    }
}