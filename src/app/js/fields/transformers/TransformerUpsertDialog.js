import React from 'react';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import translate from 'redux-polyglot/translate';

import { fromFields } from '../../sharedSelectors';

import { connect } from 'react-redux';
import {
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    ListItem,
    TextField,
    Typography,
} from '@mui/material';

import classNames from 'classnames';
import colorsTheme from '../../../custom/colorsTheme';
import { DialogActions, makeStyles } from '@material-ui/core';
import TransformerArg from './TransformerArg';

const useStyles = makeStyles({
    item: {
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: colorsTheme.black.veryLight,
        },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        borderBottom: `1px solid ${colorsTheme.black.light}`,
        '&:last-child': {
            borderBottom: 'none',
        },
    },
    selectedItem: {
        backgroundColor: colorsTheme.green.secondary,
        '&:hover': {
            backgroundColor: colorsTheme.green.primary,
        },
    },
});

const TransformerUpsertDialog = ({
    availableTransformers,
    fields,
    indexFieldToEdit = null,
    isOpen = false,
    handleClose,
    p: polyglot,
}) => {
    const classes = useStyles();
    const [transformer, setTransformer] = React.useState(
        indexFieldToEdit !== null ? fields.get(indexFieldToEdit) : {},
    );

    if (!isOpen) {
        return null;
    }

    if (!transformer) {
        return null;
    }

    const handleChangeOperation = newValue => {
        setTransformer({
            operation: newValue,
        });
    };

    const handleUpsert = () => {
        if (indexFieldToEdit !== null) {
            fields.remove(indexFieldToEdit);
            fields.insert(indexFieldToEdit, transformer);
        } else {
            fields.push(transformer);
        }
        handleClose();
    };

    return (
        <Dialog open={isOpen} onClose={handleClose} scroll="body" maxWidth="lg">
            <DialogTitle>
                {indexFieldToEdit !== null
                    ? polyglot.t('edit_transformer')
                    : polyglot.t('add_transformer')}
            </DialogTitle>

            <DialogContent style={{ padding: 10, width: '800px' }}>
                <Box display={'flex'} flexDirection="column">
                    <Autocomplete
                        aria-label={polyglot.t('select_an_operation')}
                        value={transformer.operation}
                        onChange={(event, newValue) => {
                            handleChangeOperation(newValue);
                        }}
                        options={availableTransformers}
                        renderInput={params => (
                            <TextField
                                {...params}
                                label={polyglot.t('select_an_operation')}
                                variant="outlined"
                            />
                        )}
                        renderOption={(props, option, state) => {
                            return (
                                <ListItem
                                    {...props}
                                    className={classNames(classes.item, {
                                        [classes.selectedItem]: state.selected,
                                    })}
                                >
                                    <Typography>{option}</Typography>
                                    <Typography
                                        variant="body2"
                                        color="textSecondary"
                                    >
                                        {polyglot.t(`transformer_${option}`)}
                                    </Typography>
                                </ListItem>
                            );
                        }}
                    />
                    <TransformerArg
                        operation={transformer.operation}
                        transformerArgs={transformer.args}
                        onChange={args => {
                            setTransformer(transformer => ({
                                ...transformer,
                                args,
                            }));
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    aria-label={polyglot.t('cancel')}
                    color="secondary"
                    variant="text"
                    onClick={handleClose}
                >
                    {polyglot.t('cancel')}
                </Button>
                <Button
                    aria-label={polyglot.t('confirm')}
                    color="primary"
                    variant="contained"
                    onClick={handleUpsert}
                >
                    {polyglot.t('confirm')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

TransformerUpsertDialog.propTypes = {
    availableTransformers: PropTypes.array,
    fields: PropTypes.shape({
        get: PropTypes.func.isRequired,
        remove: PropTypes.func.isRequired,
        push: PropTypes.func.isRequired,
        insert: PropTypes.func.isRequired,
    }).isRequired,
    handleClose: PropTypes.func.isRequired,
    indexFieldToEdit: PropTypes.number,
    isOpen: PropTypes.bool,
    p: PropTypes.func.isRequired,
};

const mapStateToProps = (state, { type }) => ({
    availableTransformers: fromFields
        .getTransformers(state, type)
        .map(transformer => transformer.name),
});

export default compose(
    connect(mapStateToProps, null),
    translate,
)(TransformerUpsertDialog);