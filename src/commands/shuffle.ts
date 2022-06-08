import {client, player} from "../index";
import {getLocaleFor, getString} from "../localization";

export async function initShuffle() {
    client.on("interactionCreate", async interaction => {
        if (!interaction.isCommand()) return;
        if (interaction.commandName != "shuffle") return;

        let queue = player.getQueue(interaction.guild!);

        if(!queue) {
            await interaction.reply(getString("messages.invalid_timestamp", getLocaleFor(interaction))!);
            return;
        }

        await interaction.deferReply();

        queue.shuffle();

        await interaction.editReply(getString("messages.shuffled", getLocaleFor(interaction))!);
    });
}