import { combineReducers } from 'redux';
import { reducer as form } from 'redux-form';
import { polyglotReducer as polyglot } from 'redux-polyglot';

import characteristic from '../characteristic';
import dataset from './dataset';
import exportReducer from './export';
import fetchReducer from '../fetch';
import i18n from '../i18n';
import fields from '../fields';
import resource from './resource';
import format from '../formats/reducer';
import user from '../user';
import searchReducer from './search/reducer';
import breadcrumb from './breadcrumb/reducer';
import menu from './menu/reducer';
import displayConfig from './displayConfig/reducer';

const rootReducer = combineReducers({
    characteristic,
    dataset,
    export: exportReducer,
    fetch: fetchReducer,
    form,
    i18n,
    polyglot,
    fields,
    resource,
    format,
    user,
    search: searchReducer,
    menu,
    breadcrumb,
    displayConfig,
});

export default rootReducer;
