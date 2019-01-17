const Discord = require("discord.js");

const client = new Discord.Client();

const config = require("./auth.json");
const youtube = require('./youtube.js');  
const ytdl = require('ytdl-core');

let voiceChannel = null;
let ytAudioQueue = [];
let dispatcher = null;

client.on('ready', function () {
  console.log('I am ready');
});

client.on('message', function (message) {
  var messageParts = message.content.split(' ');

  var command = messageParts[0].toLowerCase();
  var parameters = messageParts.splice(1, messageParts.length);

  console.log("command: " + command);
  console.log("parameters: " + parameters);

  switch (command) {
      case "!netinha":
          PlayCommand(parameters.join(" "), message);
          break;
  }
});

/* COMMAND HANDLERS */

/// lists out all of the bot commands
function HelpCommand(originalMessage) {
  originalMessage.reply("*join <channel-to-join> - Connects to bot to a channel by channel name");
  originalMessage.reply("*play <YouTube search term> - Plays audio from YouTube based on the search term");
  originalMessage.reply("*playqueue - Lists the audio remaining in the play queue");
}

/// plays audio based on results from youtube search
function PlayCommand(searchTerm) {

  // if not connected to a voice channel then connect to first one
  if (client.voiceConnections.array().length == 0) {
      var defaultVoiceChannel = client.channels.find(val => val.type === 'voice').name;
      JoinCommand(defaultVoiceChannel);
  }

  // search youtube using the given search search term and perform callback action if video is found
  
  youtube.search(searchTerm, QueueYtAudioStream);
}

/// lists out all music queued to play
function PlayQueueCommand(message) {
  var queueString = "";

  for(var x = 0; x < ytAudioQueue.length; x++) {
      queueString += ytAudioQueue[x].videoName + ", ";
  }

  queueString = queueString.substring(0, queueString.length - 2);
  message.reply(queueString);
}

/// joins the bot to the specified voice channel
function JoinCommand(channelName) {
  var voiceChannel = GetChannelByName(channelName);

  if (voiceChannel) {
      voiceChannel.join();
      console.log("Joined " + voiceChannel.name);
  }

  return voiceChannel;
}

/* END COMMAND HANDLERS */
/*----------------------------------------------------------------------*/
/* HELPER METHODS */

/// returns the channel that matches the name provided
function GetChannelByName(name) {
  var channel = client.channels.find(val => val.name === name);
  return channel;
}

/// Queues result of Youtube search into stream
function QueueYtAudioStream(videoId, videoName) {
  var streamUrl = `${youtube.watchVideoUrl}${videoId}`;

  if (!ytAudioQueue.length) {
      ytAudioQueue.push(
          {
              'streamUrl': 'https://www.youtube.com/watch?v=6WlaauPk1g8&feature=youtu.be',
              'videoName': videoName
          }
      );

      console.log("Queued audio " + streamUrl);
      PlayStream(ytAudioQueue[0].streamUrl);
  }
  else {
      ytAudioQueue.push(
          {
              'streamUrl': 'https://www.youtube.com/watch?v=6WlaauPk1g8&feature=youtu.be',
              'videoName': videoName
          }
      );

      console.log("Queued audio " + videoName);
  }

}

/// Plays a given stream
function PlayStream(streamUrl) {

  const streamOptions = {seek: 0, volume: 1};

  if (streamUrl) {
      const options = {
          filter: 'video', 
          begin: '20s'
      }
      const stream = ytdl(streamUrl, options);

      if (dispatcher == null) {

          var voiceConnection = client.voiceConnections.first();
          //console.log(voiceConnection);

          if (voiceConnection) {

              console.log("Now Playing " + ytAudioQueue[0].videoName);
              dispatcher = client.voiceConnections.first().playStream(stream, streamOptions);

              dispatcher.on('end', () => {                       
                dispatcher = null;                 
                PlayNextStreamInQueue();
              })

              dispatcher.on('error', (err) => {
                  console.log(err);
              });
          }
      }
      else {
        console.log('entrou aqui')
          dispatcher = client.voiceConnections.first().playStream(stream, streamOptions);
      }
  }
}

/// Plays the next stream in the queue
function PlayNextStreamInQueue() {

  ytAudioQueue.splice(0, 1);

  // if there are streams remaining in the queue then try to play
  if (ytAudioQueue.length != 0) {
      console.log("Now Playing " + ytAudioQueue[0].videoName);
      PlayStream(ytAudioQueue[0].streamUrl);
  }
}
/* END HELPER METHODS */

client.login(config.token);