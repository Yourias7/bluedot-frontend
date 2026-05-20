// specialty model used across the app
// comprehends with returned Dto from backend and extends base model for id property
import { BaseModel } from "./base-model";

export interface Specialty extends BaseModel{
    name: string;
}