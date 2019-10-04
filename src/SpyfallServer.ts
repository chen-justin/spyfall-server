import * as express from "express";
import * as socketIO from 'socket.io';
import {createServer, Server} from 'http';
import {Event} from './constants';
import Room from './models/Room';
import User from "./models/User";

const app = express();
app.set("port", process.env.PORT || 3000);

export class SpyfallServer {
    public static readonly PORT:number = 8080;
    private app: express.Application;
    private server: Server;
    private io: SocketIO.Server;
    private port: string | number;
    private users: User[];
    private userCount: number;
    private rooms: Room[];

    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
        this.users = [];
        this.userCount = 1;
        this.rooms = [];
    }

    private createApp(): void {
        this.app = express();
    }

    private createServer(): void {
        this.server = createServer(this.app);
    }

    private config(): void {
        this.port = process.env.PORT || SpyfallServer.PORT;
    }

    private sockets(): void {
        this.io = socketIO(this.server);
    }

    private createUser(socketID: string, displayName: string): User {
        let u = this.getUser(socketID);
        if (u) {
            return u;
        } else {
            let newUser = new User(socketID, displayName);
            this.userCount += 1
            this.users.push(newUser);
        }
    }

    private deleteUser(socketID: string) {
        let index = -1;
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].getSocketID() === socketID) index = i;
        }
        if (index > -1) this.users.splice(index, 1);
    }

    private getUser(socketID: string): User {
        for (let u of this.users) {
            if (u.getSocketID() === socketID) return u;
        }
        return null;
    }

    private getRoom(roomName: string): Room {
        for (let room of this.rooms) {
            if (room.getName() === roomName) {
                return room;
            }
        }
        return null;
    }

    private deleteRoom(roomName: string) {
        let index = -1;
        for (let i = 0; i < this.users.length; i++) {
            if (this.rooms[i].getName() === roomName) index = i;
        }
        this.rooms[index].disconnectUsers();
        if (index > -1) this.rooms.splice(index, 1);
    }

    private joinRoom(user: User, roomName: string) {
        let room: Room = this.getRoom(roomName);
        if (room) {
            room.userJoin(user);
        } else {
            room = new Room(roomName);
            room.userJoin(user);
            this.rooms.push(room);
        }
    }

    private leaveRoom(user: User, roomName: string) {
        let room: Room = this.getRoom(roomName);
        if (room) {
            room.userLeave(user);
            if (room.getUsers().length === 0) {
                this.deleteRoom(roomName);
            }
        }
    }

    private listen(): void {
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });

        this.io.on(Event.CONNECT, (socket: any) => {
            console.log('Client connected: ', socket.id);
            this.createUser(socket.id, "Player" + this.userCount)
            socket.on(Event.JOIN, (roomName: string) => {
                let user = this.getUser(socket.id);
                console.log(user);
                this.joinRoom(user, roomName);
                socket.join(roomName);
                let r = this.getRoom(roomName);
                if (r) {
                    this.io.to(roomName).emit('userPayload', r.getUsers());
                }
            });

            socket.on(Event.LEAVE, (roomName: string) => {
                //Leave all rooms
                let user = this.getUser(socket.id);
                this.leaveRoom(user, roomName);
                socket.leave(roomName);
                let r = this.getRoom(roomName);
                if (r) {
                    this.io.to(roomName).emit('userPayload', r.getUsers());
                }
            });

            socket.on(Event.CHANGENAME, (username: string) => {
                let user = this.getUser(socket.id);
                user.setDisplayName(username);
                let r = user.getJoinedRoom();
                if (r) {
                    this.io.to(r.getName()).emit('userPayload', r.getUsers());
                }
            })

            socket.on(Event.DISCONNECT, () => {
                //Remove from user list
                let user = this.getUser(socket.id);
                const room = user.getJoinedRoom();
                if (room) {
                    this.leaveRoom(user, room.getName());
                    this.io.to(room.getName()).emit('userPayload', room.getUsers());
                }
                this.deleteUser(socket.id);
                console.log('Client disconnected: ', socket.id);
            });
        });
    }

    public getApp(): express.Application {
        return this.app;
    }
}