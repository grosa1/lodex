import { createAction, handleActions, combineActions } from 'redux-actions';

export const UPLOAD_FILE = 'UPLOAD_FILE';
export const UPLOAD_URL = 'UPLOAD_URL';
export const UPLOAD_ERROR = 'UPLOAD_ERROR';
export const UPLOAD_SUCCESS = 'UPLOAD_SUCCESS';
export const OPEN_UPLOAD = 'OPEN_UPLOAD';
export const CLOSE_UPLOAD = 'CLOSE_UPLOAD';
export const OPEN_UPLOAD_POPUP = 'OPEN_UPLOAD_POPUP';
export const CLOSE_UPLOAD_POPUP = 'CLOSE_UPLOAD_POPUP';
export const CHANGE_UPLOAD_URL = 'CHANGE_UPLOAD_URL';
export const CHANGE_LOADER_NAME = 'CHANGE_LOADER_NAME';

export const uploadFile = createAction(UPLOAD_FILE);
export const uploadUrl = createAction(UPLOAD_URL);
export const uploadSuccess = createAction(UPLOAD_SUCCESS);
export const uploadError = createAction(UPLOAD_ERROR);
export const openUpload = createAction(OPEN_UPLOAD);
export const closeUpload = createAction(CLOSE_UPLOAD);
export const changeUploadUrl = createAction(CHANGE_UPLOAD_URL);
export const changeLoaderName = createAction(CHANGE_LOADER_NAME);
export const openUploadPopup = createAction(OPEN_UPLOAD_POPUP);
export const closeUploadPopup = createAction(CLOSE_UPLOAD_POPUP);

const validateUrl = url =>
    url && (url.startsWith('http://') || url.startsWith('https://'));

export const defaultState = {
    error: false,
    status: 'NONE',
    open: false,
    isUrlValid: false,
    url: '',
    loaderName: 'automatic',
};

export default handleActions(
    {
        [combineActions(UPLOAD_FILE, UPLOAD_URL)]: (state, { payload }) =>
            payload
                ? {
                      ...state,
                      error: false,
                      open: false,
                      status: 'PENDING',
                      openPopup: false,
                  }
                : state,
        UPLOAD_SUCCESS: state => ({
            ...state,
            status: 'SUCCESS',
        }),
        UPLOAD_ERROR: (state, { payload }) => ({
            ...state,
            status: 'ERROR',
            error: payload.message,
        }),
        OPEN_UPLOAD: state => ({
            ...state,
            open: true,
        }),
        CLOSE_UPLOAD: state => ({
            ...state,
            open: false,
        }),
        OPEN_UPLOAD_POPUP: state => ({
            ...state,
            openPopup: true,
        }),
        CLOSE_UPLOAD_POPUP: state => ({
            ...state,
            openPopup: false,
        }),
        CHANGE_UPLOAD_URL: (state, { payload: url }) => ({
            ...state,
            url,
            validUrl: validateUrl(url),
        }),
        CHANGE_LOADER_NAME: (state, { payload: loaderName }) => ({
            ...state,
            loaderName,
        }),
    },
    defaultState,
);

export const getUpload = state => state;
export const isUploadPending = state => state.status === 'PENDING';
export const isOpen = state => state.open;
export const getUrl = ({ url }) => url;
export const getLoaderName = ({ loaderName }) => loaderName;
export const isUrlValid = ({ validUrl }) => validUrl;
export const isOpenPopup = state => state.openPopup;


export const selectors = {
    getUpload,
    isUploadPending,
    isOpen,
    getUrl,
    getLoaderName,
    isUrlValid,
    isOpenPopup,
};
