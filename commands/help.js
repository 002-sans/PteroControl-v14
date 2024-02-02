exports.run = (client, message, args) => {
  const Discord = require("discord.js");
  const prefix = require('../models/prefix.js')
  let gprefix = '-'

  prefix.find({ GUILDID: message.guild.id }).then((guildprefix) => {
    if (guildprefix.length > 0) gprefix = guildprefix[0].PREFIX
    let helpEmbed = new Discord.EmbedBuilder()
      .setColor("E5BE11")
      .setTitle("PteroControl | Help Menu")
      .setThumbnail(client.user.avatarURL())
      .addFields({name: gprefix + "control", value: "```Commande principal pour gérer les serveurs```"})
      .addFields({name: gprefix + "info", value: "```Affiche les informations du bot```"})
      .addFields({name: gprefix + "invite", value: "```Invite ce bot dans votre serveur```"})
      .addFields({name: gprefix + "tutorial", value: "```Un tutoriel de comment utiliser le bot```"})
      .setFooter({text: `(C) 2021 PteroControl Client | Pour Pterodactyl V1.x`})
      message.channel.send({embeds: [helpEmbed]});
  })
}