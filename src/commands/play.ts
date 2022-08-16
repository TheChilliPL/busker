import {client, player, violatesBlacklist} from "../index";
import * as Discord from "discord.js";
import youtubeSuggest from "youtube-suggest";
import * as playDl from "play-dl";
import {getLocaleFor, getString} from "../localization";

export async function initPlay() {
    client.on("interactionCreate", async interaction => {
        if(!interaction.isChatInputCommand()) return;
        if(interaction.commandName != "play") return;

        await interaction.deferReply();

        let query = interaction.options.getString("query", true);

        let search = await player.search(query, {
            requestedBy: interaction.user
        });

        if(search.tracks.length <= 0) {
            await interaction.editReply(getString("messages.search.not_found", getLocaleFor(interaction))!);
            return;
        }

        if(violatesBlacklist(search.tracks[0]?.title)) {
            await interaction.editReply(getString("messages.blacklist", getLocaleFor(interaction))!);
            return;
        }

        let member = interaction.member as Discord.GuildMember;

        if(!member.voice.channel) {
            await interaction.editReply(getString("messages.no_vc", getLocaleFor(interaction))!);
            return;
        }

        let queue = player.createQueue(interaction.guild!, {
            leaveOnEmpty: true,
            metadata: {
                channel: interaction.channel
            },
            async onBeforeCreateStream(track, source, _queue) {
                // if(source != "youtube") return;
                return (await playDl.stream(track.url, { discordPlayerCompatibility: true })).stream;
            }
        });

        if(!queue?.connection) {
            await queue.connect(member.voice.channel!);
            // let voice = member.guild.me!.voice;
            // voice.selfDeaf = true;
            // voice.selfMute = false;
        }

        if(search.playlist) {
            await queue.addTracks(search.playlist.tracks);
            if(!queue.playing) await queue.play();

            await interaction.editReply({
                content: getString("messages.queue.playlist_added", getLocaleFor(interaction), { placeholders: {
                    PLAYLIST: search.playlist.title,
                    AUTHOR: search.playlist.author.name,
                    COUNT: search.playlist.tracks.length.toString()
                }}),
                components: [{
                    type: Discord.ComponentType.ActionRow,
                    components: [{
                        type: Discord.ComponentType.Button,
                        label: getString("messages.open_in_browser", getLocaleFor(interaction))!,
                        style: Discord.ButtonStyle.Link,
                        url: search.playlist.url
                    }]
                }]
            });
        } else {
            queue.addTrack(search.tracks[0]);
            if(!queue.playing) await queue.play();

            await interaction.editReply({
                content: getString("messages.queue.added", getLocaleFor(interaction), { placeholders: {
                    TRACK: search.tracks[0].title,
                    AUTHOR: search.tracks[0].author
                }}),
                components: [{
                    type: Discord.ComponentType.ActionRow,
                    components: [{
                        type: Discord.ComponentType.Button,
                        label: getString("messages.open_in_browser", getLocaleFor(interaction))!,
                        style: Discord.ButtonStyle.Link,
                        url: search.tracks[0].url
                    }]
                }]
            })
        }
    });

    client.on("interactionCreate", async interaction => {
        if(!interaction.isAutocomplete()) return;
        if(interaction.commandName != "play") return;

        let option = interaction.options.getFocused(true);
        if(option.name != "query") return await interaction.respond([]);
        let query = option.value.toString();
        if(query.length <= 2) return await interaction.respond([]);

        try {
            let suggestions = (await youtubeSuggest(query))
                .slice(0, 25)
                .map(e => {
                    return {name: e, value: e};
                });

            await interaction.respond(suggestions);
        } catch(e) {
            await interaction.respond([]);
        }
    });
}
