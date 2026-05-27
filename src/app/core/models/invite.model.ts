/**
 * Invite Model - Domain Interface
 * Represents the invitation object from the API
 */

export interface Invite {
  _id: string; // MongoDB ObjectId
  name: string; // Guest name
  email?: string; // Email address (optional)
  day: string;
  confirmed: boolean; // Attendance confirmation status
  previewTitle?: string;
  previewDescription?: string;
  previewImage?: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}
