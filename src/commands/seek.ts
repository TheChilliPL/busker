import {client, player} from "../index";
import {getLocaleFor, getString} from "../localization";

export async function initSeek() {
    client.on("interactionCreate", async interaction => {
        if (!interaction.isChatInputCommand()) return;
        if (interaction.commandName != "seek") return;

        let queue = player.getQueue(interaction.guild!);

        if (!queue) {
            await interaction.reply({content: getString("messages.not_playing", getLocaleFor(interaction))});
            return;
        }

        let timestampString = interaction.options.getString("timestamp", true);
        let timestampSplit = timestampString.split(":").map(e => Number(e));

        if(timestampSplit.length < 1 || timestampSplit.length > 3 || timestampSplit.some(e => e == null || isNaN(e))) {
            await interaction.reply(getString("messages.invalid_timestamp", getLocaleFor(interaction))!);
            return;
        }

        let timestampSeconds = timestampSplit.reduce((previousValue, currentValue) => {
            return previousValue * 60 + currentValue;
        });

        if(timestampSeconds < 0 || timestampSeconds > queue.current.durationMS / 1000) {
            await interaction.reply(getString("messages.invalid_timestamp", getLocaleFor(interaction))!);
            return;
        }

        await queue.seek(timestampSeconds * 1000);

        await interaction.reply(getString("messages.seeked", getLocaleFor(interaction))!);
    });
}
