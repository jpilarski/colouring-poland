import { LocationSearchResult, selectLocationsBySearchTerm } from '../dataAccess/search';

export async function queryLocation(term: string): Promise<LocationSearchResult[]> {
    const limit = 5;
    return selectLocationsBySearchTerm(term, limit);
}
