import User from "./User";

export default class Message {
    constructor(private from: User, private content: string) {}
}