import React, { PropTypes } from 'react';
import classnames from 'classnames';
import { Link } from 'react-router';
import { TableRowColumn } from 'material-ui/Table';
import { field as fieldPropTypes } from '../../propTypes';
import { getResourceUri } from '../../../../common/uris';

const getHumanUri = (uri) => {
    if (uri.startsWith('uid:/')) {
        return `uid:/${decodeURIComponent(uri.substr(4))}`;
    }

    return uri;
};

const UriColumn = ({ column, resource }) => (
    <TableRowColumn className={classnames('dataset-column', `dataset-${column.name}`)}>
        <Link to={getResourceUri(resource, `${window.location.protocol}//${window.location.host}`)}>
            {getHumanUri(resource[column.name])}
        </Link>
    </TableRowColumn>
);

UriColumn.propTypes = {
    column: fieldPropTypes.isRequired,
    resource: PropTypes.object.isRequired, // eslint-disable-line
};

export default UriColumn;
