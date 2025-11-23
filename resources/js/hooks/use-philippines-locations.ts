// resources/js/hooks/use-philippines-locations.ts
import { useState, useEffect, useMemo } from 'react';
import { Country, State, City } from 'country-state-city';
import { provinces, citiesMunicipalities } from 'ph-locations';

interface SelectOption {
    value: string;
    label: string;
    code?: string;
}

export function usePhilippinesLocations() {
    const [selectedCountry, setSelectedCountry] = useState('PH');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [addressLine, setAddressLine] = useState('');

    const [availableProvinces, setAvailableProvinces] = useState<SelectOption[]>([]);
    const [availableCities, setAvailableCities] = useState<SelectOption[]>([]);

    // Load all countries
    const countryOptions = useMemo(() => {
        return Country.getAllCountries().map((country) => ({
            value: country.isoCode,
            label: country.name,
            code: country.isoCode
        }));
    }, []);

    // Load provinces when country changes
    useEffect(() => {
        if (selectedCountry === 'PH') {
            // Use ph-locations for Philippines
            const phProvinces = provinces.map((province: any) => ({
                value: province.name,
                label: province.name,
                code: province.code
            }));
            setAvailableProvinces(phProvinces);
        } else {
            // Use country-state-city for other countries
            const states = State.getStatesOfCountry(selectedCountry);
            const stateOptions = states.map((state) => ({
                value: state.name,
                label: state.name,
                code: state.isoCode
            }));
            setAvailableProvinces(stateOptions);
        }
        setSelectedProvince('');
        setSelectedProvinceCode('');
        setSelectedCity('');
        setAddressLine('');
    }, [selectedCountry]);

    // Load cities when province changes
    useEffect(() => {
        if (!selectedProvinceCode) {
            setAvailableCities([]);
            return;
        }

        if (selectedCountry === 'PH') {
            // Use ph-locations for Philippines
            const cities = citiesMunicipalities
                .filter((city: any) => city.province === selectedProvinceCode)
                .map((city: any) => ({
                    value: city.name,
                    label: city.name
                }));
            setAvailableCities(cities);
        } else {
            // Use country-state-city for other countries
            const cities = City.getCitiesOfState(selectedCountry, selectedProvinceCode);
            const cityOptions = cities.map((city) => ({
                value: city.name,
                label: city.name
            }));
            setAvailableCities(cityOptions);
        }
        setSelectedCity('');
    }, [selectedCountry, selectedProvinceCode]);

    // Handle country selection
    const handleCountryChange = (value: string) => {
        setSelectedCountry(value);
    };

    // Handle province selection
    const handleProvinceChange = (value: string) => {
        const province = availableProvinces.find((p) => p.value === value);
        setSelectedProvince(value);
        setSelectedProvinceCode(province?.code || '');
    };

    // Handle city selection
    const handleCityChange = (value: string) => {
        setSelectedCity(value);
    };

    // Format address string
    const getFormattedAddress = () => {
        const parts = [];
        if (addressLine) parts.push(addressLine);
        if (selectedCity) parts.push(selectedCity);
        if (selectedProvince) parts.push(selectedProvince);

        const countryName = countryOptions.find(c => c.value === selectedCountry)?.label;
        if (countryName && selectedCountry !== 'PH') parts.push(countryName);

        return parts.join(', ');
    };

    return {
        selectedCountry,
        selectedProvince,
        selectedCity,
        addressLine,
        setAddressLine,
        handleCountryChange,
        handleProvinceChange,
        handleCityChange,
        countryOptions,
        provinceOptions: availableProvinces,
        cityOptions: availableCities,
        getFormattedAddress
    };
}
