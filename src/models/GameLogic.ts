export const getRoles = (users: Record<string, string>, locations: any[]): [string, Record<string, string>, string] => {
    let userkeys = Object.keys(JSON.parse(JSON.stringify(users)));
    const location = locations[(Math.floor(Math.random()*locations.length))];
    const spyIndex = Math.floor(Math.random()*(userkeys.length));
    const spy = userkeys[spyIndex];
    userkeys.splice(spyIndex, 1);
    const roles: string[] = location['roles'];
    let agents: Record<string, string> = {};
    userkeys.forEach((user) => {
        agents[user] = roles[Math.floor(Math.random()*roles.length)];
    })
    return [spy, agents, location['title']]
}