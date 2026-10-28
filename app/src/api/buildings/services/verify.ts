import { buildingAttributesConfig } from '../../config/dataFields';
import { BaseBuilding } from '../../models/building';
import * as buildingDataAccess from '../../dataAccess/building';
import * as verifyDataAccess from '../../dataAccess/verify';
import { DatabaseError } from '../../common/errors/general';

function canVerify(key: string) {
    return buildingAttributesConfig[key].verify === true;
}

export async function verifyBuildingAttributes(buildingId: number, userId: string, patch: object) {
    const building = await buildingDataAccess.getBuildingData(buildingId);
    const verified = {}

    for (let [key, value] of Object.entries(patch)) {
        if (canVerify(key)) {
            if (JSON.stringify(value) == JSON.stringify(building[key])) {
                try {
                    await verifyDataAccess.updateBuildingUserVerifiedAttribute(buildingId, userId, key, building[key]);
                    verified[key] = building[key];
                } catch (error) {
                    throw new DatabaseError(error);
                }
            } else {
                if (value === null) {
                    await verifyDataAccess.removeBuildingUserVerifiedAttribute(buildingId, userId, key);
                } else {
                    const msg = `Attribute "${key}" with value "${value}" did not match latest saved value "${building[key]}"`;
                    throw new DatabaseError(msg);
                }
            }
        } else {
            const msg = `Attribute ${key} not recognised.`;
            throw new DatabaseError(msg);
        }
    }
    return verified;
}

export async function getUserVerifiedAttributes(buildingId: number, userId: string) {
    return await verifyDataAccess.getBuildingUserVerifiedAttributes(buildingId, userId);
}

export async function getBuildingVerifications(building: BaseBuilding) {
    const verifications = await verifyDataAccess.getBuildingVerifiedAttributes(building.lokalizacja_id_budynku);

    const verified: Record<string, number> = {};

    for (const item of verifications) {
        if (JSON.stringify(building[item.attribute]) == JSON.stringify(item.verified_value)) {
            const count = verified[item.attribute] || 0;
            verified[item.attribute] = count + 1;
        }
    }
    return verified;
}
