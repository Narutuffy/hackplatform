import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';

import { CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { CloudinaryContext } from 'cloudinary-react';
import { SnackbarProvider } from 'notistack';
import WebFont from 'webfontloader';

import configureStore, { history } from 'redux/configureStore';
import config from 'constants/config';
import theme from './material-ui-theme';

const { store, persistor } = configureStore();

/** Disable log statements in production */
function noop() {}
if (process.env.NODE_ENV !== 'development') {
    console.log = noop;
    console.warn = noop;
    console.error = noop;
}

WebFont.load({
    google: {
        families: ['Montserrat:400,400i,700,700i', 'Lato:400,400i,700,700i']
    }
});

ReactDOM.render(
    <Provider store={store}>
        <PersistGate loading={<div className="Preload" />} persistor={persistor}>
            <CloudinaryContext includeOwnBody={true} cloudName={config.CLOUDINARY_CLOUD_NAME}>
                <ThemeProvider theme={theme}>
                    <SnackbarProvider
                        maxSnack={3}
                        autoHideDuration={1000}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right'
                        }}
                    >
                        <CssBaseline />
                        <App history={history} />
                    </SnackbarProvider>
                </ThemeProvider>
            </CloudinaryContext>
        </PersistGate>
    </Provider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
