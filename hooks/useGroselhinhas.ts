import { useState, useMemo, useEffect, useCallback } from 'react';
import { Movie, Ratings, Genre, Person, Provider, Availability } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const API_KEY = '7c572a9f5b3ba776080330d23bb76e1e';
const API_BASE_URL = 'https://api.themoviedb.org/3';

const GENRE_TRANSLATIONS: Record<number, string> = {
  28: 'Ação',
  12: 'Aventura',
  16: 'Animação',
  35: 'Comédia',
  80: 'Crime',
  99: 'Documentário',
  18: 'Drama',
  10751: 'Família',
  14: 'Fantasia',
  36: 'História',
  27: 'Terror',
  10402: 'Música',
  9648: 'Mistério',
  10749: 'Romance',
  878: 'Ficção Científica',
  10770: 'Cinema TV',
  53: 'Suspense',
  10752: 'Guerra',
  37: 'Faroeste',
  10759: 'Ação e Aventura',
  10762: 'Infantil',
  10763: 'Notícias',
  10764: 'Reality Show',
  10765: 'Ficção Científica e Fantasia',
  10766: 'Novela',
  10767: 'Talk Show',
  10768: 'Guerra e Política',
};

const MAJOR_PROVIDER_NAMES = new Set([
  'Netflix',
  'Amazon Prime Video',
  'Max',
  'Disney+',
  'Apple TV+',
  'Star+',
  'Globoplay',
  'Paramount+',
  'MUBI',
  'Crunchyroll',
]);

const uniqueProviders = (providers: Provider[] | undefined): Provider[] => {
  if (!providers) return [];
  const providerMap = new Map<string, Provider>();

  // This regex will strip channel suffixes.
  const channelRegex = /\s+(Amazon|Apple TV|Claro video) channel$/i;

  providers.forEach(p => {
    if (!p || typeof p.provider_id !== 'number') return;

    const normalizedName = p.provider_name.replace(channelRegex, '').trim();

    if (!providerMap.has(normalizedName)) {
      // Store a new provider object with the cleaned name.
      providerMap.set(normalizedName, { ...p, provider_name: normalizedName });
    }
  });

  const unique = Array.from(providerMap.values());

  return unique.sort((a, b) => a.provider_name.localeCompare(b.provider_name, 'pt-BR'));
};

