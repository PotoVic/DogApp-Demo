/*
 * Shared saved-dog domain type.
 */

// Database-shaped reusable dog profile belonging to one authenticated user.
export interface SavedDog {
  id: string;
  user_id: string;
  name: string;
  breed: string | null;
  phone_number: string | null;
  created_at: string;
  updated_at: string;
}
