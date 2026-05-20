// review model used across the app
// comprehends with returned Dto from backend
import { BaseModel } from './base-model';

export interface Review extends BaseModel {
    rating: number;
    comment?: string;
    patientName?: string;
    createdAt?: string;
    doctorId?: number;
}
