import {client, player} from "../index";
import {getLocaleFor, getString} from "../localization";

export function initSkip() {
    client.on("interactionCreate", async interaction => {
        if (!interaction.isCommand()) return;
        if (interaction.commandName != "skip") return;

        let queue = player.getQueue(interaction.guild!);

        if (!queue) {
            await interaction.reply(getString("messages.invalid_timestamp", getLocaleFor(interaction))!);
            return;
        }

        let amount = interaction.options.getInteger("amount", false) ?? 1;

        amount--;

        if(amount > queue.tracks.length) {
            await interaction.reply(getString("messages.not_enough_in_queue", getLocaleFor(interaction))!);
            return;
        } else if(amount == queue.tracks.length) {
            queue.stop();
            await interaction.reply(getString("messages.skipped.all", getLocaleFor(interaction), { placeholders: { AMOUNT: (amount + 1).toString() }})!);
            return;
        }

        queue.skipTo(amount);

        await interaction.reply({
            content:
                amount == 0
                    ? getString("messages.skipped.one", getLocaleFor(interaction))
                    : getString("messages.skipped.some", getLocaleFor(interaction), { placeholders: { AMOUNT: (amount + 1).toString() }})
        });
    });
}