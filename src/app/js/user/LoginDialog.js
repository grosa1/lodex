import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import translate from 'redux-polyglot/translate';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { submit as submitAction, isSubmitting } from 'redux-form';

import { polyglot as polyglotPropTypes } from '../lib/propTypes';
import { login as loginAction, toggleLogin as toggleLoginAction, LOGIN_FORM_NAME } from './';
import LoginForm from './LoginForm';
import ButtonWithStatus from '../lib/ButtonWithStatus';

export const LoginDialog = ({ login, p: polyglot, showModal, submit, submitting, toggleLogin }) => (
    <Dialog
        className="dialog-login"
        title="Sign in"
        actions={[
            <FlatButton
                label={polyglot.t('Cancel')}
                onTouchTap={toggleLogin}
            />,
            <ButtonWithStatus
                label={polyglot.t('Sign in')}
                loading={submitting}
                onTouchTap={submit}
            />,
        ]}
        modal
        open={showModal}
        onRequestClose={toggleLogin}
    >
        <LoginForm onSubmit={login} />
    </Dialog>
);

LoginDialog.propTypes = {
    showModal: PropTypes.bool.isRequired,
    login: PropTypes.func.isRequired,
    p: polyglotPropTypes.isRequired,
    submit: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    toggleLogin: PropTypes.func.isRequired,
};

export const mapStateToProps = state => ({
    showModal: state.user.showModal,
    submitting: isSubmitting(LOGIN_FORM_NAME)(state),
});

export const mapDispatchToProps = dispatch => bindActionCreators({
    login: values => loginAction(values),
    submit: () => submitAction(LOGIN_FORM_NAME),
    toggleLogin: toggleLoginAction,
}, dispatch);

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    translate,
)(LoginDialog);
