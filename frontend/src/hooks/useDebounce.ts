import { useEffect, useState } from 'react';

/**
 * Hook per ritardare l'aggiornamento di un valore fino a quando
 * non passano `delay` millisecondi senza modifiche.
 *
 * Utile per evitare chiamate API eccessive durante la digitazione.
 *
 * @param value - Il valore da "debounciare"
 * @param delay - Ritardo in millisecondi (default: 300ms)
 * @returns Il valore debounciato
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * // La query parte solo 500ms dopo che l'utente smette di digitare
 * useQuery({
 *   queryKey: ['search', debouncedSearchTerm],
 *   queryFn: () => api.search(debouncedSearchTerm),
 *   enabled: debouncedSearchTerm.length >= 2,
 * });
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if value changes before the delay has passed
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
