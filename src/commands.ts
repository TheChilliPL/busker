import * as Discord from "discord.js";
import {ApplicationCommandData} from "discord.js";
import {client} from "./index";
import {initPlay} from "./commands/play";
import {initNp} from "./commands/np";
import {initPause} from "./commands/pause";
import {initResume} from "./commands/resume";
import {initSkip} from "./commands/skip";
import {initStop} from "./commands/stop";
import {initLoop} from "./commands/loop";
import {initSeek} from "./commands/seek";
import {initShuffle} from "./commands/shuffle";
import {Excess} from "./utils";
import {localizeChoice, localizeObject} from "./localization";

export async function registerCommands(guild?: Discord.Snowflake) {
    const commands: Excess<ApplicationCommandData>[] = [
        {
            name: "play",
            // description: commandDesc("play"),
            ...localizeObject("commands.play"),
            options: [
                {
                    type: "STRING",
                    name: "query",
                    required: true,
                    ...localizeObject("commands.play.options.query"),
                    autocomplete: true
                }
            ]
        },
        {
            name: "np",
            ...localizeObject("commands.np")
        },
        {
            name: "pause",
            ...localizeObject("commands.pause")
        },
        {
            name: "resume",
            ...localizeObject("commands.resume")
        },
        {
            name: "skip",
            ...localizeObject("commands.skip"),
            options: [
                {
                    type: "INTEGER",
                    name: "amount",
                    ...localizeObject("commands.skip.options.amount"),
                    minValue: 1
                }
            ]
        },
        {
            name: "stop",
            ...localizeObject("commands.stop")
        },
        {
            name: "loop",
            ...localizeObject("commands.loop"),
            options: [
                {
                    type: "STRING",
                    name: "mode",
                    required: true,
                    ...localizeObject("commands.loop.options.mode"),
                    choices: [
                        {
                            ...localizeChoice("commands.loop.options.mode.choices.off"),
                            value: "OFF"
                        },
                        {
                            ...localizeChoice("commands.loop.options.mode.choices.track"),
                            value: "TRACK"
                        },
                        {
                            ...localizeChoice("commands.loop.options.mode.choices.queue"),
                            value: "QUEUE"
                        },
                        {
                            ...localizeChoice("commands.loop.options.mode.choices.autoplay"),
                            value: "AUTOPLAY"
                        }
                    ]
                }
            ]
        },
        {
            name: "seek",
            ...localizeObject("commands.seek"),
            options: [{
                type: "STRING",
                name: "timestamp",
                ...localizeObject("commands.seek.options.timestamp"),
                required: true
            }]
        },
        {
            name: "shuffle",
            ...localizeObject("commands.shuffle")
        }
    ];

    if (guild) {
        await client.application.commands.set(commands, guild!);
    } else {
        await client.application.commands.set(commands);
    }
}

export async function removeCommands(guild?: Discord.Snowflake) {
    if (guild) {
        await client.application.commands.set([], guild!);
    } else {
        await client.application.commands.set([]);
    }
}

export async function addCommandListeners() {
    await initPlay();
    await initNp();
    await initPause();
    await initResume();
    await initSkip();
    await initStop();
    await initLoop();
    await initSeek();
    await initShuffle();
}