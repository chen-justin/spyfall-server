import {generateRandomString} from '../Helpers'
import { SpyfallPayload } from './SpyfallPayload';
import { Locations } from '../constants';
import {Spyfall1Locations, Spyfall2Locations} from '../constants';
import { getRoles } from './GameLogic';

export default class Room {
    private ID: string;
    private users: Record<string, string>;
    private roundLength: number;
    private locations: any[];
    private userCount = 0;

    //Game related
    private inSession: boolean = false;
    private startTime: number = 0;
    private endTime: number = 0;
    private spy: string = "";
    private agents: Record<string, string>;
    private location: string = "";

    constructor(roundLength: number, locationType: Locations) {
        this.ID = generateRandomString();
        this.roundLength = roundLength;
        this.users = {};
        switch (locationType) {
            case Locations.SP1:
                this.locations = Spyfall1Locations;
                break;
            case Locations.SP2:
                this.locations = Spyfall2Locations;
                break;
            case Locations.BOTH:
                this.locations = Spyfall1Locations.concat(Spyfall2Locations)
                break;
            default:
                this.locations = Spyfall1Locations;
                break;
        }
        this.agents = {}
    }

    public getPayload(): SpyfallPayload {
        return {
            roomName: this.ID,
            roundDuration: this.roundLength,
            locations: this.locations,
            users: this.users,
            inSession: this.inSession,
            location: this.location,
            startTime: this.startTime,
            endTime: this.endTime,
            spy: this.spy,
            agents: this.agents
        }
    }

    public getID() {
        return this.ID;
    }

    public setLocations(locations: string[]) {
        this.locations = locations;
    }

    public startGame() {
        //Calculate end time
        const now = Date.now().valueOf();
        const then = now + this.roundLength*60*1000; //RoundLength is in minutes; want seconds.
        this.startTime = now;
        this.endTime = then;
        this.inSession = true;
        let [spy, agents, location] = getRoles(this.users, this.locations);
        this.spy = spy;
        this.agents = agents;
        this.location = location;
    }

    public endGame() {
        this.inSession = false;
        this.startTime = 0;
        this.endTime = 0;
        this.spy = "";
        this.agents = {};
        this.location = "";
    }

    public addUser(id: string) {
        this.userCount += 1;
        this.users[id] = ("Player " + this.userCount);
    }

    public removeUser(id: string) {
        this.userCount -= 1;
        delete this.users[id];
    }

    public changeUserName(id: string, desiredName: string) {
        if (id in this.users) {
            this.users[id] = desiredName;
        }
    }

    public hasUser(id: string) {
        return id in this.users;
    }

    public isEmpty() {
        return this.userCount === 0;
    }
}