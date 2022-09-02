export type MessageEventType<T = any> = {
    type: string;
    data?: T;
};
