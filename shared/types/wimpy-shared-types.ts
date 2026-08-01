export interface UserProfile {
  id: string;
  email: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
}
