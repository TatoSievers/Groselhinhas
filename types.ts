
export interface Genre {
  id: number;
  name: string;
}

export interface Person {
  id: number;
  name: string;
  character?: string; // For actors
  job?: string; // For crew like director
  profile_path: string | null;
}

export interface Ratings {
  imdb: number; // 0-10

  // Review URLs
  imdbUrl: string;
}

export interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface Availability {
  link?: string;
  flatrate?: Provider[];
  rent?: Provider[];
  buy?: Provider[];
}

export interface Movie {
  id: number;
  title: string;
  year: number;
  releaseDate: string; // YYYY-MM-DD format
  type: 'Movie' | 'Series';
  posterUrl: string;
  synopsis: string;
  ratings: Ratings;
  durationInMinutes: number;
  trailerUrl: string;
  availability?: Availability;
  status?: 'new_episodes';
  inTheaters?: boolean;
  isTrending?: boolean;
  imdbId: string | null;
  
  // New detailed fields
  genres: Genre[];
  cast: Person[];
  director: Person | null;
  recommendations: Movie[];
  detailsFetched?: boolean;
  providersFetched?: boolean;
  imdbRatingFetched?: boolean;
}