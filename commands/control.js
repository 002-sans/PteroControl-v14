exports.run = (client, message, args) => {
  const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, StringSelectMenuComponent } = require("discord.js");
  const panel = require("../models/panel.js");
  const node = require("nodeactyl");
  const wait = require("util").promisify(setTimeout);
  const config = require("../config")

  let panelURL;
  let panelAPI;
  let panelNAME;
  let color = "E5BE11";
  let id = message.author.id;
  let thumbnail = client.user.avatarURL();
  let footer = "PteroControl Pour Pterodactyl 1.x";
  let panelTitle = "PteroControl | Gestion du Panel";
  let serverTitle = "PteroControl | Gestion du Serveur";
  let accountTitle = "PteroControl | Gestion du Compte";

  const Discord = new ButtonBuilder()
    .setLabel("Support")
    .setStyle(5)
    .setURL(config.inviteSupport);

  const errorDB = new EmbedBuilder()
    .setDescription("Notre fournisseur de base de données connaît actuellement un temps d’arrêt. Il devrait être résolu dans les 30 prochaines minutes. Désolé pour tout inconvénient causé!")
    .setTitle(panelTitle)
    .setFooter({text: footer})
    .setColor(color)
    .setThumbnail(thumbnail);

  const close = new ButtonBuilder()
    .setLabel("Fermer")
    .setStyle(4)
    .setCustomId("close");

  const closeEmbed = new EmbedBuilder()
    .setDescription("Procéssus terminé")
    .setTitle(panelTitle)
    .setFooter({text: footer})
    .setColor(color)
    .setThumbnail(thumbnail);

  const loading = new EmbedBuilder()
    .setTitle(panelTitle)
    .setFooter({text: footer})
    .setColor(color)
    .setThumbnail(thumbnail)
    .setDescription("Requête en cours de traitement...");

  const embedExit = new EmbedBuilder()
    .setTitle(panelTitle)
    .setFooter({text: footer})
    .setColor(color)
    .setThumbnail(thumbnail)
    .setDescription("Le panel avec ce nom existe déjà dans votre compte discord, veuillez utiliser un autre nom");

  panel.find({ ID: id }).then((panels) => {
    const noPanel = new EmbedBuilder()
    .setDescription("Vous n’avez actuellement pas de panel lié à notre API. Vous pouvez cliquer sur le bouton d’enregistrement pour en enregistrer un. Tout ce dont vous avez besoin est l’URL du panel et une clé API client!")
    .setTitle(panelTitle)
    .setFooter({text: footer})
    .setColor(color)
    .setThumbnail(thumbnail);

    const register = new ButtonBuilder()
      .setLabel("Crée un nouveau panel")
      .setStyle(ButtonStyle.Success)
      .setCustomId("register");

      const registerRow = new ActionRowBuilder().addComponents([register, Discord]);

      const reSucess = new EmbedBuilder()
        .setColor(color)
        .setThumbnail(thumbnail)
        .setFooter({text: footer})
        .setDescription(`Votre panel a été enregistré avec succès sur notre api. Vous pouvez maintenant y accéder via le menu du panel n[Rejoindre le serveur support (Clique Ici)](${config.inviteSupport})`);

      const reEmbed = new EmbedBuilder()
        .setColor(color)
        .setFooter({text: footer})
        .setImage("https://cdn.glitch.com/b0cc99ff-cc1d-46a0-8146-a13e39873cd9%2F20210625_111805.jpg?v=1624612831266");

      const reName = new EmbedBuilder()
        .setFooter({text: footer})
        .setColor(color)
        .setDescription("Entre un nom de panel qui sera utiliser pour plusieurs panels **(N'importe quoi)**" );

      const reUrl = new EmbedBuilder()
        .setFooter({text: footer})
        .setColor(color)
        .setDescription("Envoie l'url du panel. Exemple: **(https://panel.pterocontrol.com)**");

      const reApi = new EmbedBuilder()
        .setFooter({text: footer})
        .setColor(color)
        .setDescription("Envoie votre API client. Exemple: `h9eVJyejq3d97yQfuY55CxSWs73u9lC9gFfW0FutBR9hNfw`\n\nIl faut utiliser `Clé d'API Client` et pas `Clé d'api Admin`");

      const reDm = new EmbedBuilder()
        .setColor(color)
        .setTitle(panelTitle)
        .setThumbnail(thumbnail)
        .setFooter({text: footer})
        .setDescription("Pour des raisons de protection de la vie privée, l’action demandée aura lieu dans vos DM. Veuillez vous assurer que vous êtes autorisé à recevoir des DM de ce serveur");

      if (panels.length < 1)
        message.channel.send({ embeds: [noPanel], components: [registerRow] })
          .then((remsg) => {
            const Registercollector = remsg.createMessageComponentCollector({
              max: 1,
              time: 30000,
            });

            Registercollector.on("collect", (b) => {
              if (b.user.id !== message.author.id) return b.reply({content: "Vous ne pouvez pas utiliser cette interaction", ephemeral: true})
              b.deferUpdate().catch(() => false)
              if (b.customId === "register") {
                remsg.edit({ embeds: [reDm], components: [new ActionRowBuilder().addComponents(Discord)] });
                b.user.send({ embeds: [reEmbed] }).then((m) => {
                  let c = m.channel;

                  c.send({embeds: [reUrl]}).then(async function () {
                    await c
                      .awaitMessages({
                        filter: (m) => m.author.id == message.author.id,
                        max: 1,
                        time: 30000,
                      })
                      .then(async (collected) => {
                        panelURL = collected.first().content;
                      })
                      .then(async function () {
                        await c.send({embeds: [reApi]}).then(async function () {
                          c.awaitMessages(
                            { filter: (m) => m.author.id == message.author.id, max: 1, time: 30000 }
                          )
                            .then(async (collected) => {
                              panelAPI = collected.first().content;
                            })
                            .then(async function () {
                              await c.send({embeds: [reName]}).then(async function () {
                                c.awaitMessages(                                  
                                  { filter: (m) => m.author.id == message.author.id, max: 1, time: 30000 }
                                ).then(async (collected) => {
                                  panelNAME = collected.first().content;
                                  if (panelNAME.length > 100)
                                    return c.send(
                                      "**Limite de caractère:** `25`"
                                    );
                                  panel
                                    .find({
                                      ID: id,
                                      NAME: panelNAME.trim(),
                                    })
                                    .then((exit) => {
                                      if (exit.length > 0)
                                        return c.send({embeds: [embedExit]});
                                    })
                                    .catch((error) => {
                                      console.log(error);
                                      c.send({ embeds: [errorDB] });
                                    });
                                  try {
                                    const npanel = new panel({
                                      ID: id,
                                      API: panelAPI.trim(),
                                      URL: panelURL.trim(),
                                      NAME: panelNAME.trim(),
                                    });
                                    await npanel.save();
                                    c.send({ embeds: [reSucess] });
                                  } catch (error) {
                                    console.log(error);
                                    c.send({ embeds: [errorDB] });
                                  }
                                });
                              });
                            });
                        });
                      });
                  });
                });
              }
            });
          });

      if (panels.length < 1) return;

      let panelist;
      let options = [];

      const reMenu = new StringSelectMenuOptionBuilder()
        .setLabel("Enregistre un nouveau panel")
        .setValue("register");
        
      const closeMenu = new StringSelectMenuOptionBuilder()
        .setLabel("Fermer")
        .setValue("close");

      options.push(reMenu);
      options.push(closeMenu);
      panels.forEach((data) => {
        let option = new StringSelectMenuOptionBuilder()
          .setLabel(data.NAME)
          .setValue(data.NAME);

        options.push(option);

        if (!panelist) return (panelist = "**" + data.NAME + "**\n");
        panelist = panelist + "**" + data.NAME + "**\n";
      });

      const panelEmbed = new EmbedBuilder()
        .setTitle(panelTitle)
        .setFooter({text: footer})
        .setThumbnail(thumbnail)
        .setColor(color)
        .setDescription("Séléctionne un panel à gérer\n" + panelist);

      const panelMenu = new StringSelectMenuBuilder().setOptions(options).setMaxValues(1).setMinValues(1).setCustomId("pmenu");

      message.channel
        .send({ embeds: [panelEmbed], components: [new ActionRowBuilder().addComponents(panelMenu)] })
        .then((panelmsg) => {
          const Panelcollector = panelmsg.createMessageComponentCollector({
            max: 1,
            time: 30000,
          });
          Panelcollector.on("collect", async (m) => {
            if (m.user.id !== message.author.id) return m.reply({content: "Vous ne pouvez pas utiliser cette interaction", ephemeral: true})
            m.deferUpdate().catch(() => false)
            if (m.values[0] === "close") {
              panelmsg
                .edit({ embeds: [closeEmbed], components: [] })
                .then((msg) => {
                  msg.delete({ timeout: 5000 });
                });
            }
            if (m.values[0] === "register") {
              panelmsg.edit({ embeds: [reDm], components: [new ActionRowBuilder().addComponents(Discord)] });
              m.user.send({ embeds: [reEmbed] }).then((m) => {
                let c = m.channel;

                c.send({embeds: [reUrl]}).then(async function () {
                  await c
                    .awaitMessages({
                      filter: (m) => m.author.id == message.author.id,
                      max: 1,
                      time: 30000,
                    })
                    .then(async (collected) => {
                      panelURL = collected.first().content;
                    })
                    .then(async function () {
                      await c.send({embeds: [reApi]}).then(async function () {
                        c.awaitMessages(
                          { filter: (m) => m.author.id == message.author.id, max: 1, time: 30000 }
                        )
                          .then(async (collected) => {
                            panelAPI = collected.first().content;
                          })
                          .then(async function () {
                            await c.send({embeds: [reName]}).then(async function () {
                              c.awaitMessages(                                
                                { filter: (m) => m.author.id == message.author.id, max: 1, time: 30000 }
                              ).then(async (collected) => {
                                panelNAME = collected.first().content;
                                if (panelNAME.length > 100)
                                  return c.send(
                                    "**Limite de caractère:** `25`"
                                  );
                                panel
                                  .find({
                                    ID: id,
                                    NAME: panelNAME.trim(),
                                  })
                                  .then((exit) => {
                                    if (exit.length > 0)
                                      return c.send({embeds: [embedExit]});
                                  })
                                  .catch((error) => {
                                    console.log(error);
                                    c.send({ embeds: [errorDB] });
                                  });
                                try {
                                  const npanel = new panel({
                                    ID: id,
                                    API: panelAPI.trim(),
                                    URL: panelURL.trim(),
                                    NAME: panelNAME.trim(),
                                  });
                                  await npanel.save();
                                  c.send({ embeds: [reSucess] });
                                } catch (error) {
                                  console.log(error);
                                  c.send({ embeds: [errorDB] });
                                }
                              });
                            });
                          });
                      });
                    });
                });
              });
            } else {
              await panelmsg.edit({ embeds: [loading], components: [] });
              await wait(1500);
              panel
                .find({
                  ID: id,
                  NAME: m.values[0],
                })
                .then((fpanel) => {
                  const panelManage = new EmbedBuilder()
                    .setTitle(panelTitle)
                    .setFooter({text: footer})
                    .setThumbnail(thumbnail)
                    .setColor(color)
                    .setDescription("Que veux tu faire avec " + m.values[0]);

                  const pManage = new ButtonBuilder()
                    .setLabel("Serveurs")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("pManage");

                  const pDelete = new ButtonBuilder()
                    .setLabel("Supprimer")
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId("pDelete");

                  const pUrl = new ButtonBuilder()
                    .setLabel("Lien du Panel")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("pUrl");

                  const pEdit = new ButtonBuilder()
                    .setLabel("Modifier")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("pEdit");

                  const pAcc = new ButtonBuilder()
                    .setLabel("Compte")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("pAcc");

                  const pManageRow = new ActionRowBuilder().addComponents([
                    pManage,
                    pEdit,
                    pUrl,
                    pAcc,
                    pDelete
                  ]);
                  const pCloseRow = new ActionRowBuilder().addComponents(close);

                  panelmsg.edit({
                    embeds: [panelManage],
                    components: [pManageRow, pCloseRow],
                  });

                  Panelcollector.stop();


                  const panelManageCollector = panelmsg.createMessageComponentCollector(
                    { max: 1, time: 30000 }
                  );

                  panelManageCollector.on("collect", async (pm) => {
                    if (pm.user.id !== message.author.id) return pm.reply({content: "Vous ne pouvez pas utiliser cette interaction", ephemeral: true})
                    pm.deferUpdate().catch(() => false)
                    if (pm.customId === "close") {
                      panelmsg
                        .edit({ embeds: [closeEmbed], components: [] })
                        .then((msg) => {
                          setTimeout(() => msg.delete(), 5000);
                        });
                    }
                    if (pm.customId === "pAcc") {
                      await panelmsg.edit({ embeds: [loading], components: [] });
                      await wait(1500);
                      const Client = new node.NodeactylClient(
                        fpanel[0].URL,
                        fpanel[0].API
                      );

                      Client.getAccountDetails().then((acc) => {
                        let content;
                        let newcontent;

                        const currectPass = new EmbedBuilder()
                          .setFooter({text: footer})
                          .setColor(color)
                          .setDescription(
                            "Veuillez envoyer le mot de passe de ce panel"
                          );

                        const newEmail = new EmbedBuilder()
                          .setFooter({text: footer})
                          .setColor(color)
                          .setDescription(
                            "Veuillez envoyer le nouveau mot de passe du panel"
                          );

                        const newPassword = new EmbedBuilder()
                          .setFooter({text: footer})
                          .setColor(color)
                          .setDescription(
                            "Veuillez envoyer le nouveau mot de passe du panel"
                          );

                        const successAcc = new EmbedBuilder()
                          .setFooter({text: footer})
                          .setColor(color)
                          .setDescription(
                            "Demande envoyée au pannel, si vous ne vous êtes pas déconnecté du pannel, cela signifie que votre mot de passe actuel est incorrect, pour une mise à jour future, cela enverra une erreur d’intégration si vous mettez un mot de passe actuel incorrect"
                          );

                        const accEmbed = new EmbedBuilder()
                          .setTitle(accountTitle)
                          .setFooter({text: footer})
                          .setColor(color)
                          .setThumbnail(thumbnail)
                          .setDescription(
                            "Tu veux modifier ton compte ptero?\n```\nUsername: " +
                              acc.username +
                              "\nID: " +
                              acc.id +
                              "\nAdmin: " +
                              acc.admin +
                              "\n```"
                          );

                        const updateEmail = new ButtonBuilder()
                          .setLabel("Update Email")
                          .setStyle(ButtonStyle.Primary)
                          .setCustomId("email");

                        const updatePass = new ButtonBuilder()
                          .setLabel("Update Password")
                          .setStyle(ButtonStyle.Primary)
                          .setCustomId("password");

                        const viewEmail = new ButtonBuilder()
                          .setLabel("View Email")
                          .setStyle(ButtonStyle.Primary)
                          .setCustomId("vemail");

                        const accRow = new ActionRowBuilder().addComponents([
                          updateEmail,
                          updatePass,
                          viewEmail,
                          close
                        ]);

                        panelmsg.edit({ embeds: [accEmbed], components: [accRow] });

                        const accountCollector = panelmsg.createMessageComponentCollector(
                          { max: 1, time: 30000 }
                        );

                        accountCollector.on("collect", (ac) => {
                          if (ac.user.id !== message.author.id) return ac.reply({content: "Vous ne pouvez pas utiliser cette interaction", ephemeral: true})
                          ac.deferUpdate().catch(() => false)
                          if (ac.customId === "email") {
                            panelmsg.edit({ embeds: [reDm], components: [new ActionRowBuilder().addComponents(Discord)] });
                            m.user
                              .send({ embeds: [reEmbed] })
                              .then((m) => {
                                let c = m.channel;

                                c.send({embeds: [currectPass]}).then(async function () {
                                  await c
                                    .awaitMessages(
                                      { filter: (m) => m.author.id == message.author.id, max: 1, time: 30000 }
                                    )
                                    .then(async (collected) => {
                                      content = collected.first().content;
                                    })
                                    .then(async function () {
                                      await c
                                        .send({embeds: [newEmail]})
                                        .then(async function () {
                                          c.awaitMessages(
                                            { filter: (m) =>
                                              m.author.id == message.author.id, max: 1, time: 30000 }
                                          ).then(async (collected) => {
                                            newcontent =
                                              collected.first().content;

                                            Client.updateEmail(
                                              newcontent,
                                              content
                                            )
                                              .then((success) => {
                                                return c.send({embeds: [successAcc]});
                                              })
                                              .catch((error) => {
                                                console.log(error);
                                                return c.send("Quelque chose c'est mal passé");
                                              });
                                          });
                                        });
                                    });
                                });
                              });
                          }
                          if (ac.customId === "password") {
                            panelmsg.edit({ embeds: [reDm], components: [new ActionRowBuilder().addComponents(Discord)] });
                            m.user
                              .send({ embeds: [reEmbed] })
                              .then((m) => {
                                let c = m.channel;

                                c.send({embeds: [currectPass]}).then(async function () {
                                  await c
                                    .awaitMessages(
                                      { filter: (m) => m.author.id == message.author.id, max: 1, time: 30000 }
                                    )
                                    .then(async (collected) => {
                                      content = collected.first().content;
                                    })
                                    .then(async function () {
                                      await c
                                        .send({embeds: [newPassword]})
                                        .then(async function () {
                                          c.awaitMessages(
                                            { filter: (m) => m.author.id == message.author.id, max: 1, time: 30000 }
                                          ).then(async (collected) => {
                                            newcontent =
                                              collected.first().content;

                                            Client.updatePassword(
                                              newcontent,
                                              content
                                            )
                                              .then((success) => {
                                                return c.send({embeds: [successAcc]});
                                              })
                                              .catch((error) => {
                                                console.log(error);
                                                return c.send("Erreur...");
                                              });
                                          });
                                        });
                                    });
                                });
                              });
                          }
                          if (ac.customId === "vemail") {
                            const emailEmbed = new EmbedBuilder()
                              .setTitle(accountTitle)
                              .setFooter({text: footer})
                              .setColor(color)
                              .setThumbnail(thumbnail)
                              .setDescription(
                                "L'email de ce panel est `" +
                                  acc.email +
                                  "`"
                              );

                            ac.reply({
                              embeds: [emailEmbed],
                              ephemeral: true,
                            });
                            panelmsg.delete();
                          }
                        });
                      });
                    }
                    if (pm.customId === "pEdit") {
                      const embedEdit = new EmbedBuilder()
                        .setTitle(panelTitle)
                        .setFooter({text: footer})
                        .setColor(color)
                        .setThumbnail(thumbnail)
                        .setDescription("Veuillez choisir le quel vous voulez supprimer");

                      const updated = new EmbedBuilder()
                        .setTitle(panelTitle)
                        .setFooter({text: footer})
                        .setColor(color)
                        .setThumbnail(thumbnail)
                        .setDescription(fpanel[0].NAME + " mis à jour!");

                      const editName = new ButtonBuilder()
                        .setLabel("Nom")
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId("ename");

                      const editUrl = new ButtonBuilder()
                        .setLabel("Lien")
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId("eurl");

                      const editApi = new ButtonBuilder()
                        .setLabel("Clé API")
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId("ekey");

                      const editRows = new ActionRowBuilder().addComponents([
                        editName,
                        editUrl,
                        editApi
                      ]);

                      panelmsg.edit({ embeds: [embedEdit], components: [editRows] });

                      const EditManageCollector =
                        panelmsg.createMessageComponentCollector({
                          max: 1,
                          time: 30000,
                        });

                      EditManageCollector.on("collect", async (ep) => {
                        if (ep.user.id !== message.author.id) return ep.reply({content: "Vous ne pouvez pas utiliser cette interaction", ephemeral: true})
                        ep.deferUpdate().catch(() => false)
                        if (ep.customId === "ename") {
                          const editm = new EmbedBuilder()
                            .setTitle(panelTitle)
                            .setFooter({text: footer})
                            .setColor(color)
                            .setThumbnail(thumbnail)
                            .setDescription("Veuillez envoyer le nouveau nom du panel");

                          panelmsg.edit({ embeds: [editm], components: [] });

                          await message.channel
                            .awaitMessages(
                              { filter: (m) => m.author.id == message.author.id, max: 1, time: 30000 }
                            )
                            .then(async (collected) => {
                              let newcontent = collected.first().content.trim();

                              panel
                                .find({
                                  ID: id,
                                  NAME: newcontent,
                                })
                                .then((exit) => {
                                  if (exit.length > 0)
                                    return panelmsg.edit({embeds: [embedExit]});
                                  collected.first().delete();
                                })
                                .catch((error) => {
                                  console.log(error);
                                  panelmsg.edit({ embeds: [errorDB] });
                                  collected.first().delete();
                                });

                              panel
                                .findOneAndUpdate(
                                  {
                                    ID: id,
                                    NAME: m.values[0],
                                  },
                                  {
                                    NAME: newcontent,
                                  }
                                )
                                .then(() => {
                                  panelmsg.edit({
                                    embeds: [updated],
                                    components: [],
                                  });
                                })
                                .catch((Error) => {
                                  console.log(Error);
                                  panelmsg.edit({
                                    embeds: [errorDB],
                                    components: [],
                                  });
                                });
                            })
                            .catch((error) => {
                              message.channel.send("Aucune réponse");
                            });
                        }
                        if (ep.customId === "eurl") {
                          const editm = new EmbedBuilder()
                            .setTitle(panelTitle)
                            .setFooter({text: footer})
                            .setColor(color)
                            .setThumbnail(thumbnail)
                            .setDescription("Veillez envoyer l'url du panel");

                          panelmsg.edit({ embeds: [editm], components: [] });

                          await message.channel
                            .awaitMessages(
                              { filter: (m) => m.author.id == message.author.id, max: 1, time: 30000 }
                            )
                            .then(async (collected) => {
                              let newcontent = collected.first().content.trim();

                              panel
                                .findOneAndUpdate(
                                  {
                                    ID: id,
                                    NAME: m.values[0],
                                  },
                                  {
                                    URL: newcontent,
                                  }
                                )
                                .then(() => {
                                  panelmsg.edit({
                                    embeds: [updated],
                                    components: [],
                                  });
                                  collected.first().delete();
                                })
                                .catch((Error) => {
                                  panelmsg.edit({
                                    embeds: [errorDB],
                                    components: [],
                                  });
                                  collected.first().delete();
                                });
                            })
                            .catch((error) => {
                              message.channel.send("Aucune réponse");
                            });
                        }
                        if (ep.customId === "eapi") {
                          const editm = new EmbedBuilder()
                            .setTitle(panelTitle)
                            .setFooter({text: footer})
                            .setColor(color)
                            .setThumbnail(thumbnail)
                            .setDescription("Veuillez envoyer l'API de ce compte");

                          panelmsg.edit({ embeds: [editm], components: [] });

                          await message.channel
                            .awaitMessages(
                              { filter: (m) => m.author.id == message.author.id, max: 1, time: 30000 }
                            )
                            .then(async (collected) => {
                              let newcontent = collected.first().content.trim();

                              panel
                                .findOneAndUpdate(
                                  {
                                    ID: id,
                                    NAME: m.values[0],
                                  },
                                  {
                                    API: newcontent,
                                  }
                                )
                                .then(() => {
                                  panelmsg.edit({
                                    embeds: [updated],
                                    components: [],
                                  });
                                  collected.first().delete();
                                })
                                .catch((Error) => {
                                  panelmsg.edit({
                                    embeds: [errorDB],
                                    components: [],
                                  });
                                  collected.first().delete();
                                });
                            })
                            .catch((error) => {
                              message.channel.send("Aucune réponse");
                            });
                        }
                      });
                    }
                    if (pm.customId === "pUrl") {
                      const embedUrl = new EmbedBuilder()
                        .setTitle(panelTitle)
                        .setFooter({text: footer})
                        .setColor(color)
                        .setThumbnail(thumbnail)
                        .setDescription("Le lien du panel est " + fpanel[0].URL);

                      panelmsg.delete();
                      pm.reply({ embeds: [embedUrl], ephemeral: true });
                    }
                    if (pm.customId === "pDelete") {
                      const pDelEmbed = new EmbedBuilder()
                        .setTitle(panelTitle)
                        .setFooter({text: footer})
                        .setThumbnail(thumbnail)
                        .setColor(color)
                        .setDescription("Panel supprimé de la base de donnée");

                      panel
                        .deleteOne({
                          ID: id,
                          NAME: m.values[0],
                        })
                        .then((res) => {
                          panelmsg
                            .edit({ embeds: [pDelEmbed], components: [] })
                            .then((msg) => {
                              setTimeout(() => msg.delete(), 5000);
                            });
                        })
                        .catch((error) => {
                          panelmsg.edit({ embeds: [errorDB], components: [] });
                        });
                    }
                    if (pm.customId === "pManage") {
                      await panelmsg.edit({ embeds: [loading], components: [] });
                      await wait(1500);
                      const Client = new node.NodeactylClient(
                        fpanel[0].URL,
                        fpanel[0].API
                      );
                      Client.getAllServers()
                        .then((response) => {
                          let serverEmbed = new EmbedBuilder();
                          serverEmbed.setColor(color);
                          serverEmbed.setTitle(serverTitle);
                          serverEmbed.setThumbnail(thumbnail);
                          serverEmbed.setFooter({text: footer});

                          if (response.length == 0) {
                            serverEmbed.setDescription(
                              "Aucun serveur de trouvé sur ce compte ptero"
                            );
                            return panelmsg.edit({embeds: [serverEmbed]});
                          } else {
                            let anothertemp = [];
                            let servers;
                            response.data.map((S) => {
                              let name = S.attributes.name;
                              if (name.length > 50) name + "Limite de Nom";
                              let somemenu = new StringSelectMenuOptionBuilder();
                              somemenu.setLabel(name);
                              somemenu.setValue(S.attributes.identifier);
                              anothertemp.push(somemenu);

                              const srv = S.attributes;

                              if (!servers)
                                return (servers =
                                  "**" +
                                  srv.name +
                                  "** [`" +
                                  srv.identifier +
                                  "`]\n```\nnode: " +
                                  srv.node +
                                  "\nip: " +
                                  srv.relationships.allocations.data[0]
                                    .attributes.ip +
                                  ":" +
                                  srv.relationships.allocations.data[0]
                                    .attributes.port +
                                  "\nSuspendu: " +
                                  srv.is_suspended +
                                  "\nInstallation: " +
                                  srv.is_installing +
                                  "\n```\n");
                              servers =
                                servers +
                                "**" +
                                srv.name +
                                "** [`" +
                                srv.identifier +
                                "`]\n```\nnode: " +
                                srv.node +
                                "\nip: " +
                                srv.relationships.allocations.data[0].attributes
                                  .ip +
                                ":" +
                                srv.relationships.allocations.data[0].attributes
                                  .port +
                                "\nSuspendu: " +
                                srv.is_suspended +
                                "\nInstallation: " +
                                srv.is_installing +
                                "\n```\n";
                            });
                            serverEmbed.setDescription(servers);

                            let anothermenu = new StringSelectMenuBuilder();
                            anothermenu.setCustomId("menuagain");
                            anothermenu.addOptions(closeMenu);
                            anothermenu.setPlaceholder("Séléctionne un serveur");
                            anothermenu.addOptions(anothertemp);

                            panelmsg.edit({
                              embeds: [serverEmbed],
                              components: [new ActionRowBuilder().addComponents(anothermenu)],
                            });

                            const Panelcollector = panelmsg.createMessageComponentCollector(
                              { max: 1, time: 30000 }
                            );
                            Panelcollector.on("collect", async (sm) => {
                              if (sm.user.id !== message.author.id) return sm.reply({content: "Vous ne pouvez pas utiliser cette interaction", ephemeral: true})
                              sm.deferUpdate().catch(() => false)
                              if (sm.values[0] === "close") {
                                panelmsg
                                  .edit({ embeds: [closeEmbed], components: [] })
                                  .then((msg) => {
                                    setTimeout(() => msg.delete(), 5000);
                                  });
                              } else {
                                await panelmsg.edit({
                                  embeds: [loading],
                                  components: [],
                                });
                                await wait(1500);

                                try {
                                  const server = await Client.getServerDetails(
                                    sm.values[0]
                                  );
                                  const stats = await Client.getServerUsages(
                                    sm.values[0]
                                  );
                                  const account =
                                    await Client.getAccountDetails(
                                      fpanel[0].URL,
                                      fpanel[0].API
                                    );
                                  const status = stats.current_state;

                                  const currectStatus =
                                    "[Status: " + status + "]";
                                  let maxMemory = server.limits.memory;
                                  if (maxMemory === 0) maxMemory = "illimité";
                                  if (maxMemory !== "unlimited")
                                    maxMemory = maxMemory + " MB";
                                  let maxDisk = server.limits.disk;
                                  if (maxDisk === 0) maxDisk = "illimité";
                                  if (maxDisk !== "unlimited")
                                    maxDisk = maxDisk + " MB";
                                  let maxCPU = server.limits.cpu;
                                  if (maxCPU === 0) maxCPU = "illimité";
                                  if (maxCPU !== "unlimited")
                                    maxCPU = maxCPU + "%";

                                  let currectMemory = formatBytes(
                                    stats.resources.memory_bytes
                                  );
                                  let currectDisk = formatBytes(
                                    stats.resources.disk_bytes
                                  );
                                  let currectCPU = stats.resources.cpu_absolute;

                                  let memory =
                                    "[Mémoire: " +
                                    currectMemory +
                                    "/" +
                                    maxMemory +
                                    "]";
                                  let disk =
                                    "[Disque: " +
                                    currectDisk +
                                    "/" +
                                    maxDisk +
                                    "]";
                                  let cpu =
                                    "[CPU: " + currectCPU + "%/" + maxCPU + "]";

                                  let currectDB = server.databases;
                                  if (`${currectDB}` === "undefined")
                                    currectDB = 0;
                                  let currectBK = server.backups;

                                  if (`${currectBK}` === "undefined")
                                    currectBK = 0;

                                  let databases =
                                    "[Base de données: " +
                                    currectDB +
                                    "/" +
                                    server.feature_limits.databases +
                                    "]";
                                  let backups =
                                    "[Sauvegardes: " +
                                    currectBK +
                                    "/" +
                                    server.feature_limits.backups +
                                    "]";
                                  let allocations =
                                    "[Allocations: " +
                                    server.relationships.allocations.data
                                      .length +
                                    "/" +
                                    server.feature_limits.allocations +
                                    "]";

                                  let sftpLink =
                                    server.sftp_details.ip +
                                    ":" +
                                    server.sftp_details.port;
                                  let sftpUser =
                                    account.username + "." + server.identifier;

                                  const sftpEmbed = new EmbedBuilder()
                                    .setTitle(serverTitle)
                                    .setColor(color)
                                    .setFooter({text: footer})
                                    .setDescription(
                                      "SFTP Details:\n```\nAdresse du serveur: " +
                                        sftpLink +
                                        "\nPseudo: " +
                                        sftpUser +
                                        "\n```"
                                    );

                                  const serverSelected = new EmbedBuilder()
                                    .setAuthor({name: serverTitle})
                                    .setTitle(
                                      "[Controle: " + server.name + "]"
                                    )
                                    .setColor(color)
                                    .setFooter({text: footer})
                                    .setDescription(
                                      "Ressource du serveur:\n```\n" +
                                        currectStatus +
                                        "\n" +
                                        cpu +
                                        "\n" +
                                        memory +
                                        "\n" +
                                        disk +
                                        "\n```\nFonctionnalités du serveur:\n```\n" +
                                        databases +
                                        "\n" +
                                        backups +
                                        "\n" +
                                        allocations +
                                        "\n```"
                                    );

                                  const serverStart = new ButtonBuilder();
                                  serverStart.setLabel("Lancer");
                                  serverStart.setStyle(ButtonStyle.Primary);
                                  serverStart.setCustomId("start");

                                  const serverSFTP = new ButtonBuilder()
                                    .setLabel("SFTP")
                                    .setStyle(ButtonStyle.Primary)
                                    .setCustomId("sftp");

                                  const serverStop = new ButtonBuilder();
                                  serverStop.setLabel("Arrêter");
                                  serverStop.setStyle(4);
                                  serverStop.setCustomId("stop");

                                  const serverKill = new ButtonBuilder();
                                  serverKill.setLabel("Kill");
                                  serverKill.setStyle(4);
                                  serverKill.setCustomId("kill");

                                  const serverRestart = new ButtonBuilder();
                                  serverRestart.setLabel("Relancer");
                                  serverRestart.setStyle(ButtonStyle.Primary);
                                  serverRestart.setCustomId("restart");

                                  const serverSend = new ButtonBuilder();
                                  serverSend.setLabel("Envoyer une commande");
                                  serverSend.setStyle(ButtonStyle.Primary);
                                  serverSend.setCustomId("send");

                                  const serverUser = new ButtonBuilder();
                                  serverUser.setLabel("Subusers");
                                  serverUser.setStyle(ButtonStyle.Primary);
                                  serverUser.setCustomId("user");
                                  //serverUser.setDisabled(true)

                                  const serverMnBkp = new ButtonBuilder();
                                  serverMnBkp.setLabel("Backups");
                                  serverMnBkp.setStyle(ButtonStyle.Primary);
                                  serverMnBkp.setCustomId("backup");
                                  //serverMnBkp.setDisabled(true)

                                  const serverInstal = new ButtonBuilder();
                                  serverInstal.setLabel("Re installer");
                                  serverInstal.setStyle(4);
                                  serverInstal.setCustomId("install");

                                  const serverRename = new ButtonBuilder()
                                    .setLabel("Renommer")
                                    .setStyle(ButtonStyle.Primary)
                                    .setCustomId("rename");

                                  const serverStopped = new EmbedBuilder()
                                    .setTitle(serverTitle)
                                    .setFooter({text: footer})
                                    .setColor(color)
                                    .setThumbnail(thumbnail)
                                    .setDescription(
                                      "Serveur arrêter avec succès"
                                    );

                                  const serverKilled = new EmbedBuilder()
                                    .setTitle(serverTitle)
                                    .setFooter({text: footer})
                                    .setColor(color)
                                    .setThumbnail(thumbnail)
                                    .setDescription(
                                      "Serveur kill avec succès"
                                    );

                                  const serverStarted = new EmbedBuilder()
                                    .setTitle(serverTitle)
                                    .setFooter({text: footer})
                                    .setColor(color)
                                    .setThumbnail(thumbnail)
                                    .setDescription(
                                      "Serveur lancé avec succès"
                                    );

                                  const serverRestarted = new EmbedBuilder()
                                    .setTitle(serverTitle)
                                    .setFooter({text: footer})
                                    .setColor(color)
                                    .setThumbnail(thumbnail)
                                    .setDescription(
                                      "Serveur relancé avec succès"
                                    );

                                  const serverReinstalled = new EmbedBuilder()
                                    .setTitle(serverTitle)
                                    .setFooter({text: footer})
                                    .setColor(color)
                                    .setThumbnail(thumbnail)
                                    .setDescription(
                                      "Server succesfully reinstalled"
                                    );

                                  const serverSended = new EmbedBuilder()
                                    .setTitle(serverTitle)
                                    .setFooter({text: footer})
                                    .setColor(color)
                                    .setThumbnail(thumbnail)
                                    .setDescription(
                                      "Commande envoyée !"
                                    );

                                  const userAdd = new ButtonBuilder()
                                    .setLabel("Utilisateur en plus")
                                    .setStyle(ButtonStyle.Primary)
                                    .setCustomId("newUser");

                                  const bkpAdd = new ButtonBuilder()
                                    .setLabel("Nouvelle backup")
                                    .setStyle(ButtonStyle.Primary)
                                    .setCustomId("newBkp");

                                  const userRow =
                                    new ActionRowBuilder().addComponents([
                                      userAdd,
                                      close
                                    ]);

                                  const bkpRow =
                                    new ActionRowBuilder().addComponents([
                                      bkpAdd,
                                      close
                                    ]);

                                  if (
                                    status === "running" ||
                                    status === "starting"
                                  ) {
                                    serverStart.setDisabled(true);

                                    const serverControl =
                                      new ActionRowBuilder().addComponents([
                                        serverStart,
                                        serverRestart,
                                        serverSend,
                                        serverStop,
                                        serverKill
                                      ]);

                                    const serverMngControl =
                                      new ActionRowBuilder().addComponents([
                                        serverSFTP,
                                        serverUser,
                                        serverMnBkp,
                                        serverRename,
                                        serverInstal
                                      ]);

                                    const closerow =
                                      new ActionRowBuilder().addComponents(
                                        close
                                      );

                                    panelmsg.edit({
                                      embeds: [serverSelected],
                                      components: [
                                        serverControl,
                                        serverMngControl,
                                        closerow,
                                      ],
                                    });

                                    const serverControlCollector =
                                      panelmsg.createMessageComponentCollector({
                                        max: 1,
                                        time: 30000,
                                      });

                                    serverControlCollector.on(
                                      "collect",
                                      async (control) => {
                                        if (control.user.id !== message.author.id) return control.reply({content: "Vous ne pouvez pas utiliser cette interaction", ephemeral: true})
                                        control.deferUpdate().catch(() => false)
                                        if (control.customId === "start") {
                                          Client.startServer(sm.values[0]);
                                          panelmsg.edit({
                                            embeds: [serverStarted],
                                            components: [],
                                          });
                                        }
                                        if (control.customId === "restart") {
                                          Client.restartServer(sm.values[0]);
                                          panelmsg.edit({
                                            embeds: [serverRestarted],
                                            components: [],
                                          });
                                        }
                                        if (control.customId === "stop") {
                                          Client.stopServer(sm.values[0]);
                                          panelmsg.edit({
                                            embeds: [serverStopped],
                                            components: [],
                                          });
                                        }
                                        if (control.customId === "kill") {
                                          Client.killServer(sm.values[0]);
                                          panelmsg.edit({
                                            embeds: [serverKilled],
                                            components: [],
                                          });
                                        }
                                        if (control.customId === "send") {
                                          const editm = new EmbedBuilder()
                                            .setTitle(panelTitle)
                                            .setFooter({text: footer})
                                            .setColor(color)
                                            .setThumbnail(thumbnail)
                                            .setDescription(
                                              "Veuillez envoyer la commande à envoyer"
                                            );

                                          panelmsg.edit({
                                            embeds: [editm],
                                            components: [],
                                          });

                                          await message.channel
                                            .awaitMessages(
                                              { filter: (m) =>
                                                m.author.id ==
                                                message.author.id, max: 1, time: 30000 }
                                            )
                                            .then(async (collected) => {
                                              let newcontent = collected
                                                .first()
                                                .content.trim();

                                              await Client.sendServerCommand(
                                                sm.values[0],
                                                newcontent
                                              );
                                              panelmsg.edit({
                                                embeds: [serverSended],
                                                components: [],
                                              });
                                              collected.first().delete();
                                            })
                                            .catch((error) => {
                                              message.channel.send("Aucune réponse");
                                            });
                                        }
                                        if (control.customId === "install") {
                                          Client.reInstallServer(sm.values[0]);
                                          panelmsg.edit({
                                            embeds: [serverReinstalled],
                                            components: [],
                                          });
                                        }
                                        if (control.customId === "sftp") {
                                          panelmsg.delete();
                                          control.reply({
                                            embeds: [sftpEmbed],
                                            ephemeral: true,
                                          });
                                        }
                                        if (control.customId === "user") {
                                          Client.getSubUsers(sm.values[0]).then(
                                            (users) => {
                                              console.log(users);
                                              let embedDesc;
                                              const usrEmbed =
                                                new EmbedBuilder()
                                                  .setColor(color)
                                                  .setTitle(serverTitle)
                                                  .setFooter({text: footer})
                                                  .setThumbnail(thumbnail);

                                              if (users.length === 0) {
                                                usrEmbed.setDescription(
                                                  "Il n'y a aucun sous utilisateur sur ce serveur"
                                                );
                                                return panelmsg.edit({
                                                  embeds: [usrEmbed],
                                                  components: [userRow],
                                                });
                                              }

                                              users.forEach((usr) => {
                                                let user = usr.attributes;
                                                if (!embedDesc)
                                                  return (embedDesc =
                                                    "**" +
                                                    user.username +
                                                    "**\n```\nUUID: " +
                                                    user.uuid +
                                                    "\nCrée le: " +
                                                    user.created_at +
                                                    "\n```\n");
                                                embedDesc =
                                                  embedDesc +
                                                  "**" +
                                                  user.username +
                                                  "**\n```\nUUID: " +
                                                  user.uuid +
                                                  "\nCrée le: " +
                                                  user.created_at +
                                                  "\n```\n";
                                              });
                                              usrEmbed.setDescription(
                                                embedDesc
                                              );
                                              panelmsg.edit({
                                                embeds: [usrEmbed],
                                                components: [userRow],
                                              });
                                              const serverBkpUsrCollector =
                                                panelmsg.createMessageComponentCollector(
                                                  { max: 1, time: 30000 }
                                                );

                                              serverBkpUsrCollector.on(
                                                "collect",
                                                async (bs) => {
                                                  if (bs.user.id !== message.author.id) return bs.reply({content: "Vous ne pouvez pas utiliser cette interaction", ephemeral: true})
                                                  bs.deferUpdate().catch(() => false)
                                                  if (bs.customId === "close") {
                                                    panelmsg
                                                      .edit({
                                                        embeds: [closeEmbed],
                                                        components: [],
                                                      })
                                                      .then((msg) => {
                                                        setTimeout(() => msg.delete(), 5000);
                                                      });
                                                  }
                                                  if (bs.customId === "newUser") {
                                                    const embedUser =
                                                      new EmbedBuilder()
                                                        .setColor(color)
                                                        .setTitle(serverTitle)
                                                        .setFooter({text: footer})
                                                        .setThumbnail(thumbnail)
                                                        .setDescription( "Veuillez envoyer l'email de l'utilisateur");

                                                    panelmsg.edit({
                                                      embeds: [embedUser],
                                                      components: null,
                                                    });
                                                    const embedAdded =
                                                      new EmbedBuilder()
                                                        .setColor(color)
                                                        .setTitle(serverTitle)
                                                        .setFooter({text: footer})
                                                        .setThumbnail(thumbnail)
                                                        .setDescription(
                                                          "L'email a été ajouté, par sécurité nous avons donné que les permissions de démarrer, redémarrer et arrêter."
                                                        );

                                                    await message.channel
                                                      .awaitMessages(
                                                        { filter: (m) =>
                                                          m.author.id ==
                                                          message.author.id, max: 1, time: 30000 }
                                                      )
                                                      .then(
                                                        async (collected) => {
                                                          let newcontent =
                                                            collected
                                                              .first()
                                                              .content.trim();

                                                          const evalid =
                                                            /[^@ \t\r\n]+@[^@ \t\r\n]+.[^@ \t\r\n]+/;
                                                          const check =
                                                            evalid.test(
                                                              newcontent
                                                            );

                                                          if (check === false)
                                                            return panelmsg.edit(
                                                              {
                                                                content:
                                                                  "email invalide",
                                                                embeds: null,
                                                                components: [],
                                                              }
                                                            );

                                                          Client.createSubUser(
                                                            sm.values[0],
                                                            newcontent,
                                                            [
                                                              "control.start",
                                                              "control.restart",
                                                              "control.stop",
                                                            ]
                                                          );
                                                          panelmsg.edit({
                                                            embeds: [embedAdded],
                                                            components: [],
                                                          });
                                                          collected
                                                            .first()
                                                            .delete();
                                                        }
                                                      )
                                                      .catch((error) => {
                                                        console.log(error);
                                                        message.channel.send(
                                                          "Aucune réponse"
                                                        );
                                                      });
                                                  }
                                                }
                                              );
                                            }
                                          );
                                        }
                                        if (control.customId === "backup") {
                                          Client.listServerBackups(
                                            sm.values[0]
                                          ).then((bkps) => {
                                            console.log(bkps);
                                            let embedDesc;
                                            const usrEmbed = new EmbedBuilder()
                                              .setColor(color)
                                              .setTitle(serverTitle)
                                              .setFooter({text: footer})
                                              .setThumbnail(thumbnail);

                                            if (bkps.length === 0) {
                                              usrEmbed.setDescription(
                                                "Il n'y a pas de backup sur ce serveur"
                                              );
                                              return panelmsg.edit({
                                                embeds: [usrEmbed],
                                                components: [bkpRow],
                                              });
                                            }

                                            bkps.forEach((usr) => {
                                              let user = usr.attributes;
                                              if (!embedDesc)
                                                return (embedDesc =
                                                  "**" +
                                                  user.name +
                                                  "**\n```\nUUID: " +
                                                  user.uuid +
                                                  "\nSuccès: " +
                                                  user.is_successful +
                                                  "\nTaille: " +
                                                  formatBytes(user.bytes) +
                                                  "\nCrée le: " +
                                                  user.created_at +
                                                  "\n```\n");
                                              embedDesc =
                                                embedDesc +
                                                "**" +
                                                user.name +
                                                "**\n```\nUUID: " +
                                                user.uuid +
                                                "\nSuccès: " +
                                                user.is_successful +
                                                "\nTaille: " +
                                                formatBytes(user.bytes) +
                                                "\nCrée le: " +
                                                user.created_at +
                                                "\n```\n";
                                            });
                                            usrEmbed.setDescription(embedDesc);
                                            panelmsg.edit({
                                              embeds: [usrEmbed],
                                              components: [bkpRow],
                                            });
                                            const serverBkpUsrCollector =
                                              panelmsg.createMessageComponentCollector(
                                                { max: 1, time: 30000 }
                                              );

                                            serverBkpUsrCollector.on(
                                              "collect",
                                              async (bs) => {
                                                if (bs.user.id !== message.author.id) return bs.reply({content: "Vous ne pouvez pas utiliser cette interaction", ephemeral: true})
                                                bs.deferUpdate().catch(() => false)
                                                if (bs.customId === "close") {
                                                  panelmsg
                                                    .edit({
                                                      embeds: [closeEmbed],
                                                      components: [],
                                                    })
                                                    .then((msg) => {
                                                      msg.delete({
                                                        timeout: 5000,
                                                      });
                                                    });
                                                }
                                                if (bs.customId === "newBkp") {
                                                  const sucBkp =
                                                    new EmbedBuilder()
                                                      .setTitle(serverTitle)
                                                      .setFooter({text: footer})
                                                      .setThumbnail(thumbnail)
                                                      .setColor(color);

                                                  Client.createServerBackup(
                                                    sm.values[0]
                                                  )
                                                    .then((done) => {
                                                      sucBkp.setDescription(
                                                        "Backup crée avec succès!"
                                                      );
                                                      panelmsg.edit({
                                                        embeds: [sucBkp],
                                                        components: null,
                                                      });
                                                    })
                                                    .catch((error) => {
                                                      if (error === 924) {
                                                        sucBkp.setDescription(
                                                          "Veuillez attendre 10 minutes avant de faire une autre backup"
                                                        );
                                                        panelmsg.edit({
                                                          embeds: [sucBkp],
                                                          components: null,
                                                        });
                                                      }
                                                    });
                                                }
                                              }
                                            );
                                          });
                                        }
                                        if (control.customId === "rename") {
                                          const embedUser = new EmbedBuilder()
                                            .setColor(color)
                                            .setTitle(serverTitle)
                                            .setFooter({text: footer})
                                            .setThumbnail(thumbnail)
                                            .setDescription(
                                              "Veuillez envoyer un nouveau nom pour ce serveur"
                                            );

                                          panelmsg.edit({
                                            embeds: [embedUser],
                                            components: null,
                                          });
                                          const embedAdded = new EmbedBuilder()
                                            .setColor(color)
                                            .setTitle(serverTitle)
                                            .setFooter({text: footer})
                                            .setThumbnail(thumbnail)
                                            .setDescription(
                                              "Le nom du serveur a été modifié"
                                            );

                                          await message.channel
                                            .awaitMessages(
                                              { filter: (m) =>
                                                m.author.id ==
                                                message.author.id, max: 1, time: 30000 }
                                            )
                                            .then(async (collected) => {
                                              let newcontent = collected
                                                .first()
                                                .content.trim();

                                              Client.renameServer(
                                                sm.values[0],
                                                newcontent
                                              );
                                              panelmsg.edit({
                                                embeds: [embedAdded],
                                                components: [],
                                              });
                                              collected.first().delete();
                                            })
                                            .catch((error) => {
                                              console.log(error);
                                              message.channel.send("Aucune réponse");
                                            });
                                        }
                                        if (control.customId === "close") {
                                          panelmsg.edit({
                                            embeds: [closeEmbed],
                                            components: [],
                                          });
                                        }
                                      }
                                    );
                                  } else if (
                                    status === "stopping" ||
                                    status === "offline"
                                  ) {
                                    serverStop.setDisabled(true);
                                    serverRestart.setDisabled(true);
                                    serverKill.setDisabled(true);
                                    serverSend.setDisabled(true);

                                    const serverControl =
                                      new ActionRowBuilder().addComponents([
                                        serverStart,
                                        serverRestart,
                                        serverSend,
                                        serverStop,
                                        serverKill
                                      ]);

                                    const serverMngControl =
                                      new ActionRowBuilder().addComponents([
                                        serverSFTP,
                                        serverUser,
                                        serverMnBkp,
                                        serverRename,
                                        serverInstal
                                      ]);

                                    const closerow =
                                      new ActionRowBuilder().addComponents(
                                        close
                                      );

                                    panelmsg.edit({
                                      embeds: [serverSelected],
                                      components: [
                                        serverControl,
                                        serverMngControl,
                                        closerow,
                                      ],
                                    });

                                    const serverControlCollector =
                                      panelmsg.createMessageComponentCollector({
                                        max: 1,
                                        time: 30000,
                                      });

                                    serverControlCollector.on(
                                      "collect",
                                      async (control) => {
                                        if (control.user.id !== message.author.id) return control.reply({content: "Vous ne pouvez pas utiliser cette interaction", ephemeral: true})
                                        control.deferUpdate().catch(() => false)
                                        if (control.customId === "start") {
                                          Client.startServer(sm.values[0]);
                                          panelmsg.edit({
                                            embeds: [serverStarted],
                                            components: [],
                                          });
                                        }
                                        if (control.customId === "restart") {
                                          Client.restartServer(sm.values[0]);
                                          panelmsg.edit({
                                            embeds: [serverRestarted],
                                            components: [],
                                          });
                                        }
                                        if (control.customId === "stop") {
                                          Client.stopServer(sm.values[0]);
                                          panelmsg.edit({
                                            embeds: [serverStopped],
                                            components: [],
                                          });
                                        }
                                        if (control.customId === "kill") {
                                          Client.killServer(sm.values[0]);
                                          panelmsg.edit({
                                            embeds: [serverKilled],
                                            components: [],
                                          });
                                        }
                                        if (control.customId === "send") {
                                          const editm = new EmbedBuilder()
                                            .setTitle(panelTitle)
                                            .setFooter({text: footer})
                                            .setColor(color)
                                            .setThumbnail(thumbnail)
                                            .setDescription("Veuillez envoyer le message que la commande va envoyer");

                                          panelmsg.edit({
                                            embeds: [editm],
                                            components: [],
                                          });

                                          await message.channel
                                            .awaitMessages(
                                              { filter: (m) =>
                                                m.author.id ==
                                                message.author.id, max: 1, time: 30000 }
                                            )
                                            .then(async (collected) => {
                                              let newcontent = collected
                                                .first()
                                                .content.trim();

                                              await Client.sendServerCommand(
                                                sm.values[0],
                                                newcontent
                                              );
                                              panelmsg.edit({
                                                embeds: [serverSended],
                                                components: [],
                                              });
                                              collected.first().delete();
                                            })
                                            .catch((error) => {
                                              message.channel.send("Aucune réponse");
                                            });
                                        }
                                        if (control.customId === "install") {
                                          Client.reInstallServer(sm.values[0]);
                                          panelmsg.edit({
                                            embeds: [serverReinstalled],
                                            components: [],
                                          });
                                        }
                                        if (control.customId === "sftp") {
                                          panelmsg.delete();
                                          control.reply({
                                            embeds: [sftpEmbed],
                                            ephemeral: true,
                                          });
                                        }
                                        if (control.customId === "user") {
                                          Client.getSubUsers(sm.values[0]).then(
                                            (users) => {
                                              let embedDesc;
                                              const usrEmbed =
                                                new EmbedBuilder()
                                                  .setColor(color)
                                                  .setTitle(serverTitle)
                                                  .setFooter({text: footer})
                                                  .setThumbnail(thumbnail);

                                              if (users.length === 0) {
                                                usrEmbed.setDescription("Il n'y a aucun sous utilisateur sur ce serveur");
                                                return panelmsg.edit({
                                                  embeds: [usrEmbed],
                                                  components: [userRow],
                                                });
                                              }

                                              users.forEach((usr) => {
                                                let user = usr.attributes;
                                                if (!embedDesc)
                                                  return (embedDesc =
                                                    "**" +
                                                    user.username +
                                                    "**\n```\nUUID: " +
                                                    user.uuid +
                                                    "\nCrée le: " +
                                                    user.created_at +
                                                    "\n```\n");
                                                embedDesc =
                                                  embedDesc +
                                                  "**" +
                                                  user.username +
                                                  "**\n```\nUUID: " +
                                                  user.uuid +
                                                  "\nCrée le: " +
                                                  user.created_at +
                                                  "\n```\n";
                                              });
                                              usrEmbed.setDescription(
                                                embedDesc
                                              );
                                              panelmsg.edit({
                                                embeds: [usrEmbed],
                                                components: [userRow],
                                              });
                                              const serverBkpUsrCollector =
                                                panelmsg.createMessageComponentCollector(
                                                  { max: 1, time: 30000 }
                                                );

                                              serverBkpUsrCollector.on(
                                                "collect",
                                                async (bs) => {
                                                  if (bs.user.id !== message.author.id) return bs.reply({content: "Vous ne pouvez pas utiliser cette interaction", ephemeral: true})
                                                  bs.deferUpdate().catch(() => false)
                                                  if (bs.customId === "close") {
                                                    panelmsg
                                                      .edit({
                                                        embeds: [closeEmbed],
                                                        components: [],
                                                      })
                                                      .then((msg) => {
                                                        msg.delete({
                                                          timeout: 5000,
                                                        });
                                                      });
                                                  }
                                                  if (bs.customId === "newUser") {
                                                    const embedUser =
                                                      new EmbedBuilder()
                                                        .setColor(color)
                                                        .setTitle(serverTitle)
                                                        .setFooter({text: footer})
                                                        .setThumbnail(thumbnail)
                                                        .setDescription(
                                                          "Veuillez entrer l'email de l'utilisateur"
                                                        );

                                                    panelmsg.edit({
                                                      embeds: [embedUser],
                                                      components: null,
                                                    });
                                                    const embedAdded =
                                                      new EmbedBuilder()
                                                        .setColor(color)
                                                        .setTitle(serverTitle)
                                                        .setFooter({text: footer})
                                                        .setThumbnail(thumbnail)
                                                        .setDescription( "Utilisateur ajouté, pour des raisons de sécurité nous lui avons donné que la permissions lancer, stoper ou relancer un serveur");

                                                    await message.channel
                                                      .awaitMessages(
                                                        { filter: (m) =>
                                                          m.author.id ==
                                                          message.author.id, max: 1, time: 30000 }
                                                      )
                                                      .then(
                                                        async (collected) => {
                                                          let newcontent =
                                                            collected
                                                              .first()
                                                              .content.trim();

                                                          const evalid =
                                                            /[^@ \t\r\n]+@[^@ \t\r\n]+.[^@ \t\r\n]+/;
                                                          const check =
                                                            evalid.test(
                                                              newcontent
                                                            );

                                                          if (check === false)
                                                            return panelmsg.edit(
                                                              {
                                                                content:
                                                                  "Email invalide",
                                                                embeds: null,
                                                                components: [],
                                                              }
                                                            );

                                                          Client.createSubUser(
                                                            sm.values[0],
                                                            newcontent,
                                                            [
                                                              "control.start",
                                                              "control.restart",
                                                              "control.stop",
                                                            ]
                                                          );
                                                          panelmsg.edit({
                                                            embeds: [embedAdded],
                                                            components: [],
                                                          });
                                                          collected
                                                            .first()
                                                            .delete();
                                                        }
                                                      )
                                                      .catch((error) => {
                                                        console.log(error);
                                                        message.channel.send(
                                                          "Aucune réponse"
                                                        );
                                                      });
                                                  }
                                                }
                                              );
                                            }
                                          );
                                        }
                                        if (control.customId === "backup") {
                                          Client.listServerBackups(
                                            sm.values[0]
                                          ).then((bkps) => {
                                            console.log(bkps);
                                            let embedDesc;
                                            const usrEmbed = new EmbedBuilder()
                                              .setColor(color)
                                              .setTitle(serverTitle)
                                              .setFooter({text: footer})
                                              .setThumbnail(thumbnail);

                                            if (bkps.length === 0) {
                                              usrEmbed.setDescription(
                                                "Il n'y a pas de backup sur ce serveur"
                                              );
                                              return panelmsg.edit({
                                                embeds: [usrEmbed],
                                                components: [bkpRow],
                                              });
                                            }

                                            bkps.forEach((usr) => {
                                              let user = usr.attributes;
                                              if (!embedDesc)
                                                return (embedDesc =
                                                  "**" +
                                                  user.name +
                                                  "**\n```\nUUID: " +
                                                  user.uuid +
                                                  "\nSuccès: " +
                                                  user.is_successful +
                                                  "\nTaille: " +
                                                  formatBytes(user.bytes) +
                                                  "\nCrée le: " +
                                                  user.created_at +
                                                  "\n```\n");
                                              embedDesc =
                                                embedDesc +
                                                "**" +
                                                user.name +
                                                "**\n```\nUUID: " +
                                                user.uuid +
                                                "\nSuccès: " +
                                                user.is_successful +
                                                "\nTaille: " +
                                                formatBytes(user.bytes) +
                                                "\nCrée le: " +
                                                user.created_at +
                                                "\n```\n";
                                            });
                                            usrEmbed.setDescription(embedDesc);
                                            panelmsg.edit({
                                              embeds: [usrEmbed],
                                              components: [bkpRow],
                                            });
                                            const serverBkpUsrCollector =
                                              panelmsg.createMessageComponentCollector(
                                                { max: 1, time: 30000 }
                                              );

                                            serverBkpUsrCollector.on(
                                              "collect",
                                              async (bs) => {
                                                if (bs.user.id !== message.author.id) return bs.reply({content: "Vous ne pouvez pas utiliser cette interaction", ephemeral: true})
                                                bs.deferUpdate().catch(() => false)
                                                if (bs.customId === "close") {
                                                  panelmsg
                                                    .edit({
                                                      embeds: [closeEmbed],
                                                      components: [],
                                                    })
                                                    .then((msg) => {
                                                      setTimeout(() => msg.delete(), 5000);
                                                    });
                                                }
                                                if (bs.customId === "newBkp") {
                                                  const sucBkp =
                                                    new EmbedBuilder()
                                                      .setTitle(serverTitle)
                                                      .setFooter({text: footer})
                                                      .setThumbnail(thumbnail)
                                                      .setColor(color);

                                                  Client.createServerBackup(
                                                    sm.values[0]
                                                  )
                                                    .then((done) => {
                                                      sucBkp.setDescription(
                                                        "Backup crée avec succès!"
                                                      );
                                                      panelmsg.edit({
                                                        embeds: [sucBkp],
                                                        components: null,
                                                      });
                                                    })
                                                    .catch((error) => {
                                                      if (error === 924) {
                                                        sucBkp.setDescription(
                                                          "Vous devez attendre 10 minutes avant de crée une autre backup"
                                                        );
                                                        panelmsg.edit({
                                                          embeds: [sucBkp],
                                                          components: null,
                                                        });
                                                      }
                                                    });
                                                }
                                              }
                                            );
                                          });
                                        }
                                        if (control.customId === "rename") {
                                          const embedUser = new EmbedBuilder()
                                            .setColor(color)
                                            .setTitle(serverTitle)
                                            .setFooter({text: footer})
                                            .setThumbnail(thumbnail)
                                            .setDescription(
                                              "Veuillez entrer un nouveau nom pour ce serveur"
                                            );

                                          panelmsg.edit({
                                            embeds: [embedUser],
                                            components: null,
                                          });
                                          const embedAdded = new EmbedBuilder()
                                            .setColor(color)
                                            .setTitle(serverTitle)
                                            .setFooter({text: footer})
                                            .setThumbnail(thumbnail)
                                            .setDescription(
                                              "Le nom de serveur a été modifié"
                                            );

                                          await message.channel
                                            .awaitMessages(
                                              { filter: (m) =>
                                                m.author.id ==
                                                message.author.id, max: 1, time: 30000 }
                                            )
                                            .then(async (collected) => {
                                              let newcontent = collected
                                                .first()
                                                .content.trim();

                                              Client.renameServer(
                                                sm.values[0],
                                                newcontent
                                              );
                                              panelmsg.edit({
                                                embeds: [embedAdded],
                                                components: [],
                                              });
                                              collected.first().delete();
                                            })
                                            .catch((error) => {
                                              console.log(error);
                                              message.channel.send("Aucune réponse");
                                            });
                                        }
                                        if (control.customId === "close") {
                                          panelmsg.edit({
                                            embeds: [closeEmbed],
                                            components: [],
                                          });
                                        }
                                      }
                                    );
                                  }
                                } catch (e) {
                                  let ErrCon = new EmbedBuilder()
                                    .setTitle(
                                      "PteroControl ¦ Gérer un serveur"
                                    )
                                    .setThumbnail(client.user.avatarURL())
                                    .setColor(color)
                                    .setDescription(
                                      "Une erreur c'est produite, veuillez contacter le staff!"
                                    );

                                  let err305 = new EmbedBuilder()
                                    .setTitle("PteroControl | Error 305")
                                    .setColor(color)
                                    .setDescription(
                                      "Une erreur est survenue lors de la récupération de vos serveurs. Cela peut se produire si votre hôte a cloudflare activé sur son pannel, ce qui empêchera le bot de se connecter aux points de terminaison"
                                    )
                                    .setImage("https://http.cat/305");
                                  if (e === 305)
                                    return message.channel.send(err305);

                                  let err304 = new EmbedBuilder()
                                    .setTitle("PteroControl | Error 304")
                                    .setColor(color)
                                    .setDescription(
                                      "Une erreur est survenue lors de la récupération de vos serveurs. Cela peut se produire si vous mettez des clés apikey incorrectes, assurez-vous que les clés apikey sont des clés client et non admin"
                                    )
                                    .setImage("https://http.cat/304");
                                  if (e === 304)
                                    return message.channel.send(err304);

                                  let err344 = new EmbedBuilder()
                                    .setTitle("PteroControl | Error 344")
                                    .setColor(color)
                                    .setDescription(
                                      "Une erreur est survenue lors de la récupération de vos serveurs. Cela peut se produire si le pannel est en panne"
                                    )
                                    .setImage("https://http.cat/344");
                                  if (e === 344)
                                    return message.channel.send(err344);

                                  let err8 = new EmbedBuilder()
                                    .setTitle(
                                      "PteroControl | Error 8",
                                      client.user.avatarURL()
                                    )
                                    .setColor(color)
                                    .setDescription(
                                      "An error occured while fetching your servers. This can occur if your put invalid website link"
                                    );
                                  if (e === 8)
                                    return message.channel.send(err8);

                                  let errNaN = new EmbedBuilder()
                                    .setTitle(
                                      "PteroControl | Not a Pterodactyl Panel",
                                      client.user.avatarURL()
                                    )
                                    .setColor(color)
                                    .setDescription(
                                      "An error occured while fetching your servers. This can occur if you put website link that doesn't have pterodactyl panel"
                                    );
                                  if (`${e}` === "NaN")
                                    return message.channel.send({embeds: [errNaN]});

                                  let errorCODE = new EmbedBuilder()
                                    .setTitle("PteroControl | Error!")
                                    .setDescription("Error Code " + e)
                                    .setFooter({text: footer})
                                    .setColor(color)

                                    .setImage("https://http.cat/" + e.code);
                                  console.log(e);

                                  panelmsg.edit({
                                    embeds: [errorCODE],
                                    components: [new ActionRowBuilder().addComponents(Discord)],
                                  });
                                }
                              }
                            });
                          }
                        })
                        .catch((e) => {
                          let ErrCon = new EmbedBuilder()
                            .setTitle("PteroControl ¦ Server Server Management")
                            .setThumbnail(client.user.avatarURL())
                            .setColor(color)
                            .setDescription(
                              "An error just occurred please report this to our support server!"
                            );

                          let err305 = new EmbedBuilder()
                            .setTitle("PteroControl | Error 305")
                            .setColor(color)
                            .setDescription(
                              "An error occured while fetching your servers. This can occur if your host has cloudflare enabled on their panel which will prevent the bot from connecting to the endpoints"
                            )
                            .setImage("https://http.cat/305");
                          if (e === 305) return message.channel.send(err305);

                          let err304 = new EmbedBuilder()
                            .setTitle("PteroControl | Error 304")
                            .setColor(color)
                            .setDescription(
                              "An error occured while fetching your servers. This can occur if you put wrong apikeys, make sure the apikeys are client not admin"
                            )
                            .setImage("https://http.cat/304");
                          if (e === 304) return message.channel.send(err304);

                          let err344 = new EmbedBuilder()
                            .setTitle("PteroControl | Error 344")
                            .setColor(color)
                            .setDescription(
                              "An error occured while fetching your servers. This can occur if the panel is down"
                            )
                            .setImage("https://http.cat/344");
                          if (e === 344) return message.channel.send(err344);

                          let err8 = new EmbedBuilder()
                            .setTitle(
                              "PteroControl | Error 8",
                              client.user.avatarURL()
                            )
                            .setColor(color)
                            .setDescription(
                              "An error occured while fetching your servers. This can occur if your put invalid website link"
                            );
                          if (e === 8) return message.channel.send(err8);

                          let errNaN = new EmbedBuilder()
                            .setTitle(
                              "PteroControl | Not a Pterodactyl Panel",
                              client.user.avatarURL()
                            )
                            .setColor(color)
                            .setDescription(
                              "An error occured while fetching your servers. This can occur if you put website link that doesn't have pterodactyl panel"
                            );
                          if (`${e}` === "NaN")
                            return message.channel.send(errNaN);

                          let errorCODE = new EmbedBuilder()
                            .setTitle("PteroControl | Error!")
                            .setDescription("Error Code " + e)
                            .setImage("https://http.cat/" + e)
                            .setFooter({text: footer})
                            .setColor(color);

                          console.log(e);

                          panelmsg.edit({
                            embeds: [errorCODE],
                            components: [new ActionRowBuilder().addComponents(Discord)],
                          });
                        });
                    }
                  });
                });
            }
          });
        });
    })
    .catch((error) => {
      console.log(error);
      message.channel.send({embeds: [errorDB]});
    });
};

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 MB";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }