import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, css } from 'aphrodite/no-important';
import { Link } from 'react-router';
import { getFullResourceUri } from '../../../../common/uris';

const styles = StyleSheet.create({
    contentTitle: {
        fontSize: '16px',
        lineHeight: '20px',
        fontWeight: '400',
    },
    contentParagraph: {
        flex: '1 0 auto',
        color: '#A1A1A4',
        lineHeight: '16px',
    },
    contentLink: {
        cursor: 'pointer',
        textDecoration: 'inherit',
        color: 'inherit',
        fill: 'inherit',
        ':hover': {
            textDecoration: 'inherit',
            color: 'inherit',
            fill: 'inherit',
        },
        ':active': {
            textDecoration: 'inherit',
            color: 'inherit',
            fill: 'inherit',
        },
    },
    contentCustomDiv: {},
});

// see https://jsonfeed.org/version/1#items
const LodexResource = ({ id, url, title, summary }) => {
    if (!id) {
        return null;
    }
    let urlDomain = url.replace(id, '');
    let getFullResourceUriDomain = getFullResourceUri({ uri: id }).replace(
        id,
        '',
    );

    const content = () => {
        return (
            <div>
                <div className={css(styles.contentTitle)}>{title}</div>
                <div className={css(styles.contentParagraph)}>{summary}</div>
                <div className={css(styles.contentCustomDiv)} />
            </div>
        );
    };

    if (urlDomain == getFullResourceUriDomain) {
        return (
            <div id={id}>
                <Link
                    className={css(styles.contentLink)}
                    to={getFullResourceUri({ uri: id })}
                >
                    {content()}
                </Link>
            </div>
        );
    } else {
        return (
            <div id={id}>
                <Link className={css(styles.contentLink)} href={url}>
                    {content()}
                </Link>
            </div>
        );
    }
};

LodexResource.propTypes = {
    id: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    title: PropTypes.string,
    summary: PropTypes.string,
};

LodexResource.defaultProps = {
    title: 'n/a',
    summary: '',
};

export default LodexResource;
