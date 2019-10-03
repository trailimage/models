import { JsonLD, LinkData } from '@toba/json-ld';
export declare class VideoInfo implements LinkData<JsonLD.VideoObject> {
    id: string;
    width: number;
    height: number;
    constructor(id: string, width: number, height: number);
    readonly empty: boolean;
    jsonLD(): JsonLD.VideoObject;
}
