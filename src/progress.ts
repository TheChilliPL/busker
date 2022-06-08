import {config} from "./index";

export interface ProgressCharSet {
    prefix?: string
    suffix?: string

    fullSet: string
    fullMid: string
    fullEnd: string

    lastSet: string
    lastMid: string
    lastEnd: string

    emptySet: string
    emptyMid: string
    emptyEnd: string
}

export function getConfigProgressCharSet(): ProgressCharSet {
    return config.progressCharSet ?? {
        prefix: "`", suffix: "`",

        emptySet: "\xa0", emptyMid: "\xa0", emptyEnd: "\xa0",

        lastSet: "%", lastMid: "%", lastEnd: "%",

        fullSet: "#", fullMid: "#", fullEnd: "#"
    }
}

export function drawProgress(progress: number, length: number, charSet: ProgressCharSet = getConfigProgressCharSet()) {
    let lastCharIndex = Math.ceil(progress * length) - 1;
    let output = charSet.prefix ?? "";

    function dep(index: number, set: string, mid: string, end: string) {
        return index == 0
            ? set
            : index == length - 1
                ? end
                : mid;
    }

    function full(index: number) {
        return dep(index, charSet.fullSet, charSet.fullMid, charSet.fullEnd);
    }

    function last(index: number) {
        return dep(index, charSet.lastSet, charSet.lastMid, charSet.lastEnd);
    }

    function empty(index: number) {
        return dep(index, charSet.emptySet, charSet.emptyMid, charSet.emptyEnd);
    }

    for(let i = 0; i < length; i++) {
        switch(Math.sign(i - lastCharIndex)) {
            case -1:
                output += full(i);
                break;
            case 0:
                output += last(i);
                break;
            case 1:
                output += empty(i);
        }
    }

    if(charSet.suffix) output += charSet.suffix;

    return output;
}