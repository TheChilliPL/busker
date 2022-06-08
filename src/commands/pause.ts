import {client, player} from "../index";
import {getLocaleFor, getString} from "../localization";

export async function initPause() {
    client.on("interactionCreate", async interaction => {
        if (!interaction.isCommand()) return;
        if (interaction.commandName != "pause") return;

        let queue = player.getQueue(interaction.guild!);

        if(!queue) {
            await interaction.reply({content: getString("messages.not_playing", getLocaleFor(interaction))});
            return;
        }

        queue.setPaused(true);

        await interaction.reply({
            content: getString("messages.paused", getLocaleFor(interaction))
        });
    });
}