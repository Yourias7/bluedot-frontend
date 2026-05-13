import { User } from './user';
import { Specialty } from './specialty';

export interface Doctor extends User {
    bio: string;
    clinicAddress: string;
    phoneNumber: string;
    yearsOfExperience: number;
    specialty?:Specialty;
}