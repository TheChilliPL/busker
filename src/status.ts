import {Queue, QueueRepeatMode} from "discord-player";
import * as Discord from "discord.js";
import {drawProgress} from "./progress";
import {client, player} from "./index";
import {GuildChannel, Snowflake, TextBasedChannel, VoiceChannel} from "discord.js";
import {getLocaleFor, getString} from "./localization";

export function getPlayerStatus(queue: Queue): Discord.MessageOptions & Discord.InteractionReplyOptions {
    if(queue.destroyed) return {};

    let track = queue.nowPlaying();
    let timestamp = queue.getPlayerTimestamp();

    let loopEmoji: string | null = null;
    switch(queue.repeatMode) {
        case QueueRepeatMode.QUEUE:
            loopEmoji = "🔁";
            break;
        case QueueRepeatMode.TRACK:
            loopEmoji = "🔂"
            break;
        case QueueRepeatMode.AUTOPLAY:
            loopEmoji = "♾️"
            break;
    }

    return {
        embeds: [{
            thumbnail: {
                url: track.thumbnail
            },
            title: track.title,
            url: track.url,
            author: {
                name: getString("now_playing.requested_by", getLocaleFor(queue), {
                    placeholders: {
                        USERNAME: track.requestedBy.username
                    }
                })!,
                icon_url: track.requestedBy.displayAvatarURL({ size: 32 })
            },
            //description: "1:00 " + drawProgress(1 / 60, 10) + " 1:00:00",
            description:
                getString("now_playing.by", getLocaleFor(queue), { placeholders: { AUTHOR: track.author }}) + "\n\n"
                + (queue.connection.paused ? "⏸️ " : "")
                + timestamp.current + " "
                + drawProgress(timestamp.progress / 100, 10)
                + " " + timestamp.end
                + (loopEmoji == null ? "" : " " + loopEmoji),
            color: Discord.resolveColor("#52FF05"),
            footer:
                queue.tracks.length > 0
                    ? { text: getString("now_playing.queue_length", getLocaleFor(queue), { placeholders: { COUNT: queue.tracks.length.toString() }})! }
                    : undefined
        }]
    }
}

export async function getStatusChannel(queue: Queue): Promise<Discord.TextBasedChannel | null>;
/**
 * @deprecated Use the overload with queue instead.
 */
export async function getStatusChannel(guild: Discord.Guild): Promise<Discord.TextBasedChannel | null>;
export async function getStatusChannel(argument: Queue | Discord.Guild): Promise<Discord.TextBasedChannel | null> {
    let queue = argument instanceof Discord.Guild ? player.getQueue(argument) : argument;
    let guild = argument instanceof Queue ? argument.guild : argument;

    // Get the current voice channel chat.
    let voiceChannel = queue.connection.channel;
    if(
        voiceChannel instanceof VoiceChannel
        && guild.features.includes("TEXT_IN_VOICE_ENABLED" as Discord.GuildFeature)
        && voiceChannel.permissionsFor(client.user)?.has(Discord.PermissionsBitField.Flags.SendMessages)
    )
        return voiceChannel;

    // Get the text channel where the queue was started.
    let metadataChannel = (queue?.metadata as any)?.channel as TextBasedChannel & GuildChannel;
    if(metadataChannel && guild.channels.cache.has(metadataChannel.id) && metadataChannel.permissionsFor(client.user)?.has(Discord.PermissionsBitField.Flags.SendMessages))
        return metadataChannel;

    // Fallback to the first accessible channel in the guild.
    let channels = await guild.channels.fetch();
    let channel = (channels.filter(c => c.isTextBased()) as Discord.Collection<Snowflake, Discord.TextChannel>)
        .sort((a, b) =>
            (a.parent?.position ?? -1) - (b.parent?.position ?? -1)
            || a.position - b.position
        )
        .find(c =>
            !!c.permissionsFor(client.user)?.has(Discord.PermissionsBitField.Flags.SendMessages)
        );
    return channel?.isTextBased() ? channel : null;
}
