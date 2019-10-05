import * as express from "express";
import * as socketIO from "socket.io";
import { createServer, Server } from "http";
import { SpyfallEvent } from "./constants";
import Room from "./models/Room";
import { SpyfallRoomConfig } from "./models/SpyfallRoomConfig";

const app = express();
app.set("port", process.env.PORT || 3000);

export class SpyfallServer {
  public static readonly PORT: number = 8080;
  private app: express.Application;
  private server: Server;
  private io: SocketIO.Server;
  private port: string | number;
  private rooms: Record<string, Room>;

  constructor() {
    this.createApp();
    this.config();
    this.createServer();
    this.sockets();
    this.listen();
    this.rooms = {};
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

  private listen(): void {
    this.server.listen(this.port, () => {
      console.log("Running server on port %s", this.port);
    });

    this.io.on(SpyfallEvent.CONNECT, (socket: any) => {
      console.log("Client connected:", socket.id);
      socket.on(
        SpyfallEvent.CREATEROOM,
        (config: SpyfallRoomConfig, desiredName: string) => {
          const newRoom = new Room(config.roundDuration, config.locationType);
          const id = newRoom.getID();
          this.rooms[id] = newRoom;
          newRoom.addUser(socket.id);
          newRoom.changeUserName(socket.id, desiredName);
          socket.join(id);
          const payload = newRoom.getPayload();
          this.io.in(id).emit(SpyfallEvent.RECEIVEPAYLOAD, payload);
        }
      );

      socket.on(
        SpyfallEvent.CHANGENAME,
        (roomName: string, desiredName: string) => {
          if (roomName in this.rooms) {
            const room = this.rooms[roomName];
            if (room.hasUser(socket.id)) {
              room.changeUserName(socket.id, desiredName);
              const payload = room.getPayload();
              console.log(payload);
              this.io.in(roomName).emit(SpyfallEvent.RECEIVEPAYLOAD, payload);
            }
          }
        }
      );

      socket.on(SpyfallEvent.STARTGAME, (roomName: string) => {
        if (roomName in this.rooms) {
          const room = this.rooms[roomName];
          room.startGame();
          const payload = room.getPayload();
          this.io.in(roomName).emit(SpyfallEvent.RECEIVEPAYLOAD, payload);
        }
      });

      socket.on(SpyfallEvent.ENDGAME, (roomName: string) => {
        if (roomName in this.rooms) {
          const room = this.rooms[roomName];
          room.endGame();
          const payload = room.getPayload();
          this.io.in(roomName).emit(SpyfallEvent.RECEIVEPAYLOAD, payload);
        }
      });

      socket.on(SpyfallEvent.JOIN, (roomName: string, desiredName: string) => {
        if (roomName in this.rooms) {
          const room = this.rooms[roomName];
          room.addUser(socket.id);
          room.changeUserName(socket.id, desiredName);
          socket.join(roomName);
          const payload = room.getPayload();
          this.io.in(roomName).emit(SpyfallEvent.RECEIVEPAYLOAD, payload);
        }
      });

      socket.on(SpyfallEvent.LEAVE, (roomName: string) => {
        if (roomName in this.rooms) {
          const room = this.rooms[roomName];
          room.endGame(); //End the game if a user leaves.
          room.removeUser(socket.id);
          socket.leave(roomName);
          if (!room.isEmpty()) {
            const payload = room.getPayload();
            this.io.in(roomName).emit(SpyfallEvent.RECEIVEPAYLOAD, payload);
          } else {
            delete this.rooms[roomName];
          }
        }
      });

      socket.on(SpyfallEvent.DISCONNECT, () => {
        //Iterate through every room and see if user is connected.
        for (let key in this.rooms) {
          const room = this.rooms[key];
          if (room.hasUser(socket.id)) {
            room.removeUser(socket.id);
            if (room.isEmpty()) delete this.rooms[key];
          }
          //Garbage collection - Delete room if empty.
          if (room.isEmpty()) delete this.rooms[key];
        }
        console.log("Client disconnected: ", socket.id);
      });
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}
