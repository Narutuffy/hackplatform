import React, { useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { RegistrationFields } from '@hackjunction/shared';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Grid } from '@material-ui/core';
import { Formik, FastField } from 'formik';
import * as yup from 'yup';
import { connect } from 'react-redux';

import * as UserSelectors from 'redux/user/selectors';
import * as AuthSelectors from 'redux/auth/selectors';
import * as EventDetailSelectors from 'redux/eventdetail/selectors';
import RegistrationQuestion from '../RegistrationQuestion';
import RegistrationBottomBar from '../RegistrationBottomBar';

const useStyles = makeStyles(theme => ({
    wrapper: {
        backgroundColor: 'transparent',
        padding: 0
    },
    question: {
        backgroundColor: 'white',
        marginTop: '1px',
        padding: theme.spacing(3),
        transition: 'all 0.2s ease',
        '&:focus-within': {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2)
        }
    },
    questionInner: {
        opacity: 0.6,
        '&:focus-within': {
            opacity: 1
        }
    }
}));

const RegistrationSection = props => {
    const {
        fields,
        onNext,
        nextLabel,
        prevLabel,
        onPrev,
        data,
        userProfile,
        registration,
        idTokenData,
        isActive
    } = props;
    const classes = useStyles({ isActive });
    const mainRef = useRef(null);

    const { validationSchema, initialValues } = useMemo(() => {
        return fields.reduce(
            (result, field) => {
                const fieldParams = RegistrationFields.getField(field.fieldName);

                if (fieldParams) {
                    result.validationSchema[field.fieldName] = fieldParams.validationSchema(field.require);
                    if (registration && registration.answers && registration.answers[field.fieldName]) {
                        result.initialValues[field.fieldName] = registration.answers[field.fieldName];
                    } else {
                        result.initialValues[field.fieldName] = fieldParams.default(userProfile, idTokenData);
                    }
                }

                if (data.hasOwnProperty(field.fieldName)) {
                    result.initialValues[field.fieldName] = data[field.fieldName];
                }

                return result;
            },
            {
                validationSchema: {},
                initialValues: {}
            }
        );
    }, [fields, userProfile, idTokenData, data, registration]);

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={props => {
                return yup.lazy(values => {
                    return yup.object().shape(validationSchema);
                });
            }}
            onSubmit={(values, actions) => {
                onNext(values);
            }}
        >
            {({ handleSubmit, handleChange, handleBlur, values, errors, dirty }) => (
                <Box display="flex" flexDirection="column" ref={mainRef}>
                    <Box p={2} className={classes.wrapper}>
                        <Grid container spacing={0}>
                            {fields.map((field, index) => (
                                <Grid item xs={12} key={field.fieldName} className={classes.question}>
                                    <div className={classes.questionInner}>
                                        <FastField
                                            autoFocus={index === 0}
                                            name={field.fieldName}
                                            component={RegistrationQuestion}
                                            config={field.fieldConfig}
                                            required={field.require}
                                        />
                                    </div>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                    {ReactDOM.createPortal(
                        <RegistrationBottomBar
                            prevLabel={prevLabel}
                            onPrev={onPrev}
                            nextLabel={nextLabel}
                            onNext={handleSubmit}
                            errors={errors}
                            dirty={dirty}
                        />,
                        document.body
                    )}
                </Box>
            )}
        </Formik>
    );
};

const mapStateToProps = state => ({
    userProfile: UserSelectors.userProfile(state),
    idTokenData: AuthSelectors.idTokenData(state),
    registration: EventDetailSelectors.registration(state),
    hasRegistration: EventDetailSelectors.hasRegistration(state)
});

export default connect(mapStateToProps)(RegistrationSection);
