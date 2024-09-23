const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

const commands = [
        new SlashCommandBuilder()
        .setName('createembed')
        .setDescription('Creates the phone status embed on the current channel')
        .setDMPermission(false)
        .toJSON(),
];

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            { body: commands },
        );

        console.log('Succesfully registered commands.');
    } catch (error) {
        console.error(error);
    }
})();