export interface BookReviewDTO {
  id: number;
  bookTitle: string;
  summary: string | null;
  review: string | null;
  rating: number;
  createdAt: string;
}

export interface BookReviewInput {
  bookTitle: string;
  summary?: string;
  review?: string;
  rating: number;
}
