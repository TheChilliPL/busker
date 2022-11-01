import {client, player} from "../index";
import {getLocaleFor, getString} from "../localization";

export async function initStop() {
    client.on("interactionCreate", async interaction => {
        if (!interaction.isCommand()) return;
        if (interaction.commandName != "stop") return;

        let queue = player.getQueue(interaction.guild!);

        if(!queue) {
            await interaction.reply({content: getString("messages.not_playing", getLocaleFor(interaction))});
            return;
        }

        queue.options.leaveOnStop = true;
        queue.stop();

        await interaction.reply(getString("messages.queue.stopped", getLocaleFor(interaction))!);
    });
}
