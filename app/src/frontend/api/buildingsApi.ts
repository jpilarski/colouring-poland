import { apiGet, apiPost } from './apiClient';
import { Building, BuildingAttributes, BuildingEdits, BuildingUserAttributes, UserVerified } from '../models/building';
import { buildingUserFields, dataFields } from '../config/data-fields-config';

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

export type UpdatedBuilding = Partial<BuildingAttributes> & Partial<BuildingUserAttributes> & {
    revision_id: string;
};

function makeUpdateData(edits: BuildingEdits) {
    const data = {
        attributes: {},
        user_attributes: {}
    };

    for (let [field, value] of Object.entries(edits)) {
        if (dataFields[field]) {
            data.attributes[field] = value;
        } else if (buildingUserFields[field]) {
            data.user_attributes[field] = value;
        }
    }

    return data;
}

export async function sendBuildingUpdate(buildingId: number, edits: BuildingEdits): Promise<UpdatedBuilding> {
    const requestData = makeUpdateData(edits);
    const data = await apiPost(
        `/api/buildings/${buildingId}.json`,
        requestData
    );

    if (data.error) {
        throw data.error;
    } else {
        const {
            revision_id,
            attributes,
            user_attributes
        } = data;

        return {
            revision_id,
            ...attributes,
            ...user_attributes
        };
    }
}
