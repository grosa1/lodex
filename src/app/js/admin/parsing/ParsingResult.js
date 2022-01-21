import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import translate from 'redux-polyglot/translate';
import { grey } from '@material-ui/core/colors';
import { DataGrid } from '@mui/x-data-grid';

import { polyglot as polyglotPropTypes } from '../../propTypes';
import { reloadParsingResult } from './';
import { fromEnrichments, fromParsing } from '../selectors';
import datasetApi from '../api/dataset';
import Loading from '../../lib/components/Loading';
import ParsingExcerpt from './ParsingExcerpt';
import { useAdminContext } from '../AdminContext';
import theme from '../../theme';
import { makeStyles } from '@material-ui/styles';

const styles = {
    container: {
        position: 'relative',
        height: '645px',
        width: '100%',
        display: 'flex',
        maxHeight: 'calc(((100vh - 100px) - 76px) - 72px)',
    },
    enrichedColumn: {
        backgroundColor: theme.green.light,
    },
};

const useStyles = makeStyles(styles);

export const ParsingResultComponent = props => {
    const {
        p: polyglot,
        excerptColumns,
        excerptLines,
        maxLines,
        showAddFromColumn,
        onAddField,
        dataGrid,
        enrichments,
    } = props;

    const classes = useStyles();
    const adminContext = useAdminContext();
    const showEnrichmentColumns = adminContext?.showEnrichmentColumns;
    const showMainColumns = adminContext?.showMainColumns;

    const [datas, setDatas] = useState([]);

    const getColumnsToShow = () => {
        if (datas.length === 0) return [];
        const enrichmentsNames = enrichments.map(enrichment => enrichment.name);

        return Object.keys(datas[0])
            .filter(key => key !== 'uri')
            .filter(key => {
                return (
                    (showEnrichmentColumns && enrichmentsNames.includes(key)) ||
                    (showMainColumns && !enrichmentsNames.includes(key)) ||
                    key === '_id'
                );
            })
            .map(key => ({
                field: key,
                headerName: key,
                cellClassName:
                    enrichmentsNames.includes(key) && classes.enrichedColumn,
            }));
    };

    const columns = useMemo(
        () =>
            getColumnsToShow(
                datas,
                showEnrichmentColumns,
                showMainColumns,
                enrichments,
            ),
        [datas, showEnrichmentColumns, showMainColumns, enrichments],
    );

    const rows = useMemo(() => datas.map(data => ({ id: data._id, ...data })), [
        datas,
    ]);

    const [rowCount, setRowCount] = useState(0);
    const [skip, setSkip] = useState(0);
    const [limit] = useState(10);
    const [filter] = useState({});

    const onPageChange = page => {
        setSkip(page * limit);
    };

    useEffect(() => {
        const fetchDataset = async () => {
            const { count: datasCount, datas } = await datasetApi.getDataset({
                skip,
                limit,
                filter,
            });
            setRowCount(datasCount);
            setDatas(datas);
        };
        fetchDataset();
    }, [skip, limit, filter]);

    if (rows.length === 0) {
        return (
            <Loading className="admin">
                {polyglot.t('loading_parsing_results')}
            </Loading>
        );
    }

    return (
        <div className={classes.container}>
            {dataGrid ? (
                <DataGrid
                    columns={columns}
                    rows={rows}
                    rowCount={rowCount}
                    autoPageSize
                    disableColumnFilter
                    disableColumnMenu
                    pageSize={10}
                    paginationMode="server"
                    onPageChange={onPageChange}
                />
            ) : (
                <ParsingExcerpt
                    columns={excerptColumns}
                    lines={excerptLines.slice(0, maxLines)}
                    showAddFromColumn={showAddFromColumn}
                    onAddField={onAddField}
                />
            )}
        </div>
    );
};

ParsingResultComponent.propTypes = {
    excerptColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
    excerptLines: PropTypes.arrayOf(PropTypes.object).isRequired,
    p: polyglotPropTypes.isRequired,
    handleClearParsing: PropTypes.func.isRequired,
    showAddFromColumn: PropTypes.bool.isRequired,
    onAddField: PropTypes.func,
    maxLines: PropTypes.number,
    loadingParsingResult: PropTypes.bool.isRequired,
    dataGrid: PropTypes.bool,
    enrichments: PropTypes.arrayOf(PropTypes.object),
};

ParsingResultComponent.defaultProps = {
    maxLines: 10,
    showAddFromColumn: false,
};

const mapStateToProps = state => ({
    excerptColumns: fromParsing.getParsedExcerptColumns(state),
    excerptLines: fromParsing.getExcerptLines(state),
    loadingParsingResult: fromParsing.isParsingLoading(state),
    enrichments: fromEnrichments.enrichments(state),
});

const mapDispatchToProps = {
    handleClearParsing: reloadParsingResult,
};

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    translate,
)(ParsingResultComponent);
