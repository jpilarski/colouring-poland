/**
 * Search domain service
 * - obsługa logiki wyszukiwania obiektów na mapie
 * - separacja od bezpośrednich zapytań SQL (przeniesionych do dataAccess)
 */
import { LocationSearchResult, selectLocationsBySearchTerm } from '../dataAccess/search';

export async function queryLocation(term: string): Promise<LocationSearchResult[]> {
    const limit = 5;
    return selectLocationsBySearchTerm(term, limit);
}
