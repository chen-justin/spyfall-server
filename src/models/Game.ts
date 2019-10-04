export default class Game {
    private name: string;
    private players: string[];
    private endTime: number;
    private locations: string[];
    private agents: string[];
    private spy: string;

    constructor(
        name: string, 
        players: [string], 
        duration: number, //Time remaining in seconds
        locations: [string]
    ) {
        this.name = name;
        this.locations = locations;
        this.players = players;
        let now = Date.now();
        this.endTime = now + duration;

        let spyIndex = Math.floor(Math.random()*(players.length - 1));
        this.spy = players[spyIndex];
        let agents = [];

        for (let i = 0; i < players.length; i++) {
            if (i != spyIndex) {
                agents.push(players[i])
            }
        }

        this.agents = agents;
    }

    public getPlayers = () => {
        return this.players;
    }

    public getSpy = () => {
        return this.spy;
    }

    public getAgents = () => {
        return this.agents;
    }

    public run = () => {
        if (Date.now() > this.endTime) {
            //Game finished, do stuff
        } else return Promise.delay(1000).then(() => this.run());
    }
}