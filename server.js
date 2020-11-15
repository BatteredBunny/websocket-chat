const WebSocket = require('ws');
const express = require('express'); //Manages website
const validator = require('validator'); //Cleans user input
const axios = require('axios'); //Sends webhook post requests
const Discord = require('discord.js'); //Manages discord bot
const uuid = require('@redoxengine/medical-word-uuid'); //Used for the nice uuids
const path = require('path'); //Used for sending html file from certain place
const Config = require('./config.json'); //Config file
const { webPort, wsPort, discord_webhook, discord_bot_token, discord_channel_id } = Config;

const wss = new WebSocket.Server({ port: wsPort });
const discordClient = new Discord.Client();
const app = express();

//Opens discord bot account
discordClient.once('ready', () => {
  console.log('Discord bot ready!');
});

function sendInput(raw_name, raw_content, raw_id, is_discord) {
  //Gets the raw info and validates it.
  var name = validator.escape(raw_name);
  var content = validator.escape(raw_content);
  var id = validator.escape(raw_id);
  var today = new Date();
  var time = today.toLocaleTimeString('it-IT')

  //Checks that input is not empty or too long.
  if (id != "" && name != "" && content != "" && name.length <= 50 && content.length <= 2000) {

    //Sends webhook message to discord if its not from discord.
    if (!is_discord) {
      axios.post(discord_webhook, {
        content: content,
        username: `#${id} ${name}`
      }).catch(error => {
        console.error(error)
      })
    };

    //Sends the message to each websocket user.
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        console.log(`\nNAME: ${name}\nCONTENT: ${content}\nCLIENT ID: ${id}`);
        client.send(JSON.stringify([name, content, time, id, is_discord]));
      }
    });
  };

}

discordClient.on('message', message => {
  //Exits if user is bot or message is from wrong channel
  if (message.channel.id != discord_channel_id || message.author.bot) { return }
  sendInput(message.author.username, message.content, message.author.discriminator, true)
});

wss.on('connection', (ws) => {
  //Sets cool id to each user
  ws.id = uuid.uuid()

  ws.on('message', (data) => {
    if (data == "") { return }

    var data = JSON.parse(data)
    sendInput(data[0], data[1], ws.id, false)
  });
});

//Logs into discord bot account
discordClient.login(discord_bot_token);

//Simple web server for one page
app.use('/public', express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

//Expressjs website starts
app.listen(webPort, () => {
  console.log(`Expressjs listening at http://localhost:${webPort}`)
});