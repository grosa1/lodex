import React, { Component } from 'react';
import PropTypes from 'prop-types';
import translate from 'redux-polyglot/translate';
import { schemeBlues, schemeOrRd } from 'd3-scale-chromatic';
import TextField from 'material-ui/TextField';

import ColorSchemeSelector from '../../lib/components/ColorSchemeSelector';

import { polyglot as polyglotPropTypes } from '../../propTypes';

const styles = {
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        width: '200%',
        justifyContent: 'space-between',
    },
    input: {
        marginLeft: '1rem',
        width: '40%',
    },
    input2: {
        width: '100%',
    },
    previewDefaultColor: color => ({
        display: 'inline-block',
        backgroundColor: color,
        height: '1em',
        width: '1em',
        marginLeft: 5,
        border: 'solid 1px black',
    }),
};

class CartographyAdmin extends Component {
    static propTypes = {
        colorScheme: PropTypes.arrayOf(PropTypes.string),
        hoverColorScheme: PropTypes.arrayOf(PropTypes.string),
        defaultColor: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        p: polyglotPropTypes.isRequired,
    };

    static defaultProps = {
        colorScheme: schemeOrRd[9],
        hoverColorScheme: schemeBlues[9],
        defaultColor: '#f5f5f5',
    };
    constructor(props) {
        super(props);
        const { colorScheme, hoverColorScheme, defaultColor } = this.props;
        this.state = { colorScheme, hoverColorScheme, defaultColor };
    }

    setDefaultColor = (_, defaultColor) => {
        const { params, ...state } = this.state;
        const newState = { ...state, defaultColor };
        this.setState(newState);
        this.props.onChange(newState);
    };

    setColorScheme = (_, __, colorScheme) => {
        const newState = { ...this.state, colorScheme: colorScheme.split(',') };
        this.setState(newState);
        this.props.onChange(newState);
    };

    setHoverColorScheme = (_, __, hoverColorScheme) => {
        const newState = {
            ...this.state,
            hoverColorScheme: hoverColorScheme.split(','),
        };
        this.setState(newState);
        this.props.onChange(newState);
    };

    render() {
        const { p: polyglot } = this.props;
        const { colorScheme, hoverColorScheme, defaultColor } = this.state;

        return (
            <div style={styles.container}>
                <TextField
                    floatingLabelText={
                        <span>
                            {polyglot.t('default_color')}
                            <span
                                style={styles.previewDefaultColor(defaultColor)}
                            />
                        </span>
                    }
                    onChange={this.setDefaultColor}
                    style={styles.input}
                    underlineStyle={{ borderColor: defaultColor }}
                    underlineFocusStyle={{ borderColor: defaultColor }}
                    value={defaultColor}
                />
                <ColorSchemeSelector
                    label={polyglot.t('color_scheme')}
                    onChange={this.setColorScheme}
                    style={styles.input}
                    value={colorScheme}
                />
                <ColorSchemeSelector
                    label={polyglot.t('hover_color_scheme')}
                    onChange={this.setHoverColorScheme}
                    style={styles.input}
                    value={hoverColorScheme}
                />
            </div>
        );
    }
}

export default translate(CartographyAdmin);