export type ChatMessage = {
  sender: 'doctor' | 'patient';
  text: string;
  sentAt: string;
};