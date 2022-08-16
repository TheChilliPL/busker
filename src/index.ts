import * as Discord from "discord.js";
import * as fs from "fs/promises";
import {logHelp, Parameter, parseArguments} from "./arguments";
import {Player} from "discord-player";
import {addCommandListeners, registerCommands, removeCommands} from "./commands";
import "./commands/play";
import {ProgressCharSet} from "./progress";
import {getPlayerStatus, getStatusChannel} from "./status";
import {getLocaleFor, getString, initLocales} from "./localization";

export let client: Discord.Client<true>;

export let player: Player;

export interface Config {
    token: string;
    commands: {[key: string]: string};
    progressCharSet?: ProgressCharSet;
    blacklist: string[];
}

export let config: Config;

export function violatesBlacklist(string: string): boolean {
    if(!string) return false;

    let stringLower = string.toLowerCase();
    return config.blacklist.some(word => stringLower.includes(word.toLowerCase()));
}

async function init() {
    let stopExecution = false;
    let shouldRegisterCommands = false;
    let shouldRemoveCommands = false;
    let guilds: Discord.Snowflake[] = [];
    const parameters: Parameter[] = [
        {
            name: "help",
            description: "Shows help dialog",
            aliases: ["h", "?"],
            execute: () => { logHelp(parameters); stopExecution = true; }
        },
        {
            name: "register-commands",
            aliases: ["C"],
            execute: () => { shouldRegisterCommands = true; }
        },
        {
            name: "remove-commands",
            execute: () => { shouldRemoveCommands = true; }
        },
        {
            name: "g",
            execute: g => guilds.push(g)
        }
    ];
    parseArguments(parameters);

    let configFile = await fs.readFile("config.json");
    config = JSON.parse(configFile.toString());

    await initLocales();

    let token = config.token;

    client = new Discord.Client({
        intents: [
            Discord.IntentsBitField.Flags.Guilds,
            Discord.IntentsBitField.Flags.GuildVoiceStates
        ]
    });

    await client.login(token);

    if(shouldRegisterCommands) {
        console.info("Registering commands");
        if(guilds.length > 0) console.info("Guild ID-s: " + guilds);
        for(let guild of guilds)
            await registerCommands(guild);
        if(guilds.length == 0) await registerCommands();
        client.destroy();
        return;
    } else if(shouldRemoveCommands) {
        console.info("Removing commands");
        if(guilds.length > 0) console.info("Guild ID-s: " + guilds);
        for(let guild of guilds)
            await removeCommands(guild);
        if(guilds.length == 0) await removeCommands();
        client.destroy();
        return;
    }

    player = new Player(client, {
        // spotifyBridge: false
    });

    await addCommandListeners();

    player.on("trackStart", async (queue, track) => {
        let channel = await getStatusChannel(queue);
        if(!channel) return;

        await channel.send({
            content: getString("messages.queue.new_track", getLocaleFor(queue), {
                placeholders: {
                    TRACK: track.title,
                    DURATION: track.duration,
                    AUTHOR: track.author
                }
            }),
            ...getPlayerStatus(queue)
        });
    });

    player.on("queueEnd", async queue => {
        let channel = await getStatusChannel(queue);
        if(!channel) return;

        await channel.send(getString("messages.queue.end", getLocaleFor(queue))!);
    });

    player.on("channelEmpty", async queue => {
        let channel = await getStatusChannel(queue);
        if(!channel) return;

        await channel.send(getString("messages.queue.channel_empty", getLocaleFor(queue))!);
    });

    console.info("Initialized.");
}

init().catch(console.error);
