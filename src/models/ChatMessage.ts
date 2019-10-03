import User from "./User";
import Message from "./Message";

export default class ChatMessage extends Message{
    constructor(from: User, content: string) {
        super(from, content);
    }
}