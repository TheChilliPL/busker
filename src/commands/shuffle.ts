import {client, player} from "../index";
import {getLocaleFor, getString} from "../localization";
import {shuffleTracks, ShufflingStrategy} from "../utils";

export async function initShuffle() {
    client.on("interactionCreate", async interaction => {
        if (!interaction.isChatInputCommand()) return;
        if (interaction.commandName != "shuffle") return;

        let queue = player.getQueue(interaction.guild!);

        if(!queue) {
            await interaction.reply(getString("messages.invalid_timestamp", getLocaleFor(interaction))!);
            return;
        }

        await interaction.deferReply();

        let reshuffle = false;
        if(interaction.options.getBoolean("reshuffle_current", false) ?? false) {
            if(queue.nowPlaying()) {
                reshuffle = true;
            } else {
                //TODO: Warning message
            }
        }

        let algorithm: ShufflingStrategy | undefined = undefined;
        switch(interaction.options.getString("algorithm", false)) {
            case "fisher_yates":
                algorithm = ShufflingStrategy.FisherYates;
                break;

            case "dithering":
                algorithm = ShufflingStrategy.Dithering;
                break;
        }

        if(reshuffle) queue.addTrack(queue.nowPlaying());

        shuffleTracks(queue.tracks, algorithm);

        if(reshuffle) queue.skip();

        await interaction.editReply(getString("messages.shuffled", getLocaleFor(interaction))!);
    });
}
