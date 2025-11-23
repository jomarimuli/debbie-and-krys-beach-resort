// resources/js/types/ph-locations.d.ts
declare module 'ph-locations' {
    export interface Region {
        code: string;
        name: string;
        nameTL?: string;
        altName?: string;
    }

    export interface Province {
        code: string;
        name: string;
        nameTL?: string;
        altName?: string;
        region: string;
    }

    export interface CityMunicipality {
        code?: string;
        name: string;
        fullName: string;
        altName?: string;
        province: string;
        classification: string;
        isCapital: boolean;
    }

    export const regions: Region[];
    export const provinces: Province[];
    export const citiesMunicipalities: CityMunicipality[];

    export const psgc: {
        regions: Region[];
        provinces: Province[];
        citiesMunicipalities: CityMunicipality[];
    };

    export const iso3166: {
        regions: Region[];
        provinces: Province[];
        citiesMunicipalities: CityMunicipality[];
    };
}
