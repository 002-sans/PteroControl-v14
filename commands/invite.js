const { EmbedBuilder, ButtonStyle, ButtonBuilder, ActionRowBuilder } = require("discord.js");

exports.run = (client, message, args) => {
  let embed = new EmbedBuilder()
    .setDescription("Vous pouvez inviter le bot en appuyant sur le bouton ci dessous")
    .setColor("E5BE11")
    .setTitle("PteroControl | Information")
    .setThumbnail(client.user.avatarURL())
    .setFooter({text: `PteroControl Pour Pterodactyl V1.x`});

  let button = new ButtonBuilder()
    .setLabel("Invite")
    .setStyle(ButtonStyle.Link)
    .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot+applications.commands`);

  const row = new ActionRowBuilder().addComponents(button)

  message.channel.send({ embeds: [embed], components: [row] });
};
