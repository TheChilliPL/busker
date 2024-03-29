import * as fs from "fs/promises";
import * as Utils from "./utils";
import * as Discord from "discord.js";
import {Queue} from "discord-player";
import {getCommandId} from "./commands";

export interface LocaleInfo {
    name: string
}

export interface LocalesInfo {
    [key: string]: LocaleInfo
}

export let localesInfo: LocalesInfo;
export let localeData: Record<string, Record<string, string>> = {};

export async function initLocales() {
    let localesFile = await fs.readFile("localization/locales.json");
    localesInfo = JSON.parse(localesFile.toString());

    for(let localeIndex in Object.keys(localesInfo)) {
        let localeId = Object.keys(localesInfo)[localeIndex];
        let dataFile = await fs.readFile(`localization/${localeId}.json`);
        let data = JSON.parse(dataFile.toString());
        localeData[localeIndex] = localeData[localeId] = Utils.flattenObject(data);
    }
}

export function processString(str: string, localeId?: string, placeholders?: Record<string, string>) {
    return str.replace(
        /\$\[([._\-\w]+)]/g,
        (_, key) => {
            return getString(key, localeId, {placeholders, fallback: true});
        }
    ).replace(
        /\$\{(\/?[._\-\w]+)}/g,
        (str, _key) => {
            let key = _key as string;
            if(key.startsWith("/")) {
                // Command formatting
                let commandName = key.substring(1);
                let commandId = getCommandId(commandName);
                if(!commandId) {
                    console.warn(`Command ${commandName} requested by localization file not found.`);
                    commandId = "0";
                }
                return `</${commandName}:${commandId}>`;
            }
            return placeholders?.[key] ?? str;
        }
    );
}

export interface GetStringOptions {
    placeholders?: Record<string, string>,
    fallback?: boolean
}

export function getString(
    key: string,
    localeId: string | undefined,
    options: GetStringOptions & { fallback: true }
): string;
export function getString(
    key: string,
    localeId?: string,
    options?: GetStringOptions
): string | null;

export function getString(
    key: string,
    localeId?: string,
    options?: GetStringOptions
): string | null {
    let locale = localeData[localeId || ""];

    let unprocessed = locale?.[key];

    if(unprocessed == null) {
        if(options?.fallback ?? true) unprocessed = localeData[0][key];
        else return null;
    }

    if(unprocessed == null) {
        throw new Error(`Couldn't find key ${key} in default locale.`);
    }

    return processString(unprocessed, localeId, options?.placeholders);
}

export function localizeProperty(
    key: string
): Record<string, string> | null {
    let localized = Object.keys(localesInfo)
        .flatMap(localeId => {
            let str = getString(key, localeId, { fallback: false });
            return str == null ? [] : [[localeId, str]];
        });

    if(localized.length == 0) return null;

    return Object.fromEntries(localized);
}

export function localizeObject(
    key: string
): {
    nameLocalizations?: Record<string, string>,
    description: string,
    descriptionLocalizations?: Record<string, string>
} {
    let nameLocalizations = localizeProperty(key + ".name");
    let description = getString(key + ".description", undefined, { fallback: true });
    let descriptionLocalizations = localizeProperty(key + ".description");

    return {
        ...nameLocalizations ? {nameLocalizations} : {},
        description,
        ...descriptionLocalizations ? {descriptionLocalizations} : {}
    };
}

export function localizeChoice(
    key: string
): {
    name: string,
    nameLocalizations?: Record<string, string>
} {
    let name = getString(key, undefined, { fallback: true });
    let nameLocalizations = localizeProperty(key);

    return {
        name,
        ...nameLocalizations ? {nameLocalizations} : {}
    };
}

export function getLocaleFor(guild: Discord.Guild): string;
export function getLocaleFor(interaction: Discord.Interaction): string;
export function getLocaleFor(queue: Queue): string;
export function getLocaleFor(something: any): string | undefined;
export function getLocaleFor(something: any): string | undefined {
    if(something instanceof Discord.Guild) {
        return something.preferredLocale;
    }
    if(something instanceof Discord.BaseInteraction) {
        return something.locale;
    }
    if(something instanceof Queue) {
        return something.guild.preferredLocale;
    }
    return undefined;
}
