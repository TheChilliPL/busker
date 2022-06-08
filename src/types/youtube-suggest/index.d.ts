declare module 'youtube-suggest' {
    export default function youtubeSuggest(query: string): Promise<string[]>;
}