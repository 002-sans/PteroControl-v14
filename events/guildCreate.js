const Discord = require("discord.js");
const config = require("../config");

module.exports = async (client, guild) => {
  let embed = new Discord.EmbedBuilder()
    .setAuthor({name: "PteroControl | Information", iconURL: client.user.avatarURL()})
    .setColor("RANDOM")
    .setThumbnail(guild.iconURL())
    .setDescription("Thank you for adding me to your discord server! to get all command information type `-help`, if you needing help join our support server by clicking the button!");
  
  let button = new Discord.ButtonBuilder()
    .setLabel("Support Server")
    .setStyle(Discord.ButtonStyle.Link)
    .setURL(config.inviteSupport);

  const owner = await guild.members.fetch(guild.ownerId)
  owner.send({ embeds: [embed], components: [new Discord.ActionRowBuilder().addComponents(button)] });
};