import React, { useEffect } from 'react';
import fieldApi from '../../admin/api/field';
import PropTypes from 'prop-types';
import translate from 'redux-polyglot/translate';
import SearchAutocomplete from './SearchAutocomplete';

import { connect } from 'react-redux';
import { compose } from 'recompose';
import { fromFields } from '../../sharedSelectors';
import { loadField } from '../../fields';
import { polyglot as polyglotPropTypes } from '../../propTypes';
import { Box } from '@mui/system';
import {
    Checkbox,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import { Typography } from '@material-ui/core';

import * as overview from '../../../../common/overview';
import { toast } from 'react-toastify';
import { SCOPE_COLLECTION, SCOPE_DOCUMENT } from '../../../../common/scope';

const getSearchableFields = fields => fields.filter(f => f.searchable) || [];

const getFaceFields = fields => fields.filter(f => f.isFacet) || [];

const getResourceTitle = fields =>
    fields.find(f => f.overview === overview.RESOURCE_TITLE) || null;
const getResourceDescription = fields =>
    fields.find(f => f.overview === overview.RESOURCE_DESCRIPTION) || null;
const getResourceDetailFirst = fields =>
    fields.find(f => f.overview === overview.RESOURCE_DETAIL_1) || null;
const getResourceDetailSecond = fields =>
    fields.find(f => f.overview === overview.RESOURCE_DETAIL_2) || null;

export const SearchForm = ({ fields, loadField, p: polyglot }) => {
    const [searchInFields, setSearchInFields] = React.useState(
        getSearchableFields(fields),
    );

    const [facetChecked, setFacetChecked] = React.useState(
        getFaceFields(fields),
    );

    const [resourceTitle, setResourceTitle] = React.useState(
        getResourceTitle(fields),
    );
    const [resourceDescription, setResourceDescription] = React.useState(
        getResourceDescription(fields),
    );
    const [resourceDetailFirst, setResourceDetailFirst] = React.useState(
        getResourceDetailFirst(fields),
    );
    const [resourceDetailSecond, setResourceDetailSecond] = React.useState(
        getResourceDetailSecond(fields),
    );

    useEffect(() => {
        loadField();
    }, []);

    // We could lower the complexity with only one map. But it's more readable like this. And the performance is not a problem here.
    useEffect(() => {
        setSearchInFields(getSearchableFields(fields));
        setFacetChecked(getFaceFields(fields));
        setResourceTitle(getResourceTitle(fields));
        setResourceDescription(getResourceDescription(fields));
        setResourceDetailFirst(getResourceDetailFirst(fields));
        setResourceDetailSecond(getResourceDetailSecond(fields));
    }, [fields]);

    const fieldsForResourceSyndication = fields.filter(
        f => f.scope === SCOPE_DOCUMENT || f.scope === SCOPE_COLLECTION,
    );

    const handleSearchInFieldsChange = async (event, value) => {
        setSearchInFields(value);
        const res = await fieldApi.patchSearchableFields(value);
        if (res) {
            toast(polyglot.t('searchable_success'), {
                type: toast.TYPE.SUCCESS,
                autoClose: 2000,
            });
        } else {
            toast(polyglot.t('searchable_error'), {
                type: toast.TYPE.ERROR,
                autoClose: 2000,
            });
        }
    };

    const saveSyndication = async (value, overview) => {
        const { _id } = value;
        const res = await fieldApi.patchField({
            _id,
            overview,
        });
        if (res) {
            toast(polyglot.t('syndication_success'), {
                type: toast.TYPE.SUCCESS,
                autoClose: 2000,
            });
            loadField();
        } else {
            toast(polyglot.t('syndication_error'), {
                type: toast.TYPE.ERROR,
                autoClose: 2000,
            });
        }
    };

    const handleSResourceTitle = async (event, value) => {
        saveSyndication(value, overview.RESOURCE_TITLE);
    };
    const handleSResourceDescription = async (event, value) => {
        saveSyndication(value, overview.RESOURCE_DESCRIPTION);
    };
    const handleSResourceDetailFirst = async (event, value) => {
        saveSyndication(value, overview.RESOURCE_DETAIL_1);
    };
    const handleSResourceDetailSecond = async (event, value) => {
        saveSyndication(value, overview.RESOURCE_DETAIL_2);
    };

    const handleFacetCheckedChange = async value => {
        const currentIndex = facetChecked.findIndex(
            item => item.name === value.name,
        );
        const oldChecked = [...facetChecked];
        const newChecked = [...facetChecked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setFacetChecked(newChecked);

        const { _id } = value;
        const res = await fieldApi.patchField({
            _id,
            isFacet: currentIndex === -1,
        });
        if (res) {
            toast(polyglot.t('facet_success'), {
                type: toast.TYPE.SUCCESS,
                autoClose: 2000,
            });
        } else {
            toast(polyglot.t('facet_error'), {
                type: toast.TYPE.ERROR,
                autoClose: 2000,
            });
            setFacetChecked(oldChecked);
        }
    };

    return (
        <Box>
            <Box display="flex" flexDirection="column" mb={5}>
                <Typography variant="caption" sx={{ margin: 'auto' }}>
                    {polyglot.t('search_input')}
                </Typography>
                <Box sx={{ border: '1px dashed', padding: 2 }}>
                    <SearchAutocomplete
                        testId="autocomplete_search_in_fields"
                        translation={polyglot.t('search_in_fields')}
                        fields={fields}
                        onChange={handleSearchInFieldsChange}
                        value={searchInFields}
                        multiple
                    />
                </Box>
            </Box>

            <Box display="flex" alignItems={'stretch'} gap={10}>
                <Box display="flex" flex={1} flexDirection="column">
                    <Typography variant="caption" sx={{ margin: 'auto' }}>
                        {polyglot.t('facet')}
                    </Typography>
                    <Box sx={{ border: '1px dashed' }}>
                        <List
                            sx={{
                                width: '100%',
                                bgcolor: 'background.paper',
                                maxHeight: 300,
                                overflow: 'auto',
                                padding: 2,
                            }}
                        >
                            {fields.map(field => {
                                const labelId = `checkbox-list-label-${field.name}`;

                                return (
                                    <ListItem key={field.name} disablePadding>
                                        <ListItemButton
                                            onClick={() =>
                                                handleFacetCheckedChange(field)
                                            }
                                            dense
                                        >
                                            <ListItemIcon>
                                                <Checkbox
                                                    edge="start"
                                                    checked={
                                                        facetChecked.findIndex(
                                                            item =>
                                                                item.name ===
                                                                field.name,
                                                        ) !== -1
                                                    }
                                                    tabIndex={-1}
                                                    disableRipple
                                                    inputProps={{
                                                        'aria-labelledby': labelId,
                                                    }}
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                id={labelId}
                                                primary={`(${field.name}) ${field.label}`}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>
                </Box>

                <Box display="flex" flex={1} flexDirection="column">
                    <Typography variant="caption" sx={{ margin: 'auto' }}>
                        {polyglot.t('search_syndication')}
                    </Typography>
                    <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent={'space-between'}
                        sx={{
                            border: '1px dashed',
                            padding: 2,
                            flexGrow: 1,
                            gap: 2,
                        }}
                    >
                        <SearchAutocomplete
                            testId="autocomplete_search_title_syndication"
                            translation={polyglot.t('resource_title')}
                            fields={fieldsForResourceSyndication}
                            onChange={handleSResourceTitle}
                            value={resourceTitle}
                        />
                        <SearchAutocomplete
                            testId="autocomplete_search_description_syndication"
                            translation={polyglot.t('resource_description')}
                            fields={fieldsForResourceSyndication}
                            onChange={handleSResourceDescription}
                            value={resourceDescription}
                        />
                        <Box display="flex" gap={2}>
                            <SearchAutocomplete
                                testId="autocomplete_search_detail_first_syndication"
                                translation={polyglot.t(
                                    'resource_detail_first',
                                )}
                                fields={fieldsForResourceSyndication}
                                onChange={handleSResourceDetailFirst}
                                value={resourceDetailFirst}
                            />
                            <SearchAutocomplete
                                testId="autocomplete_search_detail_second_syndication"
                                translation={polyglot.t(
                                    'resource_detail_second',
                                )}
                                fields={fieldsForResourceSyndication}
                                onChange={handleSResourceDetailSecond}
                                value={resourceDetailSecond}
                            />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

SearchForm.propTypes = {
    fields: PropTypes.arrayOf(PropTypes.object).isRequired,
    loadField: PropTypes.func.isRequired,
    p: polyglotPropTypes.isRequired,
};

const mapStateToProps = state => ({
    fields: fromFields.getFields(state),
});

const mapDispatchToProps = {
    loadField,
};

export default compose(
    translate,
    connect(mapStateToProps, mapDispatchToProps),
)(SearchForm);
