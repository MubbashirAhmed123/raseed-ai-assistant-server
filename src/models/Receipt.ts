
import { Timestamp } from 'firebase/firestore'; // Import Timestamp type

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  // Add other item-specific properties if needed, e.g., 'category'
}

// Define the Receipt document structure
export interface Receipt {
  // We'll store the userId in the document, especially if not strictly enforcing subcollections
  // or for easier indexing across all receipts if needed (though subcollections are often best)
  userId: string;
  merchantName: string;
  date: Timestamp; // Use Firestore's Timestamp type
  total: number;
  subtotal: number;
  tax?: number; // Optional, like in your Mongoose schema
  currency: string;
  items: ReceiptItem[]; // Array of ReceiptItem objects
  originalImageUrl?: string; // Optional
  processingStatus: 'pending' | 'processed' | 'error'; // Use a union type for enum
  insightsPassId?: string; // Optional
  createdAt?: Timestamp; // Firestore automatically adds these with server timestamps
  updatedAt?: Timestamp; // Firestore automatically adds these with server timestamps
}

// You might also want a type for creating new receipts, where some fields are optional
// or are handled by the server (like timestamps)
export type NewReceipt = Omit<Receipt, 'createdAt' | 'updatedAt'>;
