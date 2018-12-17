import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import translate from 'redux-polyglot/translate';
import classnames from 'classnames';
import debounce from 'lodash.debounce';

import TextField from 'material-ui/TextField';
import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from 'material-ui/FlatButton';
import Link from '../../lib/components/Link';
import {
    polyglot as polyglotPropTypes,
    field as fieldProptypes,
    resource as resourcePropTypes,
} from '../../propTypes';
import { preLoadPublication as preLoadPublicationAction } from '../../fields';
import { search as searchAction, loadMore as loadMoreAction } from './reducer';
import { fromFields } from '../../sharedSelectors';
import { fromSearch } from '../selectors';
import theme from '../../theme';
import AdminOnlyAlert from '../../lib/components/AdminOnlyAlert';
import AppliedFacets from './AppliedFacets';
import SearchResultList from './SearchResultList';
import stylesToClassname from '../../lib/stylesToClassName';

const styles = stylesToClassname(
    {
        container: {
            margin: '0 auto',
        },
        header: {
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem',
        },
        searchBarContainer: {
            flex: '1 0 0',
        },
        details: {
            display: 'flex',
        },
        advanced: {
            display: 'flex',
            flex: '0 0 auto',
            flexDirection: 'column',
        },
        advancedTopBar: {
            display: 'flex',
        },
        searchMessage: {
            flex: '1 0 0',
            color: 'rgb(95, 99, 104)',
        },
        advancedToggle: {
            alignSelf: 'flex-end',
            cursor: 'pointer',
        },
        advancedFacets: {
            flex: '0 0 auto',
        },
        searchResults: {
            margin: '1.5rem 0',
            opacity: '1',
            transition: 'opacity 300ms ease-in-out',
        },
        searchResultsOpening: {
            opacity: '0',
        },
        searchResultsEmpty: {
            opacity: '0',
        },
        loading: {
            marginRight: '1rem',
            marginTop: '-0.2rem',
        },
        loadMore: {
            height: 36,
            marginTop: '1.5rem',
        },
        noResult: {
            position: 'absolute',
            top: '40%',
            width: '100%',
            textAlign: 'center',
        },
    },
    'search',
);

const muiStyles = {
    searchBarUnderline: {
        borderColor: theme.orange.primary,
    },
};

class Search extends Component {
    state = {
        bufferQuery: null,
        opening: true,
    };

    constructor(props) {
        super(props);
        this.textInput = React.createRef();
    }

    UNSAFE_componentWillMount() {
        const { searchQuery, search, preLoadPublication } = this.props;

        preLoadPublication();
        search({ query: searchQuery || '' });

        setTimeout(() => {
            this.setState({ opening: false });
            this.textInput.current.input.focus();
        }, 300);
    }

    debouncedSearch = debounce(params => {
        this.props.search(params);
    }, 500);

    handleTextFieldChange = (_, query) => {
        this.debouncedSearch({ query });
        this.setState({ bufferQuery: query });
    };

    renderNoResults = () => {
        const { p: polyglot } = this.props;

        return (
            <div className={styles.noResult}>
                <div>
                    <strong>{polyglot.t('no_result')}</strong>
                </div>
                <div>{polyglot.t('no_result_details')}</div>
            </div>
        );
    };

    renderNoOverviewField = () => {
        const { p: polyglot } = this.props;

        return (
            <AdminOnlyAlert>
                {polyglot.t('no_overview_field_error')}
            </AdminOnlyAlert>
        );
    };

    renderLoadMore = () => {
        const { loadMore, p: polyglot, results, total, loading } = this.props;

        return (
            <div className={classnames('load-more', styles.loadMore)}>
                {loading ? (
                    <Fragment>
                        <CircularProgress
                            size={20}
                            className={styles.loading}
                        />{' '}
                        {polyglot.t('loading')}
                    </Fragment>
                ) : (
                    <FlatButton fullWidth onClick={loadMore}>
                        {polyglot.t('search_load_more')} ({results.length} /{' '}
                        {total})
                    </FlatButton>
                )}
            </div>
        );
    };

