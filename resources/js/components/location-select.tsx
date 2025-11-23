// resources/js/components/location-select.tsx
import Select from 'react-select';

interface Option {
    value: string;
    label: string;
}

interface LocationSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder: string;
    disabled?: boolean;
    tabIndex?: number;
    isClearable?: boolean;
}

export function LocationSelect({
    value,
    onChange,
    options,
    placeholder,
    disabled = false,
    tabIndex,
    isClearable = true
}: LocationSelectProps) {
    const selectedOption = options.find(opt => opt.value === value) || null;

    return (
        <Select
            value={selectedOption}
            onChange={(option) => onChange(option?.value || '')}
            options={options}
            placeholder={placeholder}
            isDisabled={disabled}
            isSearchable={true}
            isClearable={isClearable}
            tabIndex={tabIndex}
            classNames={{
                control: (state) =>
                    `!min-h-10 !border-input !bg-background hover:!border-input ${
                        state.isFocused ? '!border-ring !ring-2 !ring-ring !ring-offset-2' : ''
                    }`,
                menu: () => '!bg-popover !border !border-border !rounded-md !shadow-md',
                menuList: () => '!p-1',
                option: (state) =>
                    `!text-sm !cursor-pointer !rounded-sm !px-2 !py-1.5 ${
                        state.isSelected
                            ? '!bg-accent !text-accent-foreground'
                            : state.isFocused
                            ? '!bg-accent/50'
                            : '!bg-transparent'
                    }`,
                placeholder: () => '!text-muted-foreground',
                input: () => '!text-foreground',
                singleValue: () => '!text-foreground',
                clearIndicator: () => '!text-muted-foreground hover:!text-foreground !cursor-pointer'
            }}
            styles={{
                control: (base) => ({
                    ...base,
                    boxShadow: 'none',
                    '&:hover': {
                        borderColor: 'hsl(var(--input))'
                    }
                })
            }}
        />
    );
}
