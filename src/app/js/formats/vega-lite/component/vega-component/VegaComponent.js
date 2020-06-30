import { Vega } from 'react-vega';
import React from 'react';

export default function CustomActionVega(props) {
    let actions = {
        export: {
            svg: true,
            png: true,
        },
        source: false,
        compiled: false,
        editor: false,
    };
    return <Vega {...props} actions={actions} mode="vega" />;
}
