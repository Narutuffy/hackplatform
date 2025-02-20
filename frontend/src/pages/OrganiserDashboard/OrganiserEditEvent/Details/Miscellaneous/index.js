import React from 'react';

import { Grid } from '@material-ui/core';
import { FastField } from 'formik';
import FormControl from 'components/inputs/FormControl';
import EventTagsForm from './EventTagsForm';

const OrganiserEditEventMisc = props => {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <FastField
                    name="tags"
                    render={({ field, form }) => (
                        <FormControl label="Tags" hint="Add tags with which you can mark registrations">
                            <EventTagsForm
                                value={field.value}
                                fieldName={field.name}
                                setFieldValue={form.setFieldValue}
                            />
                        </FormControl>
                    )}
                />
            </Grid>
        </Grid>
    );
};

export default OrganiserEditEventMisc;
