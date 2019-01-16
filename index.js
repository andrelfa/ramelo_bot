const Discord = require("discord.js");

const client = new Discord.Client();

const config = require("./auth.json");

client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildCreate", guild => {
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});


client.on("message", async message => {
  
  if(message.author.bot) return;
  
  if(message.content.indexOf(config.prefix) !== 0) return;
  
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  

  // const voiceChannel = message.member.voiceChannel;
  // if (!voiceChannel){
  //     return message.channel.sendMessage("you must be in a voice channel to request me");
  // }  
  
  if(command === "netinha") {
    const m = await message.channel.send(`teste`);
    message.member.voiceChannel.join();
  }

});

client.login(config.token);