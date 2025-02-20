import React, { useCallback, useState } from 'react';
import { connect } from 'react-redux';
import { Grid, Typography, Box } from '@material-ui/core';
import { Rating } from '@material-ui/lab';

import Button from 'components/generic/Button';
import TextInput from 'components/inputs/TextInput';
import EventTagsSelect from 'components/inputs/EventTagsSelect';
import OrganiserSelectModal from 'components/modals/OrganiserSelectModal';
import RegistrationStatusSelect from 'components/inputs/RegistrationStatusSelect';

import * as OrganiserSelectors from 'redux/organiser/selectors';

import { useFormField } from 'hooks/formHooks';

const EditRegistrationActions = ({ registration, event, organisers, organisersMap, onSubmit, onCancel }) => {
    const [organiserModalOpen, setOrganiserModalOpen] = useState(false);
    const rating = useFormField(registration.rating);
    const assignedTo = useFormField(registration.assignedTo);
    const tags = useFormField(registration.tags);
    const status = useFormField(registration.status);
    const travelGrant = useFormField(registration.travelGrant);

    const formFields = [rating, assignedTo, tags, status, travelGrant];
    const formValues = {
        rating: rating.value,
        assignedto: assignedTo.value,
        tags: tags.value,
        status: status.value,
        travelGrant: travelGrant.value
    };
    const formDirty = formFields.map(field => field.dirty).indexOf(true) !== -1;

    const handleSubmit = useCallback(() => {
        const errors = formFields
            .map(field => {
                return field.validate();
            })
            .filter(err => typeof err !== 'undefined');

        if (errors.length > 0) {
            return;
        }

        onSubmit(formValues);
    }, [formFields, formValues, onSubmit]);

    const renderAssignedTo = () => {
        if (assignedTo.value) {
            const user = organisersMap[assignedTo.value];
            return user ? `${user.firstName} ${user.lastName}` : '???';
        }
        return 'No one';
    };

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Box pt={3}>
                    <Typography variant="h5">Edit registration</Typography>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="subtitle1">Rating</Typography>
                <Rating name="disabled" value={rating.value} onChange={(e, value) => rating.setValue(value)} />
            </Grid>
            <Grid item xs={12}>
                <Typography variant="subtitle1">Assigned to</Typography>
                <Typography variant="subtitle2">{renderAssignedTo()}</Typography>
                <OrganiserSelectModal
                    open={organiserModalOpen}
                    onClose={() => setOrganiserModalOpen(false)}
                    onClear={() => assignedTo.setValue()}
                    onSelect={({ userId }) => assignedTo.setValue(userId)}
                />
            </Grid>
            <Grid item xs={12}>
                <Typography variant="subtitle1">Tags</Typography>
                <EventTagsSelect value={tags.value} onChange={tags.setValue} tags={event.tags} />
            </Grid>
            <Grid item xs={12}>
                <Typography variant="subtitle1">Status</Typography>
                <RegistrationStatusSelect allowRestricted value={status.value} onChange={status.setValue} />
            </Grid>
            <Grid item xs={12}>
                <TextInput
                    label="Travel grant amount (EUR)"
                    helperText="Enter 0 to reject travel grant. If the participant previously had no travel grant value, entering a value will trigger an email notification."
                    type="number"
                    value={travelGrant.value}
                    onChange={travelGrant.setValue}
                />
            </Grid>
            <Grid item xs={12}>
                <Box display="flex" flexDirection="row" justifyContent="flex-end">
                    <Button onClick={onCancel}>Cancel</Button>
                    <Button color="primary" variant="contained" onClick={handleSubmit} disabled={!formDirty}>
                        Save changes
                    </Button>
                </Box>
            </Grid>
        </Grid>
    );
};

const mapState = state => ({
    event: OrganiserSelectors.event(state),
    organisers: OrganiserSelectors.organisers(state),
    organisersMap: OrganiserSelectors.organisersMap(state)
});

export default connect(mapState)(EditRegistrationActions);
