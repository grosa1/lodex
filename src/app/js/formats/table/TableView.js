import React, { Component } from 'react';
import compose from 'recompose/compose';
import injectData from '../injectData';
import { connect } from 'react-redux';
import translate from 'redux-polyglot/translate';
import {
    field as fieldPropTypes,
    polyglot as polyglotPropTypes,
} from '../../propTypes';
import PropTypes from 'prop-types';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
} from '@material-ui/core';
import { getViewComponent } from '../index';
import _ from 'lodash';
import { fromFields } from '../../sharedSelectors';

class TableView extends Component {
    constructor(props) {
        super(props);
        this.onChangePage = this.onChangePage.bind(this);
        this.onChangeRowsPerPage = this.onChangeRowsPerPage.bind(this);
        this.sort = this.sort.bind(this);

        const getOnUpdate = state => {
            const filterFormatDataParameter = {
                skip: state.page * state.rowsPerPage,
                maxSize: state.rowsPerPage,
            };

            if (state.sortOn !== undefined && state.sort !== false)
                filterFormatDataParameter.sort = [
                    state.sortOn,
                    state.sort,
                ].join('/');

            return () => this.props.filterFormatData(filterFormatDataParameter);
        };

        this.state = {
            rowsPerPage: props.pageSize,
            page: 0,
            sortId: undefined,
            sortOn: undefined,
            sort: false,
            getOnUpdate,
        };
    }

    onChangePage(event, newPage) {
        const newState = {
            ...this.state,
            page: newPage,
        };

        this.setState(newState, this.state.update(newState));
    }

    onChangeRowsPerPage(event) {
        const newState = {
            ...this.state,
            page: 0,
            rowsPerPage: parseInt(event.target.value, 10),
        };

        this.setState(newState, this.state.getOnUpdate(newState));
    }

    sort(column) {
        const columnId = column.id;
        const columnField = column.field;
        let sort = this.state.sort;
        if (columnId === this.state.sortId) {
            switch (sort) {
                case 'asc':
                    sort = 'desc';
                    break;
                default:
                    sort = 'asc';
                    break;
            }
        } else {
            sort = 'asc';
        }

        const newState = {
            ...this.state,
            sortId: columnId,
            sortOn: columnField,
            sort: sort,
        };

        this.setState(newState, this.state.getOnUpdate(newState));
    }

    render() {
        const {
            data,
            total,
            ref_field,
            pageSize,
            p,
            columnsParameters,
        } = this.props;

        const sortableColumn = column => {
            if (ref_field === undefined) return column.title;
            if (!_.keys(ref_field).includes(column.field)) return column.title;

            return (
                <TableSortLabel
                    active={getSortDirection(column.id) !== false}
                    direction={
                        getSortDirection(column.id) === false
                            ? 'asc'
                            : getSortDirection(column.id)
                    }
                    onClick={() => this.sort(column)}
                >
                    {column.title}
                </TableSortLabel>
            );
        };

        const getSortDirection = columnId => {
            if (columnId !== this.state.sortId) return false;
            return this.state.sort;
        };

        const buildColumn = (value, index, columnParameter) => {
            const { name, option } = columnParameter.format;
            const { ViewComponent, args } = getViewComponent(
                columnParameter.format.name,
            );

            return (
                <TableCell>
                    {name ? (
                        <ViewComponent
                            resource={value}
                            field={{
                                name: columnParameter.field,
                                valueOfList: value,
                                format: {
                                    name: name,
                                    args: option,
                                },
                            }}
                            {...args}
                            {...option}
                        />
                    ) : (
                        'Error'
                    )}
                </TableCell>
            );
        };

        return (
            <div>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {columnsParameters.map(column => (
                                    <TableCell key={column.id}>
                                        {sortableColumn(column)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((entry, index) => (
                                <TableRow key={`${index}-table`}>
                                    {columnsParameters.map(column =>
                                        buildColumn(entry, index, column),
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TablePagination
                                rowsPerPageOptions={[
                                    pageSize,
                                    pageSize * 2,
                                    pageSize * 3,
                                    { label: p.t('all'), value: data.length },
                                ]}
                                rowsPerPage={this.state.rowsPerPage}
                                count={total}
                                page={this.state.page}
                                onChangePage={this.onChangePage}
                                labelRowsPerPage={p.t('rows_per_page')}
                                onChangeRowsPerPage={this.onChangeRowsPerPage}
                            />
                        </TableFooter>
                    </Table>
                </TableContainer>
            </div>
        );
    }
}

TableView.propTypes = {
    field: fieldPropTypes.isRequired,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    facets: PropTypes.arrayOf(PropTypes.object).isRequired,
    total: PropTypes.number.isRequired,
    ref_field: PropTypes.object.isRequired,
    pageSize: PropTypes.number.isRequired,
    p: polyglotPropTypes.isRequired,
    columnsParameters: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            title: PropTypes.string.isRequired,
            field: PropTypes.string.isRequired,
            format: PropTypes.shape({
                name: PropTypes.string.isRequired,
                option: PropTypes.any.isRequired,
            }).isRequired,
        }),
    ).isRequired,
    filterFormatData: PropTypes.func.isRequired,
};

const mapStateToProps = (state, { formatData, spaceWidth }) => {
    if (!formatData || !formatData.items) {
        return {
            facets: [],
            data: [],
            total: 0,
            ref_field: {},
        };
    }

    return {
        facets: fromFields.getFacetFields(state),
        data: formatData.items,
        total: formatData.total,
        ref_field: formatData.ref_field,
        spaceWidth,
    };
};

export default compose(
    injectData(null, field => !!field),
    connect(mapStateToProps),
    translate,
)(TableView);
