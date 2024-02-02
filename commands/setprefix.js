const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const prefix = require("../models/prefix.js");

exports.run = (client, message, args) => {
    let title = "PteroControl | Paramètres du serveur";
    let footer = "PteroControl Pour Pterodactyl 1.x";
    let color = "E5BE11";
    let thumbnail = client.user.avatarURL();

    const NoArgs = new EmbedBuilder()
        .setTitle(title)
        .setFooter({text: footer})
        .setThumbnail(thumbnail)
        .setColor(color)
        .setDescription("Utilisation `-setprefix <prefix>`");

    const NoPerm = new EmbedBuilder()
        .setTitle(title)
        .setFooter({text: footer})
        .setThumbnail(thumbnail)
        .setColor(color)
        .setDescription("Tu as besoin de la permission `Gérer le serveur` pour utiliser cette commande");

    const Success = new EmbedBuilder()
        .setTitle(title)
        .setFooter({text: footer})
        .setThumbnail(thumbnail)
        .setColor(color)
        .setDescription("Le prefix du serveur a été changé avec succès");

    const errorDB = new EmbedBuilder()
        .setDescription("Nous rencontrons des problèmes avec notre base de donnée, ce problème sera fixé le plus rapidement possible!")
        .setTitle(title)
        .setFooter({text: footer})
        .setColor(color)
        .setThumbnail(thumbnail);

    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) return message.reply({embeds: [NoPerm]});
    if (!args[0]) return message.reply({embeds: [NoArgs]});

    try {
        const newprefix = new prefix({ GUILDID: message.guild.id, PREFIX: args[0] });
        newprefix.save();
        message.reply({embeds: [Success]});
    } catch (error) {
        message.reply({embeds: [errorDB]});
    }
};