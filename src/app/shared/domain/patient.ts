// patient model used across the app
// comprehends with returned Dto from backend
import { User } from './user';

export interface Patient extends User {
    dateOfBirth: Date;
    phoneNumber: string;
}
