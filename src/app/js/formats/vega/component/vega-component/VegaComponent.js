import { Vega } from 'react-vega';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isAdmin } from '../../../../user';
import deepClone from 'lodash.clonedeep';
import { VEGA_DATA_INJECT_TYPE_A } from '../../../vega-lite/chartsUtils';

/**
 * small component use to handle vega lite display
 * @param props args taken by the component
 * @returns {*} React-Vega component
 */
function CustomActionVega(props) {
    let actions;
    if (isAdmin(props.user)) {
        actions = {
            export: {
                svg: true,
                png: true,
            },
            source: true,
            compiled: true,
            editor: true,
        };
    } else {
        actions = {
            export: {
                svg: true,
                png: true,
            },
            source: false,
            compiled: false,
            editor: false,
        };
    }

    const spec = props.spec;

    switch (props.injectType) {
        case VEGA_DATA_INJECT_TYPE_A:
            spec.data.forEach(e => {
                if (e.name === 'table') {
                    e.values = props.data.values;
                }
            });
            break;
        default:
            throw new Error('Invalid data injection type');
    }

    return <Vega spec={deepClone(props.spec)} actions={actions} mode="vega" />;
}

/**
 * Element required in the props
 * @type {{data: Requireable<any>, user: Requireable<any>, spec: Validator<NonNullable<any>>}}
 */
CustomActionVega.propTypes = {
    user: PropTypes.any,
    spec: PropTypes.any.isRequired,
    data: PropTypes.any,
    injectType: PropTypes.number.isRequired,
};

/**
 * Function use to get the user state
 * @param state application state
 * @returns {{user: *}} user state
 */
const mapStateToProps = state => {
    return {
        user: state.user,
    };
};

export default connect(mapStateToProps)(CustomActionVega);
