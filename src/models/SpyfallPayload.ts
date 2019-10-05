export interface SpyfallPayload {
  roomName: string;
  roundDuration: number;
  locations: string[];
  users: Record<string, string>;
  inSession: boolean;
  location: string;
  startTime: number;
  endTime: number;
  spy: string;
  agents: Record<string, string>;
}
