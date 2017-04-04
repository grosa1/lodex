import React, { PropTypes } from 'react';
import compose from 'recompose/compose';
import withHandlers from 'recompose/withHandlers';
import { connect } from 'react-redux';
import translate from 'redux-polyglot/translate';
import { reduxForm, Field, propTypes as reduxFormPropTypes } from 'redux-form';

import {
    addCharacteristic as addCharacteristicAction,
    NEW_CHARACTERISTIC_FORM_NAME,
} from './';
import Alert from '../../lib/Alert';
import { polyglot as polyglotPropTypes } from '../../propTypes';
import {
    fromCharacteristic,
} from '../selectors';
import FormTextField from '../../lib/FormTextField';
import SchemeAutoComplete from '../../lib/SchemeAutoComplete';

const validate = (values) => {
    const errors = ['label', 'value'].reduce((currentErrors, field) => {
        if (!values[field]) {
            return {
                ...currentErrors,
                [field]: 'Required',
            };
        }
        return currentErrors;
    }, {});

    return errors;
};

export const AddFieldFormComponent = ({
    addCharacteristicError,
    onSubmit,
    p: polyglot,
}) => (
    <form id="add_characteristic_form" onSubmit={onSubmit}>
        {addCharacteristicError && <Alert><p>{addCharacteristicError}</p></Alert>}
        <Field
            name="label"
            fullWidth
            component={FormTextField}
            label={polyglot.t('label')}
        />
        <Field
            name="value"
            fullWidth
            component={FormTextField}
            label={polyglot.t('value')}
        />
        <SchemeAutoComplete name="scheme" />
    </form>
);

AddFieldFormComponent.defaultProps = {
    error: null,
    saving: false,
};

AddFieldFormComponent.propTypes = {
    ...reduxFormPropTypes,
    saving: PropTypes.bool,
    p: polyglotPropTypes.isRequired,
};

const mapStateToProps = state => ({
    addCharacteristicError: fromCharacteristic.getError(state),
    saving: fromCharacteristic.isSaving(state),
});

const mapDispatchToProps = {
    addCharacteristic: addCharacteristicAction,
};

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    withHandlers({
        onSubmit: ({ addCharacteristic }) => () => {
            addCharacteristic();
        },
    }),
    reduxForm({
        form: NEW_CHARACTERISTIC_FORM_NAME,
        validate,
    }),
    translate,
)(AddFieldFormComponent);