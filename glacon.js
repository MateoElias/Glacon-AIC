const {Collection, Client, Discord} = require('discord.js');
const fs = require('fs');
const client = new Client;
const config = require('./config.json')
const noblox = require('noblox.js');
var prefix = "G!";
client.commands = new Collection();
client.aliases = new Collection();
client.config = config;
client.categories = fs.readdirSync('./commands/');
['command'].forEach(handler => {
    require(`./handler/${handler}`)(client);
});
client.on('ready', async () => {
    await noblox.setCookie(config.COOKIE)    
    console.log('Bot online')

        client.user.setActivity(`over ${await (await noblox.getGroup(5137119)).memberCount} Members`, {
            type: "WATCHING"
        });
})

client.on('message', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    if (!message.guild) return;
    if (!message.member) message.member = await message.guild.fetchMember(message);
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLocaleLowerCase();
    if (cmd.length == 0) return;
    const command = client.commands.get(cmd)
    if (!command) command = client.commands.get(client.aliases.get(cmd));
    if (command) command.run(client, message, args)
})

client.login(config.TOKEN)