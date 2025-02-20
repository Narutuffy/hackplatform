import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1
    },
    label: {
        fontWeight: 'bold',

        fontSize: '1.1rem'
    },
    hint: ({ hasError }) => ({
        marginTop: theme.spacing(0.5),
        color: hasError ? theme.palette.error.main : theme.palette.text.primary
    })
}));

const FormControl = ({ label, hint, touched, error, children }) => {
    const hasError = touched && error;
    const classes = useStyles({ hasError });

    const renderHintOrError = () => {
        if (!touched || !error) {
            return hint;
        }

        if (typeof error === 'string') {
            return error;
        }

        if (Object.keys(error).length > 0) {
            return Object.keys(error)
                .map(key => {
                    return error[key];
                })
                .join(', ');
        }

        return hint;
    };

    return (
        <Box className={classes.wrapper}>
            <Typography className={classes.label} variant="h6">
                {label}
            </Typography>
            <Typography className={classes.hint} variant="subtitle2" paragraph>
                {renderHintOrError()}
            </Typography>
            {children}
        </Box>
    );
};

export default FormControl;