    render() {
        const { bufferQuery, opening } = this.state;
        const {
            searchQuery,
            loading,
            fieldNames,
            results,
            total,
            p: polyglot,
            showAdvancedSearch,
            toggleAdvancedSearch,
            fields,
            closeDrawer,
        } = this.props;

        const noOverviewField =
            !loading &&
            Object.values(fieldNames).filter(Boolean).length === 1 &&
            fieldNames.uri === 'uri';
        const noResults = !loading && !noOverviewField && results.length === 0;

        const everythingIsOk = !noOverviewField && !noResults;
        const canLoadMore = everythingIsOk && results.length < total;

        return (
            <div className={classnames('search', styles.container)}>
                <div className={classnames('search-header', styles.header)}>
                    <div
                        className={classnames(
                            'search-bar',
                            styles.searchBarContainer,
                        )}
                    >
                        <TextField
                            hintText={`🔍 ${polyglot.t('search_placeholder')}`}
                            fullWidth
                            onChange={this.handleTextFieldChange}
                            value={
                                (bufferQuery !== null
                                    ? bufferQuery
                                    : searchQuery) || ''
                            }
                            underlineStyle={muiStyles.searchBarUnderline}
                            underlineFocusStyle={muiStyles.searchBarUnderline}
                            ref={this.textInput}
                        />
                    </div>
                    <div
                        className={classnames(
                            'search-advanced',
                            styles.advanced,
                        )}
                    >
                        <div className={styles.advancedTopBar}>
                            {(everythingIsOk || noResults) && (
                                <div
                                    className={classnames(
                                        'search-message',
                                        styles.searchMessage,
                                    )}
                                >
                                    {loading
                                        ? polyglot.t('loading')
                                        : polyglot.t('results', {
                                              smart_count: total,
                                          })}
                                </div>
                            )}
                            {showAdvancedSearch && (
                                <Link
                                    className={classnames(
                                        'search-advanced-toggle',
                                        styles.advancedToggle,
                                    )}
                                    onClick={toggleAdvancedSearch}
                                >
                                    {polyglot.t('search_advanced')}
                                </Link>
                            )}
                        </div>
                        {showAdvancedSearch && (
                            <AppliedFacets className={styles.advancedFacets} />
                        )}
                    </div>
                </div>
                <div
                    className={classnames(
                        'search-results',
                        styles.searchResults,
                        { [styles.searchResultsOpening]: opening },
                    )}
                >
                    {noOverviewField && this.renderNoOverviewField()}
                    {noResults && this.renderNoResults()}
                    {everythingIsOk && (
                        <SearchResultList
                            results={results}
                            fields={fields}
                            fieldNames={fieldNames}
                            closeDrawer={closeDrawer}
                        />
                    )}
                    {canLoadMore && this.renderLoadMore()}
                </div>
            </div>
        );
    }
}

Search.propTypes = {
    search: PropTypes.func.isRequired,
    searchQuery: PropTypes.string,
    preLoadPublication: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    p: polyglotPropTypes.isRequired,
    results: PropTypes.arrayOf(resourcePropTypes).isRequired,
    fieldNames: PropTypes.shape({
        uri: PropTypes.string,
        title: PropTypes.string,
        description: PropTypes.string,
    }).isRequired,
    fields: PropTypes.arrayOf(fieldProptypes).isRequired,
    loadMore: PropTypes.func.isRequired,
    total: PropTypes.number.isRequired,
    closeDrawer: PropTypes.func.isRequired,
    showAdvancedSearch: PropTypes.bool.isRequired,
    toggleAdvancedSearch: PropTypes.func.isRequired,
};

Search.defaultProps = {
    searchQuery: null,
};

const mapStateToProps = state => ({
    loading: fromSearch.isLoading(state),
    results: fromSearch.getDataset(state),
    fieldNames: fromSearch.getFieldNames(state),
    fields: fromFields.getFields(state),
    total: fromSearch.getTotal(state),
    searchQuery: fromSearch.getQuery(state),
});

const mapDispatchToProps = {
    search: searchAction,
    preLoadPublication: preLoadPublicationAction,
    loadMore: loadMoreAction,
};

export default compose(
    translate,
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
)(Search);
