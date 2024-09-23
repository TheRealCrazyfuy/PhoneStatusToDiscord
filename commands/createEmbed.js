const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

// Load json
var variables = require('../variables.json')
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createembed')
        .setDescription('Creates the phone status embed on the current channel'),
    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            interaction.reply("Denied access.")
            return
        }

        /**
         * Try delete old embed
         */
        const client = interaction.client; // obtain client
        const channel = await client.channels.fetch(readVariable("CHANNEL_ID")); // fetch channel

        try {
            const message = await channel.messages.fetch(readVariable("MESSAGE_ID")); // fetch message
            if (message) {
                await message.delete(); // delete message
            }
        } catch (error) {
            if (error.code === 10008) {
                // Message not found
                console.warn(`Message with ID ${readVariable("MESSAGE_ID")} not found.`);
            } else {
                console.error("Error deleting message:", error);
            }
        }

        /**
         * Create and send new embed
         */
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
            )
            .setFooter({ text: 'https://github.com/TheRealCrazyfuy/PhoneStatusToDiscord' });
        const { id } = await interaction.client.channels.cache.get(interaction.channelId).send({ embeds: [statusEmbed] });
        console.log("Setting MESSAGE_ID to" + id)
        writeVariable("MESSAGE_ID", id)
        console.log("Setting CHANNEL_ID to" + interaction.channelId)
        writeVariable("CHANNEL_ID", interaction.channelId)

        await interaction.reply({ content: 'Created succesfully!', ephemeral: true });
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