import { getUserLocalStorageInfo } from '../../admin/api/tools';
import fetch from '../../lib/fetch';
import { getExportPDFRequest } from '../../user';

const exportPDF = async maxExportPDFSize => {
    const { token } = getUserLocalStorageInfo();

    // get local language
    const locale = window.navigator.language;

    const request = getExportPDFRequest({ token }, locale, maxExportPDFSize);
    return fetch(request, 'blob').then(({ response, error }) => {
        if (error) {
            return error;
        }
        return response;
    });
};

export default {
    exportPDF,
};
