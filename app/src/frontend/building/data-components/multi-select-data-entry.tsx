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

    // Zabezpieczenie, by zawsze pracować na tablicy, nawet jeśli przyjdzie null
    const currentValues = props.value || [];

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

        // Zwracamy zaktualizowaną tablicę (lub null jeśli jest pusta)
        props.onChange(slugWithModifier, newVal.length > 0 ? newVal : null);
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