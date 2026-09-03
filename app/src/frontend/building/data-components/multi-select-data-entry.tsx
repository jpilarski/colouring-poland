import React, { ChangeEvent } from 'react';

import { BaseDataEntryProps } from './data-entry';
import { DataTitleCopyable } from './data-title';

// Nowy interfejs - teraz oczekujemy tablic stringów
export interface MultiSelectDataEntryProps extends BaseDataEntryProps {
    value: string[] | null;
    options: string[];
    showTitle?: boolean;
}

export const MultiSelectDataEntry: React.FunctionComponent<MultiSelectDataEntryProps> = (props) => {
    const slugWithModifier = props.slug + (props.slugModifier ?? '');

    // Zabezpieczenie przed błędem backendu - parsowanie tekstu z bazy na natywną tablicę JS
    let currentValues: string[];
    if (typeof props.value === 'string') {
        const cleaned = (props.value as string).replace(/^\{|\}$/g, '');
        currentValues = cleaned.trim() === '' ? [] : cleaned.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
    } else {
        currentValues = props.value || [];
    }

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const changedKey = e.target.name;
        const checked = e.target.checked;

        let newVal: string[];
        if (checked) {
            // Dodajemy element do tablicy
            newVal = [...currentValues, changedKey];
        } else {
            // Usuwamy element z tablicy
            newVal = currentValues.filter(v => v !== changedKey);
        }

        // Usuwamy ewentualne duplikaty
        const uniqueVal = Array.from(new Set(newVal));

        // Zwracamy zaktualizowaną tablicę (lub null jeśli jest pusta)
        props.onChange(slugWithModifier, uniqueVal.length > 0 ? uniqueVal : null);
    }

    return (
        <>
            {props.showTitle !== false &&
                <DataTitleCopyable
                    slug={props.slug}
                    slugModifier={props.slugModifier}
                    title={props.title}
                    tooltip={props.tooltip}
                    disabled={props.disabled || props.value === undefined}
                    copy={props.copy}
                />
            }
            {
                // Iterujemy bezpośrednio po stringach
                props.options?.map(option => (
                    <React.Fragment key={option}>
                        <label>
                            <input
                                type="checkbox"
                                disabled={props.mode === 'view' || props.disabled}
                                name={option}
                                checked={currentValues.includes(option)}
                                onChange={handleChange}
                            />
                            {option}
                        </label>
                        <br />
                    </React.Fragment>
                ))
            }
        </>
    );
};