export interface Hall {
    HallId: number;
    Name: string;
    OwnerUserId: number;
    OwnerUserName: string;
    QrCodeSource?: string;
    CreatedAt?: string;
    EventsCount?: number;
    FeedbacksCount?: number;
}