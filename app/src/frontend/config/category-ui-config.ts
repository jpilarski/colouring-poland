import { Category } from './categories-config';

import PlanningConservationContainer from '../features/buildings/containers/planning-conservation';
import CommunityContainer from '../features/buildings/containers/community';
import AgeHistoryContainer from '../features/buildings/containers/age-history';
import DisasterManagementContainer from '../features/buildings/containers/disaster-management';
import LocationContainer from '../features/buildings/containers/location';
import UrbanInfrastructureContainer from '../features/buildings/containers/urban-infrastructure';
import ConstructionDesignContainer from '../features/buildings/containers/construction-design';
import RetrofitConditionContainer from '../features/buildings/containers/retrofit-condition';
import WaterGreenInfrastructureContainer from '../features/buildings/containers/water-green-infrastructure';
import EnergyPerformanceContainer from '../features/buildings/containers/energy-performance';
import TypologySizeContainer from '../features/buildings/containers/typology-size';
import LandUseContainer from '../features/buildings/containers/land-use';

import { DataContainerType } from '../features/buildings/components/data-container';

export const categoryUiConfig: { [key in Category]: DataContainerType } = {
    [Category.Location]: LocationContainer,
    [Category.LandUse]: LandUseContainer,
    [Category.TypologySize]: TypologySizeContainer,
    [Category.ConstructionDesign]: ConstructionDesignContainer,
    [Category.AgeHistory]: AgeHistoryContainer,
    [Category.PlanningConservation]: PlanningConservationContainer,
    [Category.RetrofitCondition]: RetrofitConditionContainer,
    [Category.EnergyPerformance]: EnergyPerformanceContainer,
    [Category.UrbanInfrastructure]: UrbanInfrastructureContainer,
    [Category.WaterGreenInfrastructure]: WaterGreenInfrastructureContainer,
    [Category.DisasterManagement]: DisasterManagementContainer,
    [Category.Community]: CommunityContainer,
};

