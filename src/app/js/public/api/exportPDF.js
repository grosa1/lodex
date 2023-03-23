import { getUserLocalStorageInfo } from '../../admin/api/tools';
import fetch from '../../lib/fetch';
import { getExportPDFRequest } from '../../user';

const exportPDF = async options => {
    const { token } = getUserLocalStorageInfo();

    // get local language
    const locale = window.navigator.language;

    // set facets for url query
    options.facets = encodeURIComponent(JSON.stringify(options.facets));

    const request = getExportPDFRequest({ token }, { locale, ...options });
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