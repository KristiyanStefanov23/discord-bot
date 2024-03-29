module.exports = {
    name: 'skip',
    commands: ['skip'],
    args: [],
    description: 'Skips the current track',
    async execute(message, args, constants, serverQueue, Discord, prefix) {
        if (!message.member.voice.channel)
            return message.channel.send('You need to join the voice chat first');
        if (!serverQueue || !serverQueue.connection.dispatcher)
            return message.channel.send('There is nothing to skip!');
        serverQueue.connection.dispatcher.end();
    }
}
