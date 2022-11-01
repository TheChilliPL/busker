import {Track} from "discord-player";

export type AllowedObjectKey = string | number | symbol;

export type Excess<T> = T & { [key: AllowedObjectKey]: unknown }

export type NestedRecord<Key extends AllowedObjectKey, Value>
    = { [key in Key]: Value | NestedRecord<Key, Value> }

export function prefixKeys<T>(obj: Record<string, T>, prefix: string): Record<string, T> {
    let out: Record<string, any> = {};

    for(let key in obj) {
        out[prefix + key] = obj[key];
    }

    return out;
}

export function flattenObject<T>(obj: NestedRecord<string | number, T>): Record<string, T>;
export function flattenObject(obj: any): any;
export function flattenObject(obj: any): any {
    if(typeof obj != "object") return obj.toString();

    let out: Record<string, any> = {};

    for(let key in obj) {
        if(typeof obj[key] == "object") {
            out = { ...out, ...prefixKeys(flattenObject(obj[key]), key + ".") }
        } else {
            out[key] = obj[key];
        }
    }

    return out;
}

export function randomInt(a: number, b: number) {
    let delta = b - a;
    return Math.floor(a + Math.random() * delta);
}

export function groupBy<T, P>(arr: T[], by: (element: T) => P) {
    let map = new Map<P, T[]>();

    function insert(element: T) {
        let value = by(element);
        if(!map.has(value)) map.set(value, []);
        map.get(value)!.push(element);
    }

    arr.forEach(insert);

    return Array.from(map.values());
}

export const enum ShufflingStrategy {
    /**
     * Using Fisher–Yates shuffle random permutation algorithm.
     */
    FisherYates,
    /**
     * Using an algorithm that makes the permutations seem more random to people
     * by making similar songs be spread more evenly.
     */
    Dithering
}

export let DefaultShufflingStrategy: ShufflingStrategy = ShufflingStrategy.Dithering;

export function fisherYatesShuffle<T>(elements: T[]) {
    for(let i = 0; i < elements.length - 2; i++) {
        let j = randomInt(i, elements.length);
        [elements[i], elements[j]] = [elements[j], elements[i]];
    }

    return elements;
}

export function ditherShuffle<T, G>(elements: T[], groupingFunc: (element: T) => G) {
    let groups = groupBy(elements, e => groupingFunc(e));
    let values = new Map(groups.flatMap(group => {
        // Shuffling each group normally
        fisherYatesShuffle(group);
        let interval = 1 / group.length;
        let start = Math.random() * interval;
        return group.map<[T, number]>((e, i) => [e, start + interval * i]);
    }));
    return elements.sort((a, b) => values.get(a)! - values.get(b)!);
}

export function shuffleTracks(tracks: Track[], shufflingStrategy = DefaultShufflingStrategy) {
    switch(shufflingStrategy) {
        case ShufflingStrategy.FisherYates:
            return fisherYatesShuffle(tracks);
        case ShufflingStrategy.Dithering:
            return ditherShuffle(tracks, t => t.author);
    }
}
