const Discord = require('discord.js')
const prefix = require("../models/prefix.js");
exports.run = async (client, message, args) => {
  let gprefix = "-";

    prefix.find({ GUILDID: message.guild.id }).then(async (guildprefix) => {
        if (guildprefix.length > 0) gprefix = guildprefix[0].PREFIX
            let embed0 = new Discord.EmbedBuilder()
                .setTitle("PteroControl | Tutoriel Etape 1")
                .setColor("E5BE11")
                .setDescription("Accédez à votre pannel d’hébergement et copiez l’URL/LIEN du pannel")
                .setImage("https://media.discordapp.net/attachments/796243715014131714/870935938413494302/Screenshot_2021-07-31-14-14-00-45.jpg")
                .setFooter({text: "Appuie sur '>>' pout afficher l'étape suivante"});

            let embed1 = new Discord.EmbedBuilder()
                .setTitle("PteroControl | Tutoriel Etape 2")
                .setColor("E5BE11")
                .setDescription("Cliquez sur le bouton Profil en haut à droite.")
                .setImage("https://media.discordapp.net/attachments/796243715014131714/870929432846671932/20210731_142210.jpg")
                .setFooter({text: "Appuie sur '>>' pout afficher l'étape suivante"});

            let embed2 = new Discord.EmbedBuilder()
                .setTitle("PteroControl | Tutoriel Etape 3")
                .setColor("E5BE11")
                .setDescription("Allez au bouton API Credentials en haut à gauche")
                .setImage("https://media.discordapp.net/attachments/796243715014131714/870929432595009576/20210731_142103.jpg")
                .setFooter({text: "Appuie sur '>>' pout afficher l'étape suivante"});

            let embed3 = new Discord.EmbedBuilder()
                .setTitle("PteroControl | Tutoriel Etape 4")
                .setColor("E5BE11")
                .setDescription("Remplissez la description de tout ce que vous voulez et appuyez sur créer, vous n’avez pas besoin de remplir")
                .setImage("https://media.discordapp.net/attachments/796243715014131714/870929432095911946/20210731_142012.jpg")
                .setFooter({text: "Appuie sur '>>' pout afficher l'étape suivante"});

            let embed4 = new Discord.EmbedBuilder()
                .setTitle("PteroControl | Tutoriel Etape 5")
                .setColor("E5BE11")
                .setDescription("Copiez le pannel ApiKey qui vient d’apparaître sur votre écran")
                .setImage("https://media.discordapp.net/attachments/796243715014131714/870929431848435762/20210731_141910.jpg")
                .setFooter({text: "Appuie sur '>>' pout afficher l'étape suivante"});

            let embed5 = new Discord.EmbedBuilder()
                .setTitle("PteroControl | Tutoriel Etape 6")
                .setColor("E5BE11")
                .setDescription(`Ecrit \`${gprefix}control\`, sélectionnez le bouton d’enregistrement ou enregistrez le nouveau menu du pannel, et vérifiez vos dms`)
                .setImage("https://media.discordapp.net/attachments/796243715014131714/870929906182258728/20210731_142350.jpg")
                .setFooter({text: "Appuie sur '>>' pout afficher l'étape suivante"});

            let embed6 = new Discord.EmbedBuilder()
                .setTitle("PteroControl | Tutoriel Etape 7")
                .setColor("E5BE11")
                .setDescription("Tapez l’URL/LIEN de votre pannel")
                .setImage("https://media.discordapp.net/attachments/796243715014131714/870931067849302066/IMG_20210731_142808.jpg")
                .setFooter({text: "Appuie sur '>>' pout afficher l'étape suivante"});

            let embed7 = new Discord.EmbedBuilder()
                .setTitle("PteroControl | Tutoriel Etape 8")
                .setColor("E5BE11")
                .setDescription("Colle ta clé d'API de ton panel")
                .setImage("https://media.discordapp.net/attachments/796243715014131714/870931068084191272/IMG_20210731_142820.jpg")
                .setFooter({text: "Appuie sur '>>' pout afficher l'étape suivante"});

            let embed8 = new Discord.EmbedBuilder()
                .setTitle("PteroControl | Tutoriel Etape 9")
                .setColor("E5BE11")
                .setDescription("Ecrit le nom du panel")
                .setImage("https://media.discordapp.net/attachments/796243715014131714/870931068407136296/IMG_20210731_142835.jpg")
                .setFooter({text: "Appuie sur '>>' pout afficher l'étape suivante"});

            let embed9 = new Discord.EmbedBuilder()
                .setTitle("PteroControl | Tutoriel Etape 10")
                .setColor("E5BE11")
                .setDescription(`Ecrit \`${gprefix}control\` de nouveau et séléctionne ton serveur`)
                .setImage("https://media.discordapp.net/attachments/796243715014131714/870931249169055795/Screenshot_2021-07-31-14-29-47-46_572064f74bd5f9fa804b05334aa4f912.jpg")
                .setFooter({text: "Appuie sur '>>' pout afficher l'étape suivante"});

            let embed10 = new Discord.EmbedBuilder()
                .setTitle("PteroControl | Tutorial End")
                .setColor("E5BE11")
                .setDescription("Merci d'utiliser pteroControl.!")
                .setImage("https://media.discordapp.net/attachments/796243715014131714/870932824046338089/20210731_143542.jpg")
                .setFooter({text: "Press '>>' Button to go back to first Step"});

            await createSimpleSlider(
                message,
                [
                    embed0,
                    embed1,
                    embed2,
                    embed3,
                    embed4,
                    embed5,
                    embed6,
                    embed7,
                    embed8,
                    embed9,
                    embed10,
                ], client
            );
        })
};

/**
 * @param {Discord.Message} message
*/
async function createSimpleSlider(message, embeds, client){
    let currentPage = 0;
    let interactiveButtons;
    let Pagemax = embeds.length;

    const fowardButton = new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Secondary)
        .setLabel("▶")
        .setCustomId('next-page');

    const backButton = new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Secondary)
        .setLabel("◀")
        .setCustomId('back-page');

    interactiveButtons = new Discord.ActionRowBuilder().addComponents([backButton, fowardButton])
    const msg = await message.channel.send({ components: [interactiveButtons], embeds: [embeds[0]] });

    const collector = msg.createMessageComponentCollector();
    collector.on('collect', b => {
        if (b.user.id !== message.author.id) return b.reply({content: "Vous ne pouvez pas utiliser cette interaction", ephemeral: true})
        b.deferUpdate().catch(() => false);
        if (b.customId == 'next-page') {
            (currentPage + 1 == embeds.length ? currentPage = 0 : currentPage += 1);
            msg.edit({ embeds:[ embeds[currentPage]], components: [interactiveButtons] });
        }
        if (b.customId == 'back-page') {
            (currentPage - 1 < 0 ? currentPage = embeds.length - 1 : currentPage -= 1);
            msg.edit({ embeds: [embeds[currentPage]], components: [interactiveButtons] });
        }
    })
}