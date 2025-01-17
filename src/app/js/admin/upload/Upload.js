import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import translate from 'redux-polyglot/translate';
import { withRouter } from 'react-router';
import { DropzoneAreaBase } from 'mui-file-dropzone';
import Alert from '../../lib/components/Alert';
import {
    Box,
    Button,
    TextField,
    Grid,
    CircularProgress,
    Typography,
} from '@mui/material';
import PublishIcon from '@mui/icons-material/Publish';

import { polyglot as polyglotPropTypes } from '../../propTypes';
import { uploadFile, changeUploadUrl, changeLoaderName, uploadUrl } from './';
import { fromUpload, fromLoaders } from '../selectors';
import LoaderSelect from './LoaderSelect';
import PopupConfirmUpload from './PopupConfirmUpload';
import { toast } from '../../../../common/tools/toast';
import customTheme from '../../../custom/customTheme';

const styles = {
    button: {
        marginLeft: 4,
        marginRight: 4,
        alignSelf: 'center',
        alignItems: 'flex-start',
    },
    input: {
        '@media (min-width: 992px)': {
            marginBottom: '16px',
        },
    },
    container: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        marginTop: '48px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        alignItems: 'center',
        margin: '0 40px',
        '@media (min-width: 992px)': {
            flexDirection: 'row',
        },
    },
    loader: {
        minHeight: '220px',
        backgroundColor: customTheme.palette.contrast.main,
        color: customTheme.palette.primary.secondary,
    },
    divider: {
        textTransform: 'uppercase',
        position: 'relative',
        textAlign: 'center',
        width: '100%',
        marginTop: '32px',
        '&:before': {
            width: '100%',
            height: '2px',
            content: '""',
            backgroundColor: customTheme.palette.primary.secondary,
            position: 'absolute',
            top: '50%',
            left: 0,
            transform: 'translateY(-50%)',
        },
        '@media (min-width: 992px)': {
            width: 'auto',
            marginTop: 0,
            alignSelf: 'stretch',
            display: 'flex',
            alignItems: 'center',
            '&:before': {
                width: '2px',
                height: '100%',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
            },
        },
    },
    dividerLabel: {
        padding: '1rem',
        backgroundColor: customTheme.palette.contrast.main,
        position: 'relative',
        display: 'inline-block',
        '@media (min-width: 992px)': {
            display: 'block',
            margin: '0 40px',
        },
    },
    dropzone: {
        minHeight: '220px',
        padding: '0 1rem',
    },
    disabledDropzone: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    dropzonePreview: {
        justifyContent: 'center',
        '& .MuiGrid-item, & .MuiChip-root': {
            maxWidth: '100%',
        },
    },
};

export const UploadComponent = ({
    history,
    error,
    url,
    loaderName,
    isUrlValid,
    isUploading,
    onChangeUrl,
    onChangeLoaderName,
    onFileLoad,
    onUrlUpload,
    p: polyglot,
    loaders,
    isFirstFile,
}) => {
    const [files, setFiles] = useState([]);
    const [dropping, setDropping] = useState(false);
    const [useUrlForUpload, setUseUrlForUpload] = useState(false);
    const [isOpenPopupConfirm, setIsOpenPopupConfirm] = useState(false);
    const path = history.location.pathname;
    const successRedirectPath = '/data/existing';

    const handleAdding = () => {
        setDropping(true);
    };

    const handleAddRejected = () => {
        setDropping(false);
    };

    const handleFileAdded = list => {
        setDropping(false);
        if (!list || list.length === 0) return;

        setFiles([...list]);
        toast(polyglot.t('add_file_success', { name: list[0].file.name }), {
            type: toast.TYPE.SUCCESS,
        });
    };

    const handleFileUploaded = () => {
        if (files.length === 0) return;
        if (!isFirstFile) {
            setIsOpenPopupConfirm(true);
        } else {
            onConfirm();
        }
    };

    const onConfirm = (...params) => {
        if (useUrlForUpload) {
            onUrlUpload(...params);
        } else {
            onFileLoad(files[0].file);
        }

        if (path != successRedirectPath) {
            history.push(successRedirectPath);
        }
    };

    const handleUrlAdded = (...params) => {
        if (!isFirstFile) {
            setIsOpenPopupConfirm(true);
        } else {
            onConfirm(...params);
        }
    };

    useEffect(() => {
        if (files.length > 0) {
            setUseUrlForUpload(false);
        }
        if (files.length === 0 && url && isUrlValid) {
            setUseUrlForUpload(true);
        }
    }, [files, url, isUrlValid]);

    return (
        <Box sx={styles.container}>
            {error ? (
                <Alert>
                    <p>Error uploading given file: </p>
                    <p>{error}</p>
                </Alert>
            ) : (
                <span />
            )}
            <Box
                sx={{
                    ...styles.form,
                    '& .dropzone': styles.dropzone,
                    '& .disabledDropzone': styles.disabledDropzone,
                    '& .dropzonePreview': styles.dropzonePreview,
                }}
            >
                {dropping ? (
                    <DroppingLoader text={polyglot.t('inspect_file')} />
                ) : (
                    <DropzoneAreaBase
                        fileObjects={files}
                        filesLimit={1}
                        maxFileSize={1 * 1024 * 1024 * 1024}
                        dropzoneText={
                            <Typography variant="h6">
                                {polyglot.t('import_file_text')}
                            </Typography>
                        }
                        dropzoneProps={{
                            disabled: !!url,
                        }}
                        dropzoneClass={`dropzone ${!!url &&
                            'disabledDropzone'}`}
                        showAlerts={['error']}
                        showPreviewsInDropzone
                        showFileNamesInPreview
                        previewGridClasses={{
                            container: 'dropzonePreview',
                        }}
                        useChipsForPreview
                        alertSnackbarProps={{
                            anchorOrigin: {
                                vertical: 'bottom',
                                horizontal: 'center',
                            },
                        }}
                        onAdd={fileObjs => handleFileAdded(fileObjs)}
                        onDrop={handleAdding}
                        onDropRejected={handleAddRejected}
                        onDelete={() => setFiles([])}
                    />
                )}
                <Box sx={styles.divider}>
                    <Typography variant="h6" sx={styles.dividerLabel}>
                        {polyglot.t('or')}
                    </Typography>
                </Box>
                <TextField
                    fullWidth
                    sx={styles.input}
                    value={url}
                    onChange={onChangeUrl}
                    placeholder="URL"
                    error={!!url && !isUrlValid}
                    helperText={url && !isUrlValid && polyglot.t('invalid_url')}
                    disabled={!!files.length}
                    label={polyglot.t('use_url')}
                    variant="standard"
                />
            </Box>

            <LoaderSelect
                loaders={loaders}
                setLoader={onChangeLoaderName}
                value={loaderName}
                disabled={files.length === 0 && (!url || !isUrlValid)}
            />
            <Button
                variant="contained"
                color="primary"
                className="btn-upload-dataset"
                sx={styles.button}
                disabled={
                    isUploading ||
                    (files.length === 0 && (!url || !isUrlValid)) ||
                    !loaderName
                }
                onClick={useUrlForUpload ? handleUrlAdded : handleFileUploaded}
                startIcon={<PublishIcon />}
            >
                {polyglot.t('upload_data')}
            </Button>

            <PopupConfirmUpload
                history={history}
                onConfirm={onConfirm}
                isOpen={isOpenPopupConfirm}
                setIsOpenPopupConfirm={setIsOpenPopupConfirm}
            />
        </Box>
    );
};

UploadComponent.propTypes = {
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
        location: PropTypes.object,
    }),
    className: PropTypes.string,
    error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
    url: PropTypes.string.isRequired,
    loaderName: PropTypes.string.isRequired,
    loaders: PropTypes.array,
    isUrlValid: PropTypes.bool,
    isUploading: PropTypes.bool,
    onChangeUrl: PropTypes.func.isRequired,
    onFileLoad: PropTypes.func.isRequired,
    onUrlUpload: PropTypes.func.isRequired,
    onChangeLoaderName: PropTypes.func.isRequired,
    p: polyglotPropTypes.isRequired,
    isFirstFile: PropTypes.bool,
};

UploadComponent.defaultProps = {
    className: null,
    isUrlValid: true,
    error: false,
};

const DroppingLoader = ({ text }) => {
    return (
        <Grid
            sx={styles.loader}
            container
            direction="column"
            alignItems="center"
            justifyContent="center"
        >
            <CircularProgress />
            <span>{text}</span>
        </Grid>
    );
};
DroppingLoader.propTypes = {
    text: PropTypes.string.isRequired,
};

UploadComponent.propTypes = {
    text: PropTypes.string,
};

const mapStateToProps = state => ({
    url: fromUpload.getUrl(state),
    isUrlValid: fromUpload.isUrlValid(state),
    isUploading: fromUpload.isUploadPending(state),
    loaderName: fromUpload.getLoaderName(state),
    loaders: fromLoaders.getLoaders(state),
});

const mapDispatchToProps = {
    onUrlUpload: uploadUrl,
    onFileLoad: uploadFile,
    onChangeUrl: e => changeUploadUrl(e.target.value),
    onChangeLoaderName: val =>
        changeLoaderName(Array.isArray(val) ? val[0] : val),
};

export default compose(
    translate,
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(UploadComponent);
