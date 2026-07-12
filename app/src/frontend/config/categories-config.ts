/**
 * An enumeration of all categories in the system.
 * The string value is also the category URL slug.
 */
export enum Category {
    Location = 'location',
    LandUse = 'land-use',
    TypologySize = 'typology-size',
    ConstructionDesign = 'construction-design',
    AgeHistory = 'age-history',
    PlanningConservation = 'planning-conservation',
    RetrofitCondition = 'retrofit-condition',
    EnergyPerformance = 'energy-performance',
    WaterGreenInfrastructure = 'water-green-infrastructure',
    UrbanInfrastructure = 'urban-infrastructure',
    DisasterManagement = 'disaster-management',
    Community = 'community',
}

/**
 * This is the sole configuration variable that defines the order of the categories
 * in the category grid. The order in the enum definition or the other configs does
 * not affect the order of the grid.
 */
export const categoriesOrder: Category[] = [
    Category.Location,
    Category.LandUse,
    Category.TypologySize,
    Category.ConstructionDesign,
    Category.AgeHistory,
    Category.PlanningConservation,
    Category.RetrofitCondition,
    Category.EnergyPerformance,
    Category.WaterGreenInfrastructure,
    Category.UrbanInfrastructure,
    Category.DisasterManagement,
    Category.Community,
];

interface CategoryDefinition {
    inactive?: boolean;
    slug: string;
    name: string;
    aboutUrl: string;
    intro: string;
}

export const categoriesConfig: { [key in Category]: CategoryDefinition } = {
    [Category.Location]: {
        slug: 'location',
        name: 'Lokalizacja',
        aboutUrl: 'https://github.com/colouring-cities/manual/wiki/E1.--DATA#1-location',
        intro: '',
    },
    [Category.LandUse]: {
        slug: 'land-use',
        name: 'Użytkowanie',
        aboutUrl: 'https://github.com/colouring-cities/manual/wiki/E1.--DATA#2-land-use',
        intro: '',
    },
    [Category.TypologySize]: {
        slug: 'typology-size',
        name: 'Typologia',
        aboutUrl: 'https://github.com/colouring-cities/manual/wiki/E1.--DATA#3-typology',
        intro: '',
    },
    [Category.ConstructionDesign]: {
        slug: 'construction-design',
        name: 'Konstrukcja, detal, forma',
        aboutUrl: 'https://github.com/colouring-cities/manual/wiki/E1.--DATA#6-size',
        intro: '',
    },
    [Category.AgeHistory]: {
        slug: 'age-history',
        name: 'Historia',
        aboutUrl: 'https://github.com/colouring-cities/manual/wiki/E1.--DATA#4-age-and-history',
        intro: '',
    },
    [Category.PlanningConservation]: {
        slug: 'planning-conservation',
        name: 'Planowanie',
        aboutUrl: 'https://github.com/colouring-cities/manual/wiki/E1.--DATA#5-construction',
        intro: '',
    },
    [Category.RetrofitCondition]: {
        slug: 'retrofit-condition',
        name: 'Zrównoważona adaptacyjność',
        aboutUrl: 'https://github.com/colouring-cities/manual/wiki/E1.--DATA#7-street-context',
        intro: '',
    },
    [Category.EnergyPerformance]: {
        slug: 'energy-performance',
        name: 'Energy Performance & Systems',
        aboutUrl: 'https://github.com/colouring-cities/manual/wiki/E1.--DATA#8-team',
        intro: 'This section provides open data on the energy performance of the building.',
    },
    [Category.WaterGreenInfrastructure]: {
        slug: 'water-green-infrastructure',
        name: 'Green/Water Infrastructure Context',
        aboutUrl: 'https://github.com/colouring-cities/manual/wiki/E1.--DATA#10-energy-performance',
        intro: "This section provides open data on the building's water supply and any green infrastructure.",
    },
    [Category.UrbanInfrastructure]: {
        slug: 'urban-infrastructure',
        name: 'Urban Infrastructure Context',
        aboutUrl: 'https://github.com/colouring-cities/manual/wiki/E1.--DATA#9-planning',
        intro: 'This section provides open data on the surroundings of the building.',
    },
    [Category.DisasterManagement]: {
        slug: 'disaster-management',
        name: 'Disaster Management',
        aboutUrl: 'https://github.com/colouring-cities/manual/wiki/E1.--DATA#11-resilience',
        intro: 'This section provides a tool that allows for live collection of data in disaster situations and collates data relating to building resilience.'
    },
    [Category.Community]: {
        slug: 'community',
        name: 'Społeczeństwo',
        aboutUrl: 'https://github.com/colouring-cities/manual/wiki/E1.--DATA#12-community',
        intro: '',
    },
};
