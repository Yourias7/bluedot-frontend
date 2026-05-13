import { User } from './user';

export interface Patient extends User {
    dateOfBirth: Date;
    phoneNumber: string;
}