const transformTmdbItem = (item: any, isTrending: boolean = false, genresList: Genre[] = []): Movie => {
  const type = item.title ? 'Movie' : 'Series';
  const title = item.title || item.name;
  const releaseDateStr = item.release_date || item.first_air_date || '';

  const d = new Date(releaseDateStr);
  const year = !isNaN(d.getTime()) ? d.getFullYear() : 0;

  const imdbId = item.external_ids?.imdb_id;
  const imdbUrl = imdbId ? `https://www.imdb.com/title/${imdbId}/` : `https://www.imdb.com/find?q=${encodeURIComponent(title)}`;

  const trailer = item.videos?.results?.find(
    (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  );
  const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '';

  const providersData = item['watch/providers']?.results?.BR;
  const availability: Availability = {
    link: providersData?.link,
    flatrate: uniqueProviders(providersData?.flatrate),
    rent: uniqueProviders(providersData?.rent),
    buy: uniqueProviders(providersData?.buy),
  };

  const initialRatings: Ratings = {
    imdb: item.vote_average || 0,
    imdbUrl: imdbUrl,
  };

  let itemGenres: Genre[] = [];
  if (item.genres) {
    itemGenres = item.genres;
  } else if (item.genre_ids && genresList.length > 0) {
    itemGenres = genresList.filter(g => item.genre_ids.includes(g.id));
  }

  return {
    id: item.id,
    title,
    year: year,
    releaseDate: releaseDateStr,
    type,
    posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
    synopsis: item.overview || 'Sinopse não disponível.',
    ratings: initialRatings,
    availability,
    durationInMinutes: item.runtime || (item.episode_run_time && item.episode_run_time[0]) || 0,
    trailerUrl,
    status: undefined,
    inTheaters: item.hasOwnProperty('release_dates'),
    isTrending,
    imdbId: imdbId || null,
    genres: itemGenres,
    cast: [],
    director: null,
    recommendations: [],
    detailsFetched: false,
    providersFetched: !!providersData,
    imdbRatingFetched: false,
  };
};

export const useGroselhinhas = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  // Use explicit generic for the Map state to avoid type inference issues
  const [allLoadedMovies, setAllLoadedMovies] = useState<Map<number, Movie>>(new Map<number, Movie>());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const [majorProviders, setMajorProviders] = useState<Provider[]>([]);
  const [otherProviders, setOtherProviders] = useState<Provider[]>([]);

  const { user } = useAuth();

  // Helper to save to Firestore
  const saveToFirestore = useCallback(async (
    newWatchlist: Set<number>,
    newWatched: Set<number>,
    newNotInterested: Set<number>
  ) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), {
        watchlist: Array.from(newWatchlist),
        watchedList: Array.from(newWatched),
        notInterestedList: Array.from(newNotInterested),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error("Error saving to Firestore", e);
    }
  }, [user]);

  // Filtering states
  const [activeServices, setActiveServices] = useState<Set<number>>(new Set());
  const [activeGenre, setActiveGenre] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<'All' | 'Movie' | 'Series'>('All');
  const [minRating, setMinRating] = useState(0.0);
  const [providerIdToGroupKey, setProviderIdToGroupKey] = useState<Map<number, string>>(new Map());
  const [providerGroups, setProviderGroups] = useState<Map<string, number[]>>(new Map());
  const [showAllProviders, setShowAllProviders] = useState(false);

  // List mode states
  const [watchlist, setWatchlist] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('groselhinhasWatchlist');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const [watchedList, setWatchedList] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('groselhinhasWatchedList');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const [notInterestedList, setNotInterestedList] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('groselhinhasNotInterestedList');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const [isWatchlistMode, setIsWatchlistMode] = useState<boolean>(false);
  const [isWatchedMode, setIsWatchedMode] = useState<boolean>(false);
  const [isNotInterestedMode, setIsNotInterestedMode] = useState<boolean>(false);

  // Sync with Firestore on login
  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.watchlist) setWatchlist(new Set(data.watchlist));
          if (data.watchedList) setWatchedList(new Set(data.watchedList));
          if (data.notInterestedList) setNotInterestedList(new Set(data.notInterestedList));
        } else {
          // New user in DB -> Sync current locals to DB
          saveToFirestore(watchlist, watchedList, notInterestedList);
        }
      } catch (e) {
        console.error("Error syncing with Firestore", e);
      }
    };
    fetchUserData();
  }, [user]); // Intentionally not including lists to avoid loop, only run on auth change

  // Modal and details states
  const [selectedMovie, _setSelectedMovie] = useState<Movie | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFullDetails = useCallback(async (movie: Movie, currentAllGenres: Genre[]): Promise<Movie> => {
    try {
      const movieType = movie.type === 'Movie' ? 'movie' : 'tv';
      const response = await fetch(`${API_BASE_URL}/${movieType}/${movie.id}?api_key=${API_KEY}&language=pt-BR&watch_region=BR&append_to_response=watch/providers,videos,credits,recommendations,external_ids`, { referrerPolicy: 'no-referrer' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const fullDetailsData = await response.json();


      if (!fullDetailsData.id) {
        console.error(`Falha ao buscar detalhes completos para ${movie.title}`, fullDetailsData);
        return movie;
      }

      const movieWithDetails = transformTmdbItem(fullDetailsData, false, currentAllGenres);

      const cast = fullDetailsData.credits?.cast?.slice(0, 15).map((p: any) => ({
        id: p.id,
        name: p.name,
        character: p.character,
        profile_path: p.profile_path,
      })) || [];

      const director = fullDetailsData.credits?.crew?.find((p: any) => p.job === 'Director');

      const recommendations = fullDetailsData.recommendations?.results
        ?.slice(0, 10)
        .map((rec: any) => transformTmdbItem(rec, false, currentAllGenres)) || [];

      let movieWithFullDetails = {
        ...movieWithDetails,
        cast,
        director: director ? { id: director.id, name: director.name, job: 'Director', profile_path: director.profile_path } : null,
        recommendations,
        detailsFetched: true,
        providersFetched: true,
      };

      if (movieWithFullDetails.imdbId) {
        try {
          const imdbResponse = await fetch(`https://imdbapi.dev/v1/titles/${movieWithFullDetails.imdbId}`, { referrerPolicy: 'no-referrer' });
          if (imdbResponse.ok) {
            const imdbData = await imdbResponse.json();
            if (imdbData?.rating?.average) {
              movieWithFullDetails.ratings.imdb = imdbData.rating.average;
              movieWithFullDetails.imdbRatingFetched = true;
            }
          }
        } catch (e) {
          console.error(`Failed to fetch IMDb rating for ${movieWithFullDetails.title} in details view`, e);
        }
      }

      return movieWithFullDetails;

    } catch (err) {
      console.error(`Falha ao buscar detalhes completos para ${movie.title}`, err);
      setError(`Não foi possível carregar os detalhes para ${movie.title}. Por favor, tente novamente mais tarde.`);
      return { ...movie, detailsFetched: true, providersFetched: true }; // Mark as fetched even on error to avoid re-fetching loop
    }
  }, []);


  const setSelectedMovie = useCallback(async (movie: Movie | null) => {
    if (movie === null) {
      _setSelectedMovie(null);
      return;
    }

    // Immediately present the best available data.
    // Explicit type to fix "Property 'detailsFetched' does not exist on type 'unknown'"
    const cachedMovie: Movie | undefined = allLoadedMovies.get(movie.id);
    _setSelectedMovie(cachedMovie || movie);

    // Show loading skeleton only if we don't have detailed data cached.
    if (!cachedMovie?.detailsFetched) {
      setIsFetchingDetails(true);
    }

    // Always re-fetch in the background to get the latest scores and provider info.
    try {
      const freshDetailedMovie = await fetchFullDetails(movie, allGenres);

      // Update the session-wide cache.
      setAllLoadedMovies(prev => new Map(prev).set(freshDetailedMovie.id, freshDetailedMovie));

      // Update the modal's state if the user is still viewing the same movie.
      _setSelectedMovie(currentMovie =>
        (currentMovie && currentMovie.id === freshDetailedMovie.id) ? freshDetailedMovie : currentMovie
      );
    } catch (err) {
      console.error(`Failed to refresh details for ${movie.title}`, err);
      // On error, we just keep the stale data. No need to do anything.
    } finally {
      // Ensure loading indicator is turned off.
      setIsFetchingDetails(false);
    }
  }, [fetchFullDetails, allGenres, allLoadedMovies]);

  // Fetch genres and providers on initial load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const movieGenresPromise = fetch(`${API_BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=pt-BR`, { referrerPolicy: 'no-referrer' }).then(res => res.json());
        const tvGenresPromise = fetch(`${API_BASE_URL}/genre/tv/list?api_key=${API_KEY}&language=pt-BR`, { referrerPolicy: 'no-referrer' }).then(res => res.json());
        const movieProvidersPromise = fetch(`${API_BASE_URL}/watch/providers/movie?api_key=${API_KEY}&language=pt-BR&watch_region=BR`, { referrerPolicy: 'no-referrer' }).then(res => res.json());
        const tvProvidersPromise = fetch(`${API_BASE_URL}/watch/providers/tv?api_key=${API_KEY}&language=pt-BR&watch_region=BR`, { referrerPolicy: 'no-referrer' }).then(res => res.json());

        const [movieGenresData, tvGenresData, movieProvidersData, tvProvidersData] = await Promise.all([
          movieGenresPromise, tvGenresPromise, movieProvidersPromise, tvProvidersPromise
        ]);

        const genresMap = new Map<number, Genre>();
        (movieGenresData?.genres || []).forEach((genre: Genre) => genresMap.set(genre.id, genre));
        (tvGenresData?.genres || []).forEach((genre: Genre) => {
          if (!genresMap.has(genre.id)) genresMap.set(genre.id, genre);
        });

        const combinedGenres = Array.from(genresMap.values())
          .map(genre => ({ ...genre, name: GENRE_TRANSLATIONS[genre.id] || genre.name }))
          .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

        setAllGenres(combinedGenres);

        const providersMap = new Map<number, Provider>();
        (movieProvidersData?.results || []).forEach((p: Provider) => providersMap.set(p.provider_id, p));
        (tvProvidersData?.results || []).forEach((p: Provider) => {
          if (!providersMap.has(p.provider_id)) providersMap.set(p.provider_id, p);
        });
        const allFetchedProviders = Array.from(providersMap.values());

        const channelRegex = /\s+(Amazon|Apple TV|Claro video) channel$/i;
        const normalizedProviderGroups = new Map<string, Provider[]>();
        const idToKeyMap = new Map<number, string>();

        allFetchedProviders.forEach(p => {
          const normalizedName = p.provider_name.replace(channelRegex, '').trim();
          idToKeyMap.set(p.provider_id, normalizedName);

          if (!normalizedProviderGroups.has(normalizedName)) {
            normalizedProviderGroups.set(normalizedName, []);
          }
          normalizedProviderGroups.get(normalizedName)!.push(p);
        });

        const displayProviders: Provider[] = [];
        const groupsForState = new Map<string, number[]>();
        const sortedGroupKeys = Array.from(normalizedProviderGroups.keys()).sort((a, b) => a.localeCompare(b, 'pt-BR'));

        sortedGroupKeys.forEach(key => {
          const group = normalizedProviderGroups.get(key)!;
          displayProviders.push({ ...group[0], provider_name: key });
          groupsForState.set(key, group.map(p => p.provider_id));
        });

        const majors: Provider[] = [];
        const others: Provider[] = [];
        displayProviders.forEach(p => {
          if (MAJOR_PROVIDER_NAMES.has(p.provider_name)) {
            majors.push(p);
          } else {
            others.push(p);
          }
        });

        setMajorProviders(majors);
        setOtherProviders(others);
        setProviderIdToGroupKey(idToKeyMap);
        setProviderGroups(groupsForState);

      } catch (err) {
        setError("Não foi possível carregar os filtros. Tente recarregar a página.");
      }
    };
    fetchInitialData();
  }, []);

  // Main data fetching effect for pagination and filtering
  useEffect(() => {
    if (isWatchlistMode || isWatchedMode || isNotInterestedMode || searchTerm || !allGenres.length) {
      if (!searchTerm) setIsLoading(false);
      return;
    }

    const fetchDataForPage = async () => {
      setIsLoading(true);
      setError(null);

      const providers = Array.from(activeServices).join('|');
      const genres = activeGenre ? String(activeGenre) : '';

      let moviePromise = Promise.resolve({ results: [], total_pages: 0 });
      let seriesPromise = Promise.resolve({ results: [], total_pages: 0 });

      const today = new Date().toISOString().split('T')[0];
      const filterParams = `${providers ? `&with_watch_providers=${providers}&watch_region=BR` : ''}${genres ? `&with_genres=${genres}` : ''}${minRating > 0 ? `&vote_average.gte=${minRating}` : ''}`;
      const commonParams = `api_key=${API_KEY}&language=pt-BR&page=${currentPage}&region=BR&vote_count.gte=100`;

      if (typeFilter !== 'Series') {
        const movieParams = `${commonParams}&sort_by=primary_release_date.desc&primary_release_date.lte=${today}`;
        moviePromise = fetch(`${API_BASE_URL}/discover/movie?${movieParams}${filterParams}`, { referrerPolicy: 'no-referrer' }).then(res => res.json());
      }
      if (typeFilter !== 'Movie') {
        const seriesParams = `${commonParams}&sort_by=first_air_date.desc&first_air_date.lte=${today}`;
        seriesPromise = fetch(`${API_BASE_URL}/discover/tv?${seriesParams}${filterParams}`, { referrerPolicy: 'no-referrer' }).then(res => res.json());
      }

      try {
        const [movieData, seriesData] = await Promise.all([moviePromise, seriesPromise]);
        const combined = [...(movieData.results || []), ...(seriesData.results || [])];

        const transformed = combined.map(item => transformTmdbItem(item, false, allGenres));

        transformed.sort((a, b) => {
          if (a.releaseDate && b.releaseDate) {
            return b.releaseDate.localeCompare(a.releaseDate);
          }
          if (!a.releaseDate) return 1;
          if (!b.releaseDate) return -1;
          return 0;
        });

        setMovies(transformed);
        // Fix: Explicitly type prevMap to avoid "unknown" inference errors on line 350
        setAllLoadedMovies((prevMap: Map<number, Movie>) => {
          const newMap = new Map<number, Movie>(prevMap);
          transformed.forEach(m => {
            // Avoid overwriting a fully detailed movie with a partial one
            const existingMovie = newMap.get(m.id);
            if (!existingMovie || !existingMovie.detailsFetched) {
              newMap.set(m.id, m);
            }
          });
          return newMap;
        });
        setTotalPages(Math.min(500, Math.max(movieData.total_pages || 0, seriesData.total_pages || 0)));
      } catch (err: any) {
        console.error("Failed to fetch page data:", err);
        let newError = "Falha ao carregar conteúdo. Tente novamente mais tarde.";
        if (String(err.message).includes('Failed to fetch')) {
          newError = "Falha de conexão. Verifique sua internet.";
        } else {
          newError = err.message || newError;
        }
        if (newError) setError(currentError => currentError || newError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataForPage();

  }, [currentPage, typeFilter, activeServices, activeGenre, isWatchlistMode, isWatchedMode, isNotInterestedMode, searchTerm, allGenres, minRating]);

  // Effect to enrich movies with watch provider information after they are loaded
  useEffect(() => {
    const enrichMoviesWithProviders = async () => {
      const moviesToEnrich = movies.filter(m => !m.providersFetched);
      if (moviesToEnrich.length === 0) return;

      // Immediately mark as fetched to prevent re-enrichment loops
      const fetchingIds = new Set(moviesToEnrich.map(m => m.id));
      setMovies(currentMovies =>
        currentMovies.map(m =>
          fetchingIds.has(m.id) ? { ...m, providersFetched: true } : m
        )
      );

      const providerPromises = moviesToEnrich.map(movie => {
        const movieType = movie.type === 'Movie' ? 'movie' : 'tv';
        return fetch(`${API_BASE_URL}/${movieType}/${movie.id}/watch/providers?api_key=${API_KEY}`, { referrerPolicy: 'no-referrer' })
          .then(res => res.json())
          .then(data => ({
            id: movie.id,
            providersData: data.results?.BR,
          }))
          .catch(err => {
            console.error(`Failed to fetch providers for ${movie.id}`, err);
            return { id: movie.id, providersData: null }; // Return null on error to not break Promise.all
          });
      });

      const results = await Promise.all(providerPromises);
      const providerMap = new Map<number, any>();
      results.forEach(res => providerMap.set(res.id, res.providersData));

      const updateMovieWithProviders = (movie: Movie): Movie => {
        const providersData = providerMap.get(movie.id);
        if (providersData) {
          return {
            ...movie,
            availability: {
              link: providersData.link,
              flatrate: uniqueProviders(providersData.flatrate),
              rent: uniqueProviders(providersData.rent),
              buy: uniqueProviders(providersData.buy),
            },
            providersFetched: true,
          };
        }
        return movie;
      }

      setMovies(currentMovies =>
        currentMovies.map(m => providerMap.has(m.id) ? updateMovieWithProviders(m) : m)
      );

      setAllLoadedMovies((currentCache: Map<number, Movie>) => {
        const newCache = new Map<number, Movie>(currentCache);
        // Explicit types for forEach to avoid unknown errors
        newCache.forEach((movie: Movie, id: number) => {
          if (providerMap.has(id)) {
            newCache.set(id, updateMovieWithProviders(movie));
          }
        });
        return newCache;
      });
    };

    if (!isWatchlistMode && !isWatchedMode && !isNotInterestedMode && movies.length > 0) {
      enrichMoviesWithProviders();
    }

  }, [movies, isWatchlistMode, isWatchedMode, isNotInterestedMode]);

  // Effect to enrich movies with real IMDb ratings
  useEffect(() => {
    const enrichMoviesWithImdbRatings = async () => {
      const moviesToEnrich = movies.filter(m => !m.imdbRatingFetched && m.imdbId);
      if (moviesToEnrich.length === 0) return;

      const fetchingIds = new Set(moviesToEnrich.map(m => m.id));
      setMovies(currentMovies =>
        currentMovies.map(m =>
          fetchingIds.has(m.id) ? { ...m, imdbRatingFetched: true } : m
        )
      );

      const ratingPromises = moviesToEnrich.map(movie =>
        fetch(`https://imdbapi.dev/v1/titles/${movie.imdbId}`, { referrerPolicy: 'no-referrer' })
          .then(res => res.ok ? res.json() : null)
          .then(data => ({
            id: movie.id,
            imdbRating: data?.rating?.average || null,
          }))
          .catch(err => {
            console.error(`Failed to fetch IMDb rating for ${movie.id}`, err);
            return { id: movie.id, imdbRating: null };
          })
      );

      const results = await Promise.all(ratingPromises);
      const ratingMap = new Map<number, number>();
      results.forEach(res => {
        if (res.imdbRating !== null) {
          ratingMap.set(res.id, res.imdbRating);
        }
      });

      const updateMovieWithRating = (movie: Movie): Movie => {
        const newRating = ratingMap.get(movie.id);
        return {
          ...movie,
          ratings: newRating ? { ...movie.ratings, imdb: newRating } : movie.ratings,
          imdbRatingFetched: true,
        };
      };

      setMovies(currentMovies =>
        currentMovies.map(m => fetchingIds.has(m.id) ? updateMovieWithRating(m) : m)
      );

      setAllLoadedMovies((currentCache: Map<number, Movie>) => {
        const newCache = new Map<number, Movie>(currentCache);
        // Explicit type for fetchingIds iterator to avoid unknown id error
        fetchingIds.forEach((id: number) => {
          const movie = newCache.get(id);
          if (movie) {
            newCache.set(id, updateMovieWithRating(movie));
          }
        });
        return newCache;
      });
    };

    if (!isWatchlistMode && !isWatchedMode && !isNotInterestedMode && movies.length > 0) {
      enrichMoviesWithImdbRatings();
    }
  }, [movies, isWatchlistMode, isWatchedMode, isNotInterestedMode]);


  // Effect to enrich movies with trailer videos
  useEffect(() => {
    const enrichMoviesWithVideos = async () => {
      // Only fetch for movies that don't have a trailer URL yet and haven't tried fetching
      const moviesToEnrich = movies.filter(m => !m.videosFetched && !m.trailerUrl);
      if (moviesToEnrich.length === 0) return;

      const fetchingIds = new Set(moviesToEnrich.map(m => m.id));
      setMovies(currentMovies =>
        currentMovies.map(m =>
          fetchingIds.has(m.id) ? { ...m, videosFetched: true } : m
        )
      );

      const videoPromises = moviesToEnrich.map(movie => {
        const movieType = movie.type === 'Movie' ? 'movie' : 'tv';
        return fetch(`${API_BASE_URL}/${movieType}/${movie.id}/videos?api_key=${API_KEY}&language=pt-BR`, { referrerPolicy: 'no-referrer' })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            const trailer = data?.results?.find(
              (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
            );
            return {
              id: movie.id,
              trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '',
            };
          })
          .catch(err => {
            console.error(`Failed to fetch videos for ${movie.id}`, err);
            return { id: movie.id, trailerUrl: '' };
          });
      });

      const results = await Promise.all(videoPromises);
      const videoMap = new Map<number, string>();
      results.forEach(res => {
        if (res.trailerUrl) {
          videoMap.set(res.id, res.trailerUrl);
        }
      });

      const updateMovieWithVideo = (movie: Movie): Movie => {
        const newTrailerUrl = videoMap.get(movie.id);
        return {
          ...movie,
          trailerUrl: newTrailerUrl || movie.trailerUrl,
          videosFetched: true,
        };
      };

      setMovies(currentMovies =>
        currentMovies.map(m => fetchingIds.has(m.id) ? updateMovieWithVideo(m) : m)
      );

      setAllLoadedMovies((currentCache: Map<number, Movie>) => {
        const newCache = new Map<number, Movie>(currentCache);
        fetchingIds.forEach((id: number) => {
          const movie = newCache.get(id);
          if (movie) {
            newCache.set(id, updateMovieWithVideo(movie));
          }
        });
        return newCache;
      });
    };

    if (!isWatchlistMode && !isWatchedMode && !isNotInterestedMode && movies.length > 0) {
      enrichMoviesWithVideos();
    }
  }, [movies, isWatchlistMode, isWatchedMode, isNotInterestedMode]);


  // Debounced search effect
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsLoading(true);
    setIsSearching(true);
    const handler = setTimeout(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/search/multi?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(searchTerm)}&page=1`, { referrerPolicy: 'no-referrer' });
        const data = await response.json();
        const results = data.results
          .filter((item: any) => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path)
          .map((item: any) => transformTmdbItem(item, false, allGenres));
        setSearchResults(results);
      } catch (err) {
        console.error("Search failed", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
        setIsLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, allGenres]);

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleSetIsWatchlistMode = (value: boolean) => {
    setIsWatchlistMode(value);
    if (value) {
      setIsWatchedMode(false);
      setIsNotInterestedMode(false);
      setCurrentPage(1);
    }
  };

  const handleSetIsWatchedMode = (value: boolean) => {
    setIsWatchedMode(value);
    if (value) {
      setIsWatchlistMode(false);
      setIsNotInterestedMode(false);
      setCurrentPage(1);
    }
  };

  const handleSetIsNotInterestedMode = (value: boolean) => {
    setIsNotInterestedMode(value);
    if (value) {
      setIsWatchlistMode(false);
      setIsWatchedMode(false);
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    localStorage.setItem('groselhinhasWatchlist', JSON.stringify(Array.from(watchlist)));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('groselhinhasWatchedList', JSON.stringify(Array.from(watchedList)));
  }, [watchedList]);

  useEffect(() => {
    localStorage.setItem('groselhinhasNotInterestedList', JSON.stringify(Array.from(notInterestedList)));
  }, [notInterestedList]);

  const toggleServiceFilter = (toggledProviderId: number) => {
    const groupKey = providerIdToGroupKey.get(toggledProviderId);
    if (!groupKey) return;

    const providerIdsInGroup = providerGroups.get(groupKey) || [];

    setActiveServices(prev => {
      const newSet = new Set(prev);
      const isAnyActive = providerIdsInGroup.some(id => newSet.has(id));

      if (isAnyActive) {
        providerIdsInGroup.forEach(id => newSet.delete(id));
      } else {
        providerIdsInGroup.forEach(id => newSet.add(id));
      }
      return newSet;
    });
    setCurrentPage(1);
  };

  const toggleGenreFilter = (genreId: number) => {
    setActiveGenre(prev => (prev === genreId ? null : genreId));
    setCurrentPage(1);
  };

  const clearGenreFilter = () => {
    setActiveGenre(null);
    setCurrentPage(1);
  }

  const wrappedSetTypeFilter = (type: 'All' | 'Movie' | 'Series') => {
    setTypeFilter(type);
    setCurrentPage(1);
  };

  const handleSetMinRating = (rating: number) => {
    setMinRating(rating);
    setCurrentPage(1);
  }

  const toggleWatchlist = (movieId: number) => {
    setWatchlist(prev => {
      const newSet = new Set(prev);
      if (newSet.has(movieId)) newSet.delete(movieId);
      else newSet.add(movieId);

      saveToFirestore(newSet, watchedList, notInterestedList);
      return newSet;
    });
  };

  const toggleWatched = (movieId: number) => {
    setWatchedList(prev => {
      const newSet = new Set(prev);
      if (newSet.has(movieId)) newSet.delete(movieId);
      else {
        newSet.add(movieId);
      }

      saveToFirestore(watchlist, newSet, notInterestedList);
      return newSet;
    });
  };

  const toggleNotInterested = (movieId: number) => {
    setNotInterestedList(prev => {
      const newSet = new Set(prev);
      if (newSet.has(movieId)) {
        newSet.delete(movieId);
      } else {
        newSet.add(movieId);
      }

      saveToFirestore(watchlist, watchedList, newSet);
      return newSet;
    });
  };

  const isServiceActive = useCallback((providerId: number): boolean => {
    const groupKey = providerIdToGroupKey.get(providerId);
    if (!groupKey) return activeServices.has(providerId);

    const providerIdsInGroup = providerGroups.get(groupKey) || [];
    return providerIdsInGroup.some(id => activeServices.has(id));
  }, [activeServices, providerIdToGroupKey, providerGroups]);

  const filteredAndSortedMovies = useMemo(() => {
    let baseData: Movie[];

    if (searchTerm) {
      baseData = searchResults;
    } else if (isWatchlistMode) {
      // Explicit generic to fix unknown mapping error
      baseData = Array.from<Movie>(allLoadedMovies.values()).filter((movie: Movie) => watchlist.has(movie.id));
    } else if (isWatchedMode) {
      baseData = Array.from<Movie>(allLoadedMovies.values()).filter((movie: Movie) => watchedList.has(movie.id));
    } else if (isNotInterestedMode) {
      baseData = Array.from<Movie>(allLoadedMovies.values()).filter((movie: Movie) => notInterestedList.has(movie.id));
    } else {
      baseData = movies.filter(movie => !watchedList.has(movie.id) && !notInterestedList.has(movie.id) && !movie.isTrending);
    }

    let moviesToDisplay = baseData;
    // For general browsing, only show movies with a valid score
    if (!isWatchlistMode && !isWatchedMode && !isNotInterestedMode && !searchTerm) {
      moviesToDisplay = baseData.filter(movie => movie.ratings.imdb > 0);
    }

    if (searchTerm) {
      return moviesToDisplay; // Do not sort search results, keep relevance from API
    }

    return [...moviesToDisplay].sort((a, b) => {
      if (a.releaseDate && b.releaseDate) {
        return b.releaseDate.localeCompare(a.releaseDate);
      }
      if (a.releaseDate) return -1;
      if (b.releaseDate) return 1;
      return 0;
    });

  }, [movies, allLoadedMovies, watchlist, isWatchlistMode, watchedList, isWatchedMode, searchTerm, searchResults, notInterestedList, isNotInterestedMode]);

  const trendingMovies = useMemo(() => {
    return []; // Trending section is disabled with pagination model for now to simplify
  }, []);

  const displayedGenres = useMemo(() => {
    return allGenres;
  }, [allGenres]);

  return {
    filteredAndSortedMovies,
    toggleServiceFilter,
    isServiceActive,
    watchlist,
    toggleWatchlist,
    watchedList,
    toggleWatched,
    isWatchlistMode,
    setIsWatchlistMode: handleSetIsWatchlistMode,
    isWatchedMode,
    setIsWatchedMode: handleSetIsWatchedMode,
    typeFilter,
    setTypeFilter: wrappedSetTypeFilter,
    trendingMovies,
    isLoading,
    error,
    selectedMovie,
    setSelectedMovie,
    isFetchingDetails,
    genres: displayedGenres,
    activeGenre,
    toggleGenreFilter,
    clearGenreFilter,
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    clearSearch,
    currentPage,
    totalPages,
    setCurrentPage,
    minRating,
    setMinRating: handleSetMinRating,
    toggleNotInterested,
    notInterestedList,
    isNotInterestedMode,
    setIsNotInterestedMode: handleSetIsNotInterestedMode,
    majorProviders,
    otherProviders,
    showAllProviders,
    setShowAllProviders,
  };
};