import {
   ButtonInteraction,
   ActionRowBuilder,
   ButtonBuilder,
   ComponentType,
   EmbedBuilder,
   BaseGuildTextChannel,
   ModalBuilder,
   TextInputBuilder,
   TextInputStyle,
   ModalActionRowComponentBuilder,
   ModalSubmitInteraction,
   MessageFlags
} from "discord.js";
import {ButtonTypes, ButtonStyles, ButtonsTypes, PaginationOptions} from "./pagination.i";

const defaultEmojis = {
   first: "⬅️",
   previous: "◀️",
   next: "▶️",
   last: "➡️",
   number: "#️⃣",
   check: "✅",
   cross: "❌",
}

const defaultStyles = {
   first: ButtonStyles.Secondary,
   previous: ButtonStyles.Danger,
   next: ButtonStyles.Success,
   last: ButtonStyles.Secondary,
   number: ButtonStyles.Success
}
export const pagination = async (options: PaginationOptions) => {
   const {
      client,
      interaction,
      message,
      ephemeral,
      author,
      disableButtons,
      deleteAtEnd,
      embeds,
      buttons,
      time,
      max,
      customFilter,
      fastSkip,
      pageTravel
   } = options
   let currentPage = 1;
   const disableB = disableButtons || false;
   const ephemeralMessage = ephemeral !== null ? ephemeral : false;
   
   if (!interaction && !message) throw new Error("Pagination requires either an interaction or a message object");
   const type = interaction ? 'interaction' : 'message';
   
   const getButtonData = (type: ButtonsTypes) => {
      return buttons?.find((btn) => btn.type === type);
   }
   
   const resolveButtonName = (type: ButtonsTypes) => {
      return (Object.keys(ButtonTypes) as (keyof typeof ButtonTypes)[]).find((key) => {
         return ButtonTypes[key] === type;
      });
   }
   
   const generateButtons = (state?: boolean) => {
      const checkState = (type: ButtonsTypes) => {
         if (([1, 2]).includes(type) && currentPage === 1) return true;
         if (([5]).includes(type) && currentPage === 1 && embeds.length === 1) return true;
         return ([3, 4]).includes(type) && currentPage === embeds.length;
      }
      
      let names: ButtonsTypes[] = [2, 3];
      if (fastSkip) names = [1, ...names, 4];
      if (pageTravel) names.push(5);
      
      return names.reduce(
         (accumulator: ButtonBuilder[], type: ButtonsTypes) => {
            let embed = new ButtonBuilder()
               .setCustomId(type.toString())
               .setDisabled(state || checkState(type))
               .setStyle(getButtonData(type)?.style || defaultStyles[resolveButtonName(type)]);
            if (getButtonData(type)?.emoji !== null) embed.setEmoji(getButtonData(type)?.emoji || defaultEmojis[resolveButtonName(type)])
            if (getButtonData(type)?.label) embed.setLabel(getButtonData(type)?.label);
            accumulator.push(embed);
            return accumulator;
         },
         []
      );
   }
   
   const components = (state?: boolean) => [
      new ActionRowBuilder<ButtonBuilder>().addComponents(generateButtons(state))
   ]
   
   const changeFooter = () => {
      const embed = embeds[currentPage - 1];
      const embedJSON = embed.toJSON();
      const newEmbed = new EmbedBuilder(embedJSON);
      if (Object.prototype.hasOwnProperty.call(embedJSON, 'footer')) {
         return newEmbed.setFooter({
            text: `Page ${currentPage} / ${embeds.length} - ${embedJSON.footer.text}`,
            iconURL: embedJSON.footer.icon_url
         });
      }
      return newEmbed.setFooter({
         text: `Page ${currentPage} / ${embeds.length}`
      });
   }
   
   let initialMessage;
   let channel: BaseGuildTextChannel = message?.channel as BaseGuildTextChannel || interaction?.channel as BaseGuildTextChannel;
   
   if (type === 'interaction' && channel) {
      await interaction.deferReply({ ...(ephemeralMessage ? { flags: [MessageFlags.Ephemeral] } : {}) }).catch(() => ({}));
      initialMessage = await interaction.editReply({
         embeds: [changeFooter()],
         components: components()
      });
   } else {
      initialMessage = await channel.send({
         embeds: [changeFooter()],
         components: components()
      });
   }
   
   const defaultFilter = (interaction: ButtonInteraction) => {
      return interaction.user.id === author.id && parseInt(interaction.customId) <= 4;
   }
   
   const collectorOptions = (filter?): any => {
      const opt = {
         filter: filter || customFilter || defaultFilter,
         componentType: ComponentType.Button
      }
      if (max) opt["max"] = max;
      if (time) opt["time"] = time;
      return opt;
   }
   
   const collector = initialMessage.createMessageComponentCollector(collectorOptions());
   let collectorModal;
   
   if (pageTravel) {
      collectorModal = initialMessage.createMessageComponentCollector(collectorOptions((_i: ModalSubmitInteraction) => _i.user.id === author.id && parseInt(_i.customId) === 5));
      collectorModal.on("collect", async (btnInteraction) => {
         // Show modal
         const modal = new ModalBuilder()
            .setCustomId('choose_page_modal')
            .setTitle('Choose Page');
         
         const inputPageNumber = new TextInputBuilder()
            .setCustomId('page_number')
            .setLabel('Enter Page Number')
            .setStyle(TextInputStyle.Short)
         
         const buildModal = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(inputPageNumber);
         modal.addComponents(buildModal);
         await btnInteraction.showModal(modal);
         
         await btnInteraction.awaitModalSubmit({
            filter: (_i: ButtonInteraction) => _i.user.id === author.id && _i.customId === 'choose_page_modal',
            time: 30000,
         }).then(async (i) => {
            const page_number = i.fields.getTextInputValue('page_number');
            const int = parseInt(page_number);
            if (isNaN(int)){
               return i.followUp({
                  content: `${i.member.user}, Please enter a valid page number!\n\`${page_number}\` is not a valid page number!`,
                  ...(ephemeralMessage ? { flags: [MessageFlags.Ephemeral] } : {})
               });
            };
            if (int > embeds.length) {
               currentPage = embeds.length;
            } else {
               if (int <= 0) {
                  currentPage = 1;
               } else {
                  currentPage = int;
               }
            }
            await i.update({
               embeds: [changeFooter()],
               components: components(),
               ...(ephemeralMessage ? { flags: [MessageFlags.Ephemeral] } : {})
            });
         });
      });
   }
   
   collector.on("collect", async (btnInteraction: ButtonInteraction) => {
      const btnType = parseInt(btnInteraction.customId) as ButtonsTypes;
      
      switch (btnType) {
         case 1:
            currentPage = 1;
            break;
         case 2:
            currentPage--;
            break;
         case 3:
            currentPage++;
            break;
         case 4:
            currentPage = embeds.length;
            break;
      }
      
      await btnInteraction.update({
         embeds: [changeFooter()],
         components: components()
      });
   });
   
   collector.on("end", async () => {
      try {
         if (deleteAtEnd) {
               if (type === 'message') {
                  await initialMessage.delete();
               } else {
                  await interaction.deleteReply();
               }
         } else {
               // If deleteAtEnd is false, just remove the buttons
               if (type === 'message') {
                  await initialMessage.edit({
                     components: disableB ? components(true) : []
                  });
               } else {
                  await interaction.editReply({
                     components: disableB ? components(true) : []
                  });
               }
         }
      } catch (error) {
         if (error.code === 10008) {
            console.warn('Failed to delete/edit message: Message was already deleted or not found.');
         } else {
            console.error('Error deleting/editing message:', error);
         }  
      }
   });
}