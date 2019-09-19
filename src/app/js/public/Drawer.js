import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import memoize from 'lodash.memoize';

import stylesToClassname from '../lib/stylesToClassName';

const styles = stylesToClassname(
    {
        drawer: {
            zIndex: 1001,
            position: 'absolute',
            top: '100vh',
            left: '0px',
            width: 'calc(100vw - 15px)',
            height: '100vh',
            overflowY: 'auto',
            backgroundColor: 'white',
            borderTop: '1px solid #E3EAF2',
            '@media (min-width: 768px)': {
                maxWidth: '750px',
                left: 'calc(50% - (750px / 2))',
            },
            '@media (min-width: 992px)': {
                maxWidth: '970px',
                left: 'calc(50% - (970px / 2))',
            },
            '@media (min-width: 1200px)': {
                maxWidth: '1170px',
                left: 'calc(50% - (1170px / 2))',
            },
        },
        drawerOpen: {
            boxShadow: '0 2px 1rem #777',
            height: '100vh',
            top: '10vh',
        },
        drawerClosing: {
            height: '100vh',
            top: '100vh',
        },
        drawerClosed: {
            height: '0vh',
            top: '100vh',
        },
        drawerDisabled: {
            filter: 'brightness(0.98)',
        },
        mask: {
            zIndex: 1000,
            position: 'absolute',
            bottom: '0px',
            left: '0px',
            height: '0vh',
            width: 'calc(100vw - 15px)',
            backgroundColor: 'black',
            opacity: '0',
            pointerEvents: 'none',
            transition: 'opacity 300ms ease-in-out',
        },
        maskOpen: {
            height: '100vh',
            opacity: '.3',
            pointerEvents: 'auto',
        },
    },
    'drawer',
);

const buildDrawerAnimationStyles = memoize(({ animationDuration }) => ({
    transition: `top ${animationDuration}ms`,
    transitionTimingFunction: 'ease-in-out',
}));

const Drawer = ({ children, status, animationDuration, onClose, disabled }) => {
    const drawerStyle = buildDrawerAnimationStyles({
        animationDuration,
    });

    return (
        <>
            <div
                className={classnames('drawer', styles.drawer, {
                    [styles.drawerOpen]: status === 'open' && !disabled,
                    [styles.drawerClosed]: status === 'closed',
                    [styles.drawerDisabled]: disabled,
                })}
                style={drawerStyle}
            >
                {status !== 'closed' && children}
            </div>
            <div
                className={classnames('mask', styles.mask, {
                    [styles.maskOpen]: status === 'open' && !disabled,
                })}
                onClick={onClose}
            />
        </>
    );
};

Drawer.propTypes = {
    children: PropTypes.node.isRequired,
    status: PropTypes.oneOf(['open', 'closing', 'closed']).isRequired,
    onClose: PropTypes.func.isRequired,
    animationDuration: PropTypes.number.isRequired,
    disabled: PropTypes.bool,
};

Drawer.defaultProps = {
    disabled: false,
};

export default Drawer;
