import React from 'react';
import { shallow } from 'enzyme';
import { TableCell } from '@mui/material';

import DefaultColumn from './DefaultColumn';
import Format from '../Format';

describe('<DefaultColumn />', () => {
    const column = { name: 'a_name', label: 'Foo' };
    const columns = [column, { name: 'another_name', label: 'Foo2' }];

    const resource = {
        a_name: 'a_value',
    };

    const wrapper = shallow(
        <DefaultColumn column={column} columns={columns} resource={resource} />,
    );

    it('renders a TableCell with correct class', () => {
        const element = wrapper.find(TableCell);

        expect(element.prop('className')).toEqual(
            'dataset-column dataset-a_name',
        );
    });

    it('renders a Format with correct props', () => {
        const element = wrapper.find(Format);

        expect(element.props()).toEqual({
            field: column,
            fields: columns,
            resource,
            shrink: true,
            isList: true,
        });
    });
});
