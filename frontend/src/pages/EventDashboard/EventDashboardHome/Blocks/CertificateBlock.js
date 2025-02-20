import React from 'react';

import { connect } from 'react-redux';
import moment from 'moment-timezone';
import { Grid, Box, CircularProgress } from '@material-ui/core';
import { PDFDownloadLink } from '@react-pdf/renderer';

import GradientBox from 'components/generic/GradientBox';
import { Typography } from '@material-ui/core';
import { RegistrationStatuses, EventHelpers } from '@hackjunction/shared';

import * as DashboardSelectors from 'redux/dashboard/selectors';
import * as UserSelectors from 'redux/user/selectors';

import Button from 'components/generic/Button';
import ParticipationCertificate from 'components/pdfs/ParticipationCertificate';

const CertificateBlock = ({ event, userProfile, registration, project, loading }) => {
    if (!event || !EventHelpers.isEventOver(event, moment)) return null;
    if (!registration || registration.status !== RegistrationStatuses.asObject.checkedIn.id);

    return (
        <Grid item xs={12}>
            <GradientBox p={3} color="theme_turquoise">
                <Typography variant="h4" gutterBottom>
                    Participation certificate
                </Typography>
                <Typography variant="body1" paragraph>
                    Thanks for being a part of {event.name}! While waiting for the next Junction event to take part in,
                    go ahead and download your personal certificate of participation by clicking the button below!
                </Typography>
                {loading ? (
                    <CircularProgress size={24} />
                ) : (
                    <PDFDownloadLink
                        document={
                            <ParticipationCertificate event={event} project={project} userProfile={userProfile} />
                        }
                        fileName={`certificate_${userProfile.firstName}_${userProfile.lastName}`}
                    >
                        <Button color="theme_white" variant="contained">
                            Download certificate
                        </Button>
                    </PDFDownloadLink>
                )}
            </GradientBox>
        </Grid>
    );
};

const mapState = state => ({
    event: DashboardSelectors.event(state),
    userProfile: UserSelectors.userProfile(state),
    project: DashboardSelectors.project(state),
    loading: DashboardSelectors.eventLoading(state) || DashboardSelectors.projectLoading(state)
});

export default connect(mapState)(CertificateBlock);
