import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import pure from 'recompose/pure';
import { Table, TableBody, TableHead, TableRow } from '@material-ui/core';

import ParsingExcerptColumn from './ParsingExcerptColumn';
import ParsingExcerptHeaderColumn from './ParsingExcerptHeaderColumn';
import { fromEnrichments, fromParsing } from '../selectors';
import theme from '../../theme';

const styles = {
    table: {
        display: 'block',
        overflowX: 'auto',
        width: 'auto',
        minWidth: '100%',
        border: '4px solid rgb(95, 99, 104, 0.1)',
    },
    body: {
        position: 'relative',
    },
    enrichedColumn: {
        backgroundColor: theme.green.light,
    },
};

export const getRowStyle = (index, total) => {
    let opacity = 1;

    if (total > 2 && index === total - 2) {
        opacity = 0.45;
    }

    if (total > 2 && index === total - 1) {
        opacity = 0.25;
    }

    return { opacity, height: 36 };
};

export const getEnrichmentsNames = enrichments => {
    return enrichments?.map(enrichiment => enrichiment.name);
};

export const getColumnStyle = (enrichmentsNames, column) => {
    return enrichmentsNames?.includes(column) ? styles.enrichedColumn : {};
};

export const filterColumnsToShow = (
    columns,
    enrichmentsNames,
    isHiddenLoadedColumn,
    isHiddenEnrichedColumn,
) => {
    if (isHiddenEnrichedColumn && isHiddenLoadedColumn) {
        return columns.filter(column => column === 'uri');
    }
    if (isHiddenEnrichedColumn) {
        return columns.filter(
            column => !enrichmentsNames.includes(column) || column === 'uri',
        );
    }

    if (isHiddenLoadedColumn) {
        return columns.filter(
            column => enrichmentsNames.includes(column) || column === 'uri',
        );
    }

    return columns;
};

const formatValue = value => {
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    return value;
};

export const ParsingExcerptComponent = ({
    columns,
    lines,
    enrichments,
    isHiddenLoadedColumn,
    isHiddenEnrichedColumn,
}) => {
    const enrichmentsNames = useMemo(() => getEnrichmentsNames(enrichments), [
        enrichments,
    ]);

    const columnsToShow = useMemo(
        () =>
            filterColumnsToShow(
                columns,
                enrichmentsNames,
                isHiddenLoadedColumn,
                isHiddenEnrichedColumn,
            ),
        [
            columns,
            lines,
            enrichmentsNames,
            isHiddenLoadedColumn,
            isHiddenEnrichedColumn,
        ],
    );

    const total = lines.length;

    return (
        <Table style={styles.table}>
            <TableHead>
                <TableRow>
                    {columnsToShow.map(column => (
                        <ParsingExcerptHeaderColumn
                            key={`header_${column}`}
                            column={column}
                            style={getColumnStyle(enrichmentsNames, column)}
                        />
                    ))}
                </TableRow>
            </TableHead>
            <TableBody style={styles.body}>
                {lines.map((line, index) => (
                    <TableRow
                        key={`${line._id}_data_row`}
                        style={getRowStyle(index, total)}
                    >
                        {columnsToShow.map(column => {
                            return (
                                <ParsingExcerptColumn
                                    key={`${column}_${line._id}`}
                                    value={formatValue(line[column])}
                                    style={getColumnStyle(
                                        enrichmentsNames,
                                        column,
                                    )}
                                ></ParsingExcerptColumn>
                            );
                        })}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

ParsingExcerptComponent.propTypes = {
    columns: PropTypes.arrayOf(PropTypes.string).isRequired,
    lines: PropTypes.arrayOf(PropTypes.object).isRequired,
    enrichments: PropTypes.arrayOf(PropTypes.object),
    isHiddenLoadedColumn: PropTypes.bool.isRequired,
    isHiddenEnrichedColumn: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
    enrichments: fromEnrichments.enrichments(state),
    isHiddenLoadedColumn: fromParsing.getHideLoadedColumn(state),
    isHiddenEnrichedColumn: fromParsing.getHideEnrichedColumn(state),
});

const mapDispatchToProps = {};

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    pure,
)(ParsingExcerptComponent);
