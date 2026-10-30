import React, { Fragment } from 'react';
import { CategoryViewProps } from '../containers/category-view-props';
import { dataFields } from '../../../config/data-fields-config';
import Verification from './verification';
import SelectDataEntry from './select-data-entry';
import NumericDataEntry from './numeric-data-entry';
import SliderDataEntry from './slider-data-entry';
import { LogicalDataEntry } from './logical-data-entry/logical-data-entry';
import DataEntry from './data-entry';
import { MultiSelectDataEntry } from './multi-select-data-entry';
import { PatternDataEntry } from './pattern-data-entry';

export type FieldControlType =
    | 'select'
    | 'numeric'
    | 'slider'
    | 'logical'
    | 'text'
    | 'multi-select'
    | 'pattern';

export interface VerifiedFieldProps {
    slug: string;
    categoryProps: CategoryViewProps;
    control?: FieldControlType;
    title?: string;
    tooltip?: string;
    disabled?: boolean;
    hideVerification?: boolean;
    options?: any[];
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
    pattern?: string;
    patternMismatchMessage?: string;
}

export const VerifiedField: React.FC<VerifiedFieldProps> = ({
    slug,
    categoryProps,
    control,
    title,
    tooltip,
    disabled = false,
    hideVerification = false,
    options,
    placeholder,
    min,
    max,
    step,
    pattern,
    patternMismatchMessage,
}) => {
    const fieldConfig = (dataFields as Record<string, any>)[slug];
    const fieldTitle = title ?? fieldConfig?.title ?? slug;
    const fieldTooltip = tooltip ?? fieldConfig?.tooltip;
    const fieldOptions = options ?? fieldConfig?.items ?? [];

    const value = categoryProps.building ? (categoryProps.building as any)[slug] : undefined;

    let effectiveControl = control;
    if (!effectiveControl) {
        if (fieldConfig?.items && Array.isArray(fieldConfig.items) && fieldConfig.items.length > 0) {
            effectiveControl = 'select';
        } else {
            effectiveControl = 'numeric';
        }
    }

    const commonProps = {
        slug,
        title: fieldTitle,
        tooltip: fieldTooltip,
        disabled,
        copy: categoryProps.copy,
        mode: categoryProps.mode,
        onChange: categoryProps.onChange,
    };

    const renderControl = () => {
        switch (effectiveControl) {
            case 'select':
                return (
                    <SelectDataEntry
                        {...commonProps}
                        value={value ?? ''}
                        options={fieldOptions}
                        placeholder={placeholder}
                    />
                );
            case 'numeric':
                return (
                    <NumericDataEntry
                        {...commonProps}
                        value={value}
                        min={min}
                        max={max}
                        step={step}
                    />
                );
            case 'slider':
                return (
                    <SliderDataEntry
                        {...commonProps}
                        value={value}
                        min={min ?? 1}
                        max={max ?? 5}
                    />
                );
            case 'logical':
                return (
                    <LogicalDataEntry
                        {...commonProps}
                        value={value}
                    />
                );
            case 'multi-select':
                return (
                    <MultiSelectDataEntry
                        {...commonProps}
                        value={value ?? []}
                        options={fieldOptions}
                    />
                );
            case 'pattern':
                return (
                    <PatternDataEntry
                        {...commonProps}
                        value={value ?? ''}
                        pattern={pattern || ''}
                        placeholder={placeholder}
                    />
                );
            case 'text':
            default:
                return (
                    <DataEntry
                        {...commonProps}
                        value={value ?? ''}
                        placeholder={placeholder}
                    />
                );
        }
    };

    const isValPresent = value !== null && value !== undefined && value !== '';
    const allowVerify = !disabled && isValPresent && categoryProps.user !== undefined && !categoryProps.edited;
    const userVerified = Boolean(
        categoryProps.user_verified &&
        Object.prototype.hasOwnProperty.call(categoryProps.user_verified, slug)
    );
    const userVerifiedAs = categoryProps.user_verified ? categoryProps.user_verified[slug] : undefined;
    const verifiedCount = categoryProps.building?.verified ? (categoryProps.building.verified as any)[slug] : 0;

    return (
        <Fragment>
            {renderControl()}
            {!hideVerification && (
                <Verification
                    slug={slug}
                    allow_verify={allowVerify}
                    onVerify={categoryProps.onVerify}
                    user_verified={userVerified}
                    user_verified_as={userVerifiedAs}
                    verified_count={verifiedCount || 0}
                />
            )}
        </Fragment>
    );
};

export default VerifiedField;
