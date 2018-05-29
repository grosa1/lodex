import React, { Component } from 'react';
import PropTypes from 'prop-types';
import translate from 'redux-polyglot/translate';
import compose from 'recompose/compose';
import SparqlRequest from '../SparqlRequest';
import { isURL } from '../../../../../common/uris.js';
import { field as fieldPropTypes } from '../../../propTypes';
import URL from 'url';
import IconButton from 'material-ui/IconButton';
import ActionSearch from 'material-ui/svg-icons/action/search';
import TextField from 'material-ui/TextField';
import topairs from 'lodash.topairs';
import toSentenceCase from 'js-sentencecase';
import ifIsImage from 'if-is-image';

const styles = {
    icon: {
        cursor: 'default',
        verticalAlign: 'bottom',
        width: '5%',
    },
    container: {
        display: 'block',
        width: '100%',
        color: 'lightGrey',
    },
    input1: {
        fontSize: '0.7em',
        width: '80%',
        borderImage: 'none',
    },
    input2: {
        marginLeft: '2.5%',
        fontSize: '0.7em',
        width: '12.5%',
        borderImage: 'none',
    },
    container2: {
        paddingLeft: '2rem',
        marginBottom: '10px',
        marginRight: '1em',
        marginLeft: '2rem',
        borderLeft: '1px dotted',
        borderColor: '#9e9ea6',
    },
    label: {
        color: 'rgb(158, 158, 158)',
        flexGrow: '2',
        fontSize: '1.5rem',
        textDecoration: 'none',
    },
    id: {
        display: 'inline-block',
    },
    value: {
        display: 'inline-block',
    },
    lang: {
        display: 'inline-block',
        marginRight: '1rem',
        fontSize: '0.6em',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        color: 'grey',
        textTransform: 'uppercase',
        visibility: 'visible',
    },
    show: {
        display: 'inline-block',
        color: 'rgb(158, 158, 158)',
        flexGrow: '2',
        fontWeight: 'bold',
        fontSize: '2rem',
        textDecoration: 'none',
        cursor: 'pointer',
    },
    value_min: {
        display: 'inline-block',
        color: 'rgb(158, 158, 158)',
        fontSize: '1.3rem',
    },
    imgDefault: {
        height: '200px',
        width: '200px',
    },
};

export class SparqlTextField extends Component {
    checkImage = src => {
        if (ifIsImage(src)) {
            return <img src={src} style={styles.imgDefault} />;
        } else {
            return <a href={src}>{src}</a>;
        }
    };

    showURL = result => {
        if (isURL(result[1].value) && result[1].type == 'uri') {
            return this.checkImage(result[1].value);
        } else {
            return <span>{result[1].value}</span>;
        }
    };

    getLang = result => {
        if (result[1]['xml:lang'] != undefined) {
            return <span>{result[1]['xml:lang']}</span>;
        } else {
            return null;
        }
    };

    render() {
        const { className, formatData, resource, field, sparql } = this.props;
        if (formatData != undefined) {
            const requestText = resource[field.name];
            let endpoint = sparql.endpoint.substring(
                sparql.endpoint.search('//') + 2,
            );
            return (
                <div className={className}>
                    <div style={styles.container}>
                        <IconButton style={styles.icon}>
                            <ActionSearch color="lightGrey" />
                        </IconButton>
                        <TextField
                            style={styles.input1}
                            name="sparqlRequest"
                            value={requestText}
                        />
                        <TextField
                            style={styles.input2}
                            name="sparqlEnpoint"
                            value={endpoint}
                        />
                    </div>
                    {formatData.results.bindings.map((result, key) => {
                        return (
                            <div key={key} style={styles.container2}>
                                {topairs(result).map((obj, index) => {
                                    return (
                                        <div key={index}>
                                            <div style={styles.id}>
                                                <span
                                                    className="label_sparql"
                                                    style={styles.label}
                                                >
                                                    {toSentenceCase(obj[0])}
                                                    &#160; : &#160;
                                                </span>
                                            </div>
                                            <div
                                                className="value_sparql"
                                                style={styles.value}
                                            >
                                                {this.showURL(obj)} &#160;
                                            </div>
                                            <div
                                                className="lang_sparql property_language"
                                                style={styles.lang}
                                            >
                                                {this.getLang(obj)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            );
        } else {
            return <span> </span>;
        }
    }
}

SparqlTextField.propTypes = {
    className: PropTypes.string,
    formatData: PropTypes.object,
    sparql: PropTypes.object,
    field: fieldPropTypes.isRequired,
    resource: PropTypes.object.isRequired,
};

SparqlTextField.defaultProps = {
    className: null,
};

export default compose(
    translate,
    SparqlRequest(({ field, resource, sparql }) => {
        const value = resource[field.name];
        if (!value) {
            return null;
        }
        let builtURL = sparql.endpoint;
        if (!isURL(builtURL)) {
            builtURL = 'https://' + builtURL;
        }

        if (!builtURL.endsWith('?query=')) {
            builtURL += '?query=';
        }

        builtURL += encodeURIComponent(
            sparql.request
                .trim()
                .replace(/[\n\r\u200B]+/g, ' ')
                .replace(/[?]{2}/g, value.trim()),
        );
        builtURL = builtURL.replace(/LIMIT([%]20)+\d*/i, ''); //remove LIMIT with its var
        const request = builtURL + '%20LIMIT%20' + sparql.maxValue;
        if (isURL(request)) {
            const source = URL.parse(request);

            return URL.format(source);
        }
        return null;
    }),
)(SparqlTextField);
