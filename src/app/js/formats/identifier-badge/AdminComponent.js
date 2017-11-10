import React, { Component, PropTypes } from 'react';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import translate from 'redux-polyglot/translate';
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
};

class IdentifierBadgeEdition extends Component {
    static propTypes = {
        typid: PropTypes.string,
        colors: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        p: polyglotPropTypes.isRequired,
    }

    static defaultProps = {
        typid: 1,
        colors: '#8B8B8B #5B5B5B #818181',
    }
    constructor(props) {
        super(props);

        this.state = {
            typid: this.props.typid,
            colors: this.props.colors,
        };
    }

    setTypid = (typid) => {
        this.setState({ typid });
        this.props.onChange({
            colors: this.state.colors,
            typid,
        });
    }

    setColors = (colors) => {
        this.setState({ colors });
        this.props.onChange({
            typid: this.state.typid,
            colors,
        });
    }

    render() {
        const { p: polyglot } = this.props;
        const { colors, typid } = this.state;
        return (
            <div style={styles.container}>
                <SelectField
                    floatingLabelText={polyglot.t('list_format_select_identifier')}
                    onChange={(event, index, newValue) => this.setTypid(newValue)}
                    style={styles.input}
                    value={typid}
                >
                    <MenuItem value="DOI" primaryText={polyglot.t('DOI')} />
                    <MenuItem value="PMID" primaryText={polyglot.t('PMID')} />
                </SelectField>
                <TextField
                    floatingLabelText={polyglot.t('colors_set')}
                    onChange={(event, newValue) => this.setColors(newValue)}
                    style={styles.input2}
                    value={colors}
                />
            </div>
        );
    }
}

export default translate(IdentifierBadgeEdition);
