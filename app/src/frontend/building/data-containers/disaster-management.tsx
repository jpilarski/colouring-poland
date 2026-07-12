import React, { Fragment } from 'react';
import { CategoryViewProps } from './category-view-props';
import withCopyEdit from '../data-container';
import InfoBox from '../../components/info-box';

const DisasterManagementView: React.FunctionComponent<CategoryViewProps> = (props) => {
    return (
        <Fragment>
            <InfoBox>This section has been cleared and is awaiting new data structures.</InfoBox>
        </Fragment>
    );
};
const DisasterManagementContainer = withCopyEdit(DisasterManagementView);

export default DisasterManagementContainer;
