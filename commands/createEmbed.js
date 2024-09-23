const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

// Load json
var variables = require('../variables.json')
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createembed')
        .setDescription('Creates the phone status embed on the current channel'),
    async execute(interaction, client) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            interaction.reply("Denied access.")
            return
        }
        await interaction.reply({ content: 'Created!', ephemeral: true });
        const statusEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(process.env.YOUR_NAME + `'s phone status`)
            .setURL('https://github.com/TheRealCrazyfuy/PhoneStatusToDiscord')
            .addFields(
                { name: '📱 My phone', value: process.env.PHONE_MODEL, inline: true },
                { name: '🔋 Battery percentage', value: '100%', inline: true },
                { name: '🌡️ Battery temperature', value: '25ºC', inline: true },
                //{ name: '\u200B', value: '\u200B' },
            )
            .addFields(
                { name: '🔌 Charger connected', value: 'No', inline: true },
                { name: '🔓 Screen unlocked', value: 'No', inline: true },
                { name: '🏠 At home?', value: 'Yes', inline: true },

            )
            .addFields(
                { name: '⏰ Last alarm', value: 'Not registered yet', inline: true },
                { name: '⌚ Watch battery', value: '0', inline: true },
            )
            .setFooter({ text: 'https://github.com/TheRealCrazyfuy/PhoneStatusToDiscord' });
        const { id } = await interaction.client.channels.cache.get(interaction.channelId).send({ embeds: [statusEmbed] });
        console.log("Setting MESSAGE_ID to" + id)
        writeVariable("MESSAGE_ID", id)
        console.log("Setting CHANNEL_ID to" + interaction.channelId)
        writeVariable("CHANNEL_ID", interaction.channelId)
    },
};

/**
* Change a value of the variables.json file
* @param {*} key 
* @param {*} value 
*/
function writeVariable(key, value) {
    variables[key] = value;
    fs.writeFile('./variables.json', JSON.stringify(variables), (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log(`Successfully wrote ${key} with value ${value} to variables.json`);
        }
    });
}

/**
 * Read a value from the variables.json file
 * @param {*} key 
 * @returns {*} The value associated with the key, or null if the key doesn't exist
 */
function readVariable(key) {
    if (variables.hasOwnProperty(key)) {
        return variables[key];
    } else {
        return null;
    }
}