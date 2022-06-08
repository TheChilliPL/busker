import {client, player} from "../index";
import {getLocaleFor, getString} from "../localization";

export async function initResume() {
    client.on("interactionCreate", async interaction => {
        if (!interaction.isCommand()) return;
        if (interaction.commandName != "resume") return;

        let queue = player.getQueue(interaction.guild!);

        if(!queue) {
            await interaction.reply({content: getString("messages.not_playing", getLocaleFor(interaction))});
            return;
        }

        queue.setPaused(false);

        await interaction.reply({
            content: getString("messages.resumed", getLocaleFor(interaction))
        });
    });
}