export interface BookReviewDTO {
  id: number;
  bookTitle: string;
  summary: string | null;
  review: string | null;
  quote: string | null;
  food: string | null;
  music: string | null;
  rating: number;
  showDuration: boolean;
  showWeatherNote: boolean;
  todayActivity: string | null;
  durationMinutes: number | null;
  createdAt: string;
}

export interface BookReviewInput {
  bookTitle: string;
  summary?: string;
  review?: string;
  quote?: string;
  food?: string;
  music?: string;
  rating: number;
  showDuration?: boolean;
  showWeatherNote?: boolean;
  todayActivity?: string;
  durationMinutes?: number | null;
}
