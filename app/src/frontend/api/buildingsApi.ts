import { apiGet, apiPost } from './apiClient';
import { Building, BuildingEdits, BuildingUserAttributes, UserVerified } from '../models/building';

export const buildingsApi = {
    getBuilding: (buildingId: number, includeUserAttributes: boolean = false): Promise<Building> => {
        const query = includeUserAttributes ? '?user_attributes=true' : '';
        return apiGet<Building>(`/api/buildings/${buildingId}.json${query}`);
    },

    updateBuilding: (
        buildingId: number,
        edits: Partial<Building & BuildingUserAttributes> | BuildingEdits
    ): Promise<Building> => {
        return apiPost<Building>(`/api/buildings/${buildingId}.json`, edits);
    },

    verifyBuilding: (
        buildingId: number,
        verifyPatch: Record<string, any>
    ): Promise<UserVerified & { error?: string }> => {
        return apiPost<UserVerified & { error?: string }>(`/api/buildings/${buildingId}/verify.json`, verifyPatch);
    },

    getBuildingEditHistory: (buildingId: number): Promise<any> => {
        return apiGet(`/api/buildings/${buildingId}/history.json`);
    }
};
