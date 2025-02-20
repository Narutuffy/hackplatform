import React, { useMemo } from 'react';

import { connect } from 'react-redux';
import { groupBy, filter } from 'lodash-es';
import { RegistrationStatuses } from '@hackjunction/shared';
import { Grid, Paper, Typography } from '@material-ui/core';
import { withSnackbar } from 'notistack';
import StatusBadge from 'components/generic/StatusBadge';
import Statistic from 'components/generic/Statistic';
import PageWrapper from 'components/layouts/PageWrapper';
import * as OrganiserSelectors from 'redux/organiser/selectors';
import * as AuthSelectors from 'redux/auth/selectors';
import * as OrganiserActions from 'redux/organiser/actions';
import RegistrationsService from 'services/registrations';

const STATUSES = RegistrationStatuses.asObject;

const AdminPage = ({ registrations, updateRegistrations, loading, idToken, event, enqueueSnackbar }) => {
    const groupedByStatus = useMemo(() => {
        return groupBy(registrations, 'status');
    }, [registrations]);

    const getCount = (statuses = []) => {
        return statuses.reduce((res, status) => {
            if (groupedByStatus.hasOwnProperty(status)) {
                return res + groupedByStatus[status].length;
            }
            return res;
        }, 0);
    };

    const handleBulkAccept = () => {
        return RegistrationsService.bulkAcceptRegistrationsForEvent(idToken, event.slug)
            .then(data => {
                enqueueSnackbar('Success! All soft accepted registrations have been accepted.', { variant: 'success' });
            })
            .catch(err => {
                enqueueSnackbar("Something went wrong... Are you sure you're connected to the internet ?", {
                    variant: 'error'
                });
            })
            .finally(() => {
                updateRegistrations(event.slug);
                return;
            });
    };

    const handleBulkReject = () => {
        return RegistrationsService.bulkRejectRegistrationsForEvent(idToken, event.slug)
            .then(data => {
                enqueueSnackbar('Success! All soft rejected registrations have been rejected.', { variant: 'success' });
            })
            .catch(err => {
                enqueueSnackbar("Something went wrong... Are you sure you're connected to the internet ?", {
                    variant: 'success'
                });
            })
            .finally(() => {
                updateRegistrations(event.slug);
                return;
            });
    };

    const total = registrations.length;
    const rated = filter(registrations, reg => reg.rating).length;

    return (
        <PageWrapper loading={loading}>
            <Typography variant="h5" paragraph>
                Stats
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <Paper>
                        <Statistic label="Total registrations" value={total}></Statistic>
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Paper>
                        <Statistic label="Rated" value={`${rated} / ${total}`}></Statistic>
                    </Paper>
                </Grid>
                <Grid item xs={4}>
                    <Paper>
                        <Statistic
                            label={<StatusBadge status={STATUSES.confirmed.id} />}
                            value={getCount(['confirmed'])}
                        ></Statistic>
                    </Paper>
                </Grid>
                <Grid item xs={4}>
                    <Paper>
                        <Statistic
                            label={<StatusBadge status={STATUSES.accepted.id} />}
                            value={getCount(['accepted'])}
                        ></Statistic>
                    </Paper>
                </Grid>
                <Grid item xs={4}>
                    <Paper>
                        <Statistic
                            label={<StatusBadge status={STATUSES.cancelled.id} />}
                            value={getCount(['cancelled'])}
                        ></Statistic>
                    </Paper>
                </Grid>
                <Grid item xs={4}>
                    <Paper>
                        <Statistic
                            label={<StatusBadge status={STATUSES.rejected.id} />}
                            value={getCount(['rejected'])}
                        ></Statistic>
                    </Paper>
                </Grid>
                <Grid item xs={4}>
                    <Paper>
                        <Statistic
                            label={<StatusBadge status={STATUSES.checkedIn.id} />}
                            value={getCount(['checkedIn'])}
                        ></Statistic>
                    </Paper>
                </Grid>
                <Grid item xs={4}>
                    <Paper>
                        <Statistic
                            label={<StatusBadge status={STATUSES.noShow.id} />}
                            value={getCount(['noShow'])}
                        ></Statistic>
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Paper>
                        <Statistic
                            label={<StatusBadge status={STATUSES.softAccepted.id} />}
                            value={getCount(['softAccepted'])}
                            action={handleBulkAccept}
                            actionText="Accept all"
                        ></Statistic>
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Paper>
                        <Statistic
                            label={<StatusBadge status={STATUSES.softRejected.id} />}
                            value={getCount(['softRejected'])}
                            action={handleBulkReject}
                            actionText="Reject all"
                        ></Statistic>
                    </Paper>
                </Grid>
            </Grid>
        </PageWrapper>
    );
};

const mapState = state => ({
    registrations: OrganiserSelectors.registrations(state),
    event: OrganiserSelectors.event(state),
    idToken: AuthSelectors.getIdToken(state),
    loading: OrganiserSelectors.registrationsLoading(state)
});

const mapDispatch = dispatch => ({
    updateRegistrations: slug => dispatch(OrganiserActions.updateRegistrationsForEvent(slug))
});

export default withSnackbar(
    connect(
        mapState,
        mapDispatch
    )(AdminPage)
);
