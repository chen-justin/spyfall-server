import User from "./User";

export default class Room {
    private name: string;
    private users: User[];

    constructor(roomName: string) {
        this.name = roomName;
        this.users = [];
    }

    public getName() {
        return this.name;
    }

    public getUsers() {
        let ret = [];
        for (let user of this.users) {
            console.log(user);
            ret.push(user.getDisplayName());
        }
        console.log(ret);
        return ret;
    }

    public disconnectUsers() {
        for (let user of this.users) {
            user.setJoinedRoom(null);
        }
    }

    public userIsInRoom(user: User) {
        for (let u of this.users) {
            if (u.getSocketID() === user.getSocketID()){
                return true;
            }
        }
        return false;
    }

    public userJoin(user: User) {
        if (!this.userIsInRoom(user)) {
            this.users.push(user);
            user.setJoinedRoom(this)
        }
    }

    public userLeave(user: User) {
        user.setJoinedRoom(null);
        const index = this.users.indexOf(user);
        if (index > -1) this.users.splice(index, 1);
    }

    public isEmpty() {
        return this.users.length === 0;
    }
}