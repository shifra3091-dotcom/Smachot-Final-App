import type { ReadyAlbum } from './ReadyAlbum';

export interface EventType {
    EventTypeId: number;
    EventTypeNameKey: string;
    DefaultAlbumSCount: number;
    ReadyAlbums: ReadyAlbum[];
}