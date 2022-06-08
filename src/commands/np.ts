import {client, player} from "../index";
import {getPlayerStatus} from "../status";
import {getLocaleFor, getString} from "../localization";

export async function initNp() {
    client.on("interactionCreate", async interaction => {
        if(!interaction.isCommand()) return;
        if(interaction.commandName != "np") return;

        let queue = player.getQueue(interaction.guild!);

        if(!queue) {
            await interaction.reply({content: getString("messages.not_playing", getLocaleFor(interaction))});
            return;
        }

        let np = queue.nowPlaying();

        await interaction.reply({
            content: getString("messages.now_playing", getLocaleFor(interaction), {
                placeholders: {
                    TRACK: np.title,
                    AUTHOR: np.author
                }
            }),
            ...getPlayerStatus(queue)
        });
    });
}