require('dotenv').config();
const Discord = require('discord.js');
const fs = require('fs');
const constants = require('./struct/constants');

const clientCtor = require('./struct/client');
const client = new clientCtor({ token: process.env.DISCORD_TOKEN, prefix: process.env.DEFAULT_DISCORD_PREFIX });

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

Discord.Structures.extend('Guild', Guild => {
    class MusicGuild extends Guild {
        constructor(client, data) {
            super(client, data);
            this.musicData = {
                queue: [],
                isPlaying: false,
                volume: 1,
                songDispatcher: null
            };
        }
    }
    return MusicGuild;
});

client.on('ready', () => {
    console.log('Kis bot is now Online!');
    const status = client.data.clientData.author.status;
    client.user.setActivity(status.msg, { type: status.type.toUpperCase() });
});

client.on('guildCreate', guild => {
    const channel = guild.channels.cache.find(channel => channel.type === 'text' && channel.permissionsFor(guild.me).has('SEND_MESSAGES'))
    channel.send('Thanks for inviting me')
})

client.on('message', async (message) => {
    if (!message.content.startsWith(message.client.getPrefix(message.guild.id) ?? message.client.config.prefix) || message.author.bot) return;
    const serverQueue = message.guild.queue;
    const args = message.content.slice(message.client.config.prefix.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase();

    if (executeCommand(command, message, args, serverQueue) === false) return message.channel.send('I don\'t recognize this command');
});

function executeCommand(command, message, args, serverQueue) {
    let result = false;
    client.commands.forEach(c => {
        if (c.commands.includes(command)) {
            result = true;
            return client.commands.get(`${c.name}`).execute(message, args, constants, serverQueue, Discord, message.client.config.prefix);
        }
    });
    return result
}

client.login(client.config.token);