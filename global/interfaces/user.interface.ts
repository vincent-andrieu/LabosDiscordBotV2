export interface IUser {
    _id: string;
    role: ERole;
}

export enum ERole {
    ADMIN = 'admin',
    USER = 'user'
}