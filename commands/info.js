const Discord = require("discord.js");
const config = require("../config")


exports.run = (client, message, args) => {
    let totalSeconds = client.uptime / 1000;
    let days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.floor(totalSeconds % 60);

    let uptime = `${days} jours, ${hours} heures, ${minutes} minutes et ${seconds} secondes`;

    let button = new Discord.ButtonBuilder()
        .setLabel("Support Server")
        .setStyle(Discord.ButtonStyle.Link)
        .setURL(config.inviteSupport);
    let button1 = new Discord.ButtonBuilder()
        .setLabel("Invite Bot")
        .setStyle(Discord.ButtonStyle.Link)
        .setURL(config.inviteLink);
    
    let row = new Discord.ActionRowBuilder().addComponents([button, button1]);
    let helpEmbed = new Discord.EmbedBuilder()
        .setColor("E5BE11")
        .setTitle("PteroControl | Information")
        .setThumbnail(client.user.avatarURL())
        .setDescription(`**Ping** : ${client.ws.ping}ms\n**Uptime** : ${uptime}\n\nAuteur:\n\`Hirzi#8701\`\n\`AcktarDevs#6724\`\nRemade: \`002.sans\``)
        .setFooter({text: `(C) 2021 PteroControl Client | Pour Pterodactyl V1.x`});
    message.channel.send({ embeds: [helpEmbed], components: [row] });
};
