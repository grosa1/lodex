import get from 'lodash.get';
import pick from 'lodash.pick';

export const getAppliedFacets = ({ appliedFacets }) => appliedFacets;

export const getAppliedFacetList = ({ appliedFacets }) =>
    Object.keys(appliedFacets).map(name => ({
        name,
        value: appliedFacets[name],
    }));

export const isFacetOpen = (state, name) => !!state.openedFacets[name];

export const getFacetValues = (state, name) =>
    get(state, ['facetsValues', name, 'values'], []);

export const getFacetValuesTotal = (state, name) =>
    get(state, ['facetsValues', name, 'total'], 0);

export const getFacetValuesPage = (state, name) =>
    get(state, ['facetsValues', name, 'currentPage'], 0);

export const getFacetValuesPerPage = (state, name) =>
    get(state, ['facetsValues', name, 'perPage'], 10);

export const getFacetValuesFilter = (state, name) =>
    get(state, ['facetsValues', name, 'filter'], '');

export const getFacetValuesSort = (state, name) =>
    get(state, ['facetsValues', name, 'sort'], {});

export const isFacetValuesInverted = ({ invertedFacets }, name) =>
    !!invertedFacets[name];

export const isFacetValuesChecked = (state, { name, facetValue }) =>
    get(state, ['appliedFacets', name], []).some(
        facet => facet?.value == facetValue?.value,
    );

export const getInvertedFacetKeys = ({ invertedFacets }) =>
    Object.keys(invertedFacets);

export const getFacetValueRequestData = (state, name) =>
    pick(get(state, ['facetsValues', name], {}), [
        'sort',
        'filter',
        'currentPage',
        'perPage',
    ]);

export const getFacetsValues = ({ facetsValues }) => facetsValues;

export const getOpenedFacets = ({ openedFacets }) => openedFacets;

export const getInvertedFacets = ({ invertedFacets }) => invertedFacets;

export const getMaxCheckAllValue = ({ maxCheckAllValue }) => maxCheckAllValue;

export default {
    getAppliedFacets,
    getAppliedFacetList,
    isFacetOpen,
    getFacetValues,
    isFacetValuesChecked,
    getFacetValuesTotal,
    getFacetValuesPage,
    getFacetValuesPerPage,
    getFacetValuesFilter,
    getFacetValuesSort,
    isFacetValuesInverted,
    getInvertedFacetKeys,
    getFacetValueRequestData,
    getOpenedFacets,
    getFacetsValues,
    getInvertedFacets,
    getMaxCheckAllValue,
};
