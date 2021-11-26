import React from 'react';
import PropTypes from 'prop-types';
import HomeIcon from '@material-ui/icons/Home';
import MainResourceIcon from '@material-ui/icons/InsertDriveFile';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import FilterAtIcon from './FilterAt';

const HOME = 'home';
const DOCUMENT = 'document';
const SUBRESSOURCE = 'subRessource';
const CHART = 'chart';
const FACET = 'facet';
const INTERNAL_SCOPE_ICON = [];
INTERNAL_SCOPE_ICON['home'] = <HomeIcon />;
INTERNAL_SCOPE_ICON['document'] = <MainResourceIcon />;
INTERNAL_SCOPE_ICON['subRessource'] = <FileCopyIcon />;
INTERNAL_SCOPE_ICON['facet'] = <FilterAtIcon />;
INTERNAL_SCOPE_ICON['chart'] = <EqualizerIcon />;

const getIconInternalScope = scope => {
    if (scope) {
        return INTERNAL_SCOPE_ICON[scope];
    }
};

const FieldInternalIcon = ({ scope }) => getIconInternalScope(scope);

FieldInternalIcon.propTypes = {
    scope: PropTypes.oneOf([HOME, DOCUMENT, CHART, SUBRESSOURCE, FACET, '']),
};

export default FieldInternalIcon;
