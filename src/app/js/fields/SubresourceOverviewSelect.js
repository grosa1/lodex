import React, { useMemo } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import translate from 'redux-polyglot/translate';
import PropTypes from 'prop-types';
import { TextField, MenuItem } from '@mui/material';
import * as overview from '../../../common/overview';
import {
    polyglot as polyglotPropTypes,
    field as fieldPropTypes,
} from '../propTypes';
import { loadField } from '.';
import { fromFields } from '../sharedSelectors';
import fieldApi from '../admin/api/field';

export const SubresourceOverviewSelectComponent = ({
    p: polyglot,
    fields,
    loadField,
}) => {
    const subresourceTitle = useMemo(() => {
        const subresourceTitleField = fields.find(
            field => field.overview === overview.SUBRESOURCE_TITLE,
        );
        return subresourceTitleField?._id;
    }, [fields]);

    const handleSubresourceTitleChange = async event => {
        const { value: _id } = event.target;
        await fieldApi.patchField({
            _id,
            overview: overview.SUBRESOURCE_TITLE,
        });
        loadField();
    };

    return (
        <TextField
            select
            value={subresourceTitle || ''}
            label={polyglot.t('overviewSubresourceTitle')}
            onChange={handleSubresourceTitleChange}
            sx={{ minWidth: 220 }}
        >
            {fields.map(field => (
                <MenuItem key={field._id} value={field._id}>
                    {field.label} ({field.name})
                </MenuItem>
            ))}
        </TextField>
    );
};

SubresourceOverviewSelectComponent.propTypes = {
    p: polyglotPropTypes.isRequired,
    fields: PropTypes.arrayOf(fieldPropTypes),
    loadField: PropTypes.func.isRequired,
};

const mapStateToProps = (state, { subresourceId }) => ({
    fields: fromFields.getEditingFields(state, { subresourceId }),
});

const mapDispatchToProps = {
    loadField,
};

export default compose(
    translate,
    connect(mapStateToProps, mapDispatchToProps),
)(SubresourceOverviewSelectComponent);
