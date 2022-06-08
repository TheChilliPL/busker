import {client, player} from "../index";
import {QueueRepeatMode} from "discord-player";
import {getLocaleFor, getString} from "../localization";

export async function initLoop() {
    client.on("interactionCreate", async interaction => {
        if (!interaction.isCommand()) return;
        if (interaction.commandName != "loop") return;

        let queue = player.getQueue(interaction.guild!);

        if (!queue) {
            await interaction.reply({content: getString("messages.not_playing", getLocaleFor(interaction))});
            return;
        }

        let modeString = interaction.options.getString("mode", true);

        let mode: QueueRepeatMode;
        switch(modeString) {
            case "OFF": mode = QueueRepeatMode.OFF; break;
            case "TRACK": mode = QueueRepeatMode.TRACK; break;
            case "QUEUE": mode = QueueRepeatMode.QUEUE; break;
            case "AUTOPLAY": mode = QueueRepeatMode.AUTOPLAY; break;
            default:
                await interaction.reply("Invalid loop mode.");
                return;
        }

        queue.setRepeatMode(mode);

        const keys = [ "off", "one", "many", "auto" ];

        await interaction.reply(getString("messages.loop_mode."+keys[mode], getLocaleFor(interaction))!);
    });
}