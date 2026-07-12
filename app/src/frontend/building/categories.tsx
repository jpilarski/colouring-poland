import React from 'react';

import { CategoryLink } from './category-link';
import { ListWrapper } from '../components/list-wrapper';

import './categories.css';
import { categoriesOrder, categoriesConfig } from '../config/categories-config';

interface CategoriesProps {
    mode: 'view' | 'edit' | 'multi-edit';
    lokalizacja_id_budynku?: number;
}

const Categories: React.FC<CategoriesProps> = (props) => (
    <ListWrapper className='data-category-list'>
        {categoriesOrder.map(category => {
            const {
                name,
                slug,
                aboutUrl,
                inactive = false
            } = categoriesConfig[category];

            return <CategoryLink
                key={category}
                title={name}
                slug={slug}
                help={aboutUrl}
                inactive={inactive}
                mode={props.mode}
                lokalizacja_id_budynku={props.lokalizacja_id_budynku}
            />
        })}
    </ListWrapper>
);

export default Categories;
