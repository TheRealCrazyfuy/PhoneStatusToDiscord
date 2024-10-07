require('dotenv').config(); // Needed to read .env files

const fs = require('fs');
const path = require('node:path');

const express = require('express') // HTTP server
const app = express()
const bodyParser = require('body-parser');
const port = process.env.HTTP_PORT // Get port from .env
// Require the necessary discord.js classes
const { Client, Collection, Events, GatewayIntentBits, EmbedBuilder } = require('discord.js');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);

// Load json
var variables = require('./variables.json')


function authentication(req, res, next) {
  if (process.env.HTTP_REQUIRE_AUTHENTICATION == "true") { // Check if authentication is enabled
    var authheader = req.headers.authorization;
    if (!authheader) { // Needed to prevent errors
      res.status(401).send('Invalid credentials')
      return;
    }
    var auth = new Buffer.from(authheader.split(' ')[1], 'base64').toString().split(':');
    var user = auth[0];
    var pass = auth[1];

    if (user == process.env.HTTP_USER && pass == process.env.HTTP_PASSWORD) {
      // If Authorized user
      next();
    } else {
      res.status(401).send('Invalid credentials')
      return;
    }
  } else { // Bypass authentication
    next();
  }
}
app.use(authentication)
app.use(bodyParser.json({ type: 'application/*+json' }))

app.get('/status', (res) => {
  res.sendStatus(200)
})

app.post('/api/', (req, res) => {

  const battery = req.query.batt;
  const charging = req.query.charging;
  const lock = req.query.lock
  const location = req.query.loc;
  const alarm = req.query.alarm;
  const batterytemp = req.query.batttemp;
  const watchbattery = req.query.watchbatt;
  if (battery) {
    client.channels.fetch(readVariable("CHANNEL_ID"))
      .then(channel => {
        channel.messages.fetch(readVariable("MESSAGE_ID"))
          .then(message => {
            // Get the embed from the message
            let embed = message.embeds[0];

            // Edit the fields
            for (let i = 0; i < embed.fields.length; i++) {
              if (embed.fields[i].name === "🔋 Battery percentage") {
                embed.fields[i].value = Math.round(battery) + "%";
              }
            }
            // Edit the message with the new embed
            message.edit({ embeds: [embed] });
          });
      });
  }
  if (batterytemp) {
    client.channels.fetch(readVariable("CHANNEL_ID"))
      .then(channel => {
        channel.messages.fetch(readVariable("MESSAGE_ID"))
          .then(message => {
            // Get the embed from the message
            let embed = message.embeds[0];

            // Edit the fields
            for (let i = 0; i < embed.fields.length; i++) {
              if (embed.fields[i].name === "🌡️ Battery temperature") {
                embed.fields[i].value = batterytemp + "ºC";
              }
            }
            // Edit the message with the new embed
            message.edit({ embeds: [embed] });
          });
      });
  }

  if (charging) {
    client.channels.fetch(readVariable("CHANNEL_ID"))
      .then(channel => {
        channel.messages.fetch(readVariable("MESSAGE_ID"))
          .then(message => {
            // Get the embed from the message
            let embed = message.embeds[0];

            // Edit the fields
            for (let i = 0; i < embed.fields.length; i++) {
              if (embed.fields[i].name === "🔌 Charger connected") {
                embed.fields[i].value = charging;
              }
            }
            // Edit the message with the new embed
            message.edit({ embeds: [embed] });
          });
      });
  }
  if (lock) {
    client.channels.fetch(readVariable("CHANNEL_ID"))
      .then(channel => {
        channel.messages.fetch(readVariable("MESSAGE_ID"))
          .then(message => {
            // Get the embed from the message
            let embed = message.embeds[0];

            // Edit the fields
            for (let i = 0; i < embed.fields.length; i++) {
              if (embed.fields[i].name === "🔓 Screen unlocked") {
                embed.fields[i].value = lock;
              }
            }
            // Edit the message with the new embed
            message.edit({ embeds: [embed] });
          });
      });
  }

  if (location) {
    client.channels.fetch(readVariable("CHANNEL_ID"))
      .then(channel => {
        channel.messages.fetch(readVariable("MESSAGE_ID"))
          .then(message => {
            // Get the embed from the message
            let embed = message.embeds[0];

            // Edit the fields
            for (let i = 0; i < embed.fields.length; i++) {
              if (embed.fields[i].name === "🏠 At home?") {
                embed.fields[i].value = location;
              }
            }
            // Edit the message with the new embed
            message.edit({ embeds: [embed] });
          });
      });

  }
  if (alarm) {
    function unixTimestamp(date = Date.now()) {
      return Math.floor(date / 1000)
    }
    client.channels.fetch(readVariable("CHANNEL_ID"))
      .then(channel => {
        channel.messages.fetch(readVariable("MESSAGE_ID"))
          .then(message => {
            // Get the embed from the message
            let embed = message.embeds[0];

            // Edit the fields
            for (let i = 0; i < embed.fields.length; i++) {
              if (embed.fields[i].name === "⏰ Last alarm") {
                embed.fields[i].value = `<t:${unixTimestamp()}:f>`;
              }
            }
            // Edit the message with the new embed
            message.edit({ embeds: [embed] });
          });
      });
  }
  if (watchbattery) {
    client.channels.fetch(channelID)
      .then(channel => {
        channel.messages.fetch(messageID)
          .then(message => {
            // Get the embed from the message
            let embed = message.embeds[0];

            // Edit the fields
            for (let i = 0; i < embed.fields.length; i++) {
              if (embed.fields[i].name === "⌚ Watch battery") {
                embed.fields[i].value = Math.round(watchbattery) + "%";
              }
            }
            // Edit the message with the new embed
            message.edit({ embeds: [embed] });
          });
      });
  }
  //console.log(battery, charging, location)
  res.sendStatus(200)
})


client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module
  client.commands.set(command.data.name, command);
}

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
  app.listen(port, () => {
    console.log(`Waiting for requests on port ${port}`)
  })
});


client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
});

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


