import React, { Component } from 'react';
import translate from 'redux-polyglot/translate';
import PropTypes from 'prop-types';
import { polyglot as polyglotPropTypes } from '../../propTypes';
import updateAdminArgs from '../shared/updateAdminArgs';
import RoutineParamsAdmin from '../shared/RoutineParamsAdmin';
import { TextField } from '@material-ui/core';
import TableColumnsParameters from './TableColumnsParameters';

const styles = {
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        width: '200%',
        justifyContent: 'space-between',
    },
    input: {
        width: '100%',
    },
};

export const defaultArgs = {
    pageSize: 6,
    params: {
        maxSize: 6,
    },
    columnsCount: 2,
    columnsParameters: [
        {
            id: 0,
            format: {
                name: 'None',
                option: undefined,
            },
            field: '',
            title: 'Column 1',
        },
        {
            id: 1,
            field: '',
            title: 'Column 2',
            format: {
                name: 'None',
                option: undefined,
            },
        },
    ],
};

class TableAdmin extends Component {
    static propTypes = {
        args: PropTypes.shape({
            params: PropTypes.shape({
                maxSize: PropTypes.number,
                maxValue: PropTypes.number,
                minValue: PropTypes.number,
                orderBy: PropTypes.string,
            }),
            pageSize: PropTypes.number,
            columnsCount: PropTypes.number,
            columnsParameters: PropTypes.arrayOf(
                PropTypes.shape({
                    id: PropTypes.number,
                    title: PropTypes.string,
                    field: PropTypes.string,
                    format: PropTypes.shape({
                        name: PropTypes.string,
                        option: PropTypes.any,
                    }),
                }),
            ),
        }),
        onChange: PropTypes.func.isRequired,
        p: polyglotPropTypes.isRequired,
    };

    static defaultProps = {
        args: defaultArgs,
    };

    setPageSize = e => {
        const newPageSize = parseInt(e.target.value, 10);
        const newProps = {
            ...this.props.args,
            pageSize: newPageSize,
            params: {
                maxSize: newPageSize,
            },
        };
        this.props.onChange(newProps);
    };

    setColumnParameter = args => {
        this.props.onChange({
            ...this.props.args,
            columnsCount: args.parameterCount,
            columnsParameters: args.parameters,
        });
    };

    render() {
        const {
            p: polyglot,
            args: { pageSize, columnsCount, columnsParameters },
        } = this.props;
        return (
            <div style={styles.container}>
                <TextField
                    label={polyglot.t('items_per_page')}
                    onChange={this.setPageSize}
                    style={styles.input}
                    value={pageSize}
                    type="number"
                />
                <TableColumnsParameters
                    onChange={this.setColumnParameter}
                    polyglot={polyglot}
                    parameterCount={columnsCount}
                    parameters={columnsParameters}
                />
            </div>
        );
    }
}

export default translate(TableAdmin);
