import _ from 'lodash';
import { ITask } from 'pg-promise';

import { hasAnyOwnProperty } from '../../../helpers';
import { BaseBuilding, BuildingAttributes, BuildingUpdate } from '../../models/building';
import { getBuildingData } from '../../dataAccess/building';
import { ArgumentError } from '../../errors/general';

/**
 * Define any custom processing logic for specific building attributes
 */
export async function processBuildingUpdate(buildingId: number, { attributes, userAttributes }: BuildingUpdate, t?: ITask<any>): Promise<BuildingUpdate> {


    return {
        attributes,
        userAttributes
    };
}
