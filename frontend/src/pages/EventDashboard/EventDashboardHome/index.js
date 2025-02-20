import React from 'react';

import { connect } from 'react-redux';
import { Box, Grid } from '@material-ui/core';

import PageHeader from 'components/generic/PageHeader';
import * as DashboardSelectors from 'redux/dashboard/selectors';

import RegistrationStatusBlock from './Blocks/RegistrationStatusBlock';
import ProjectBlock from './Blocks/ProjectBlock';
import TeamStatusBlock from './Blocks/TeamStatusBlock';
import VisaInvitationBlock from './Blocks/VisaInvitationBlock';
import TravelGrantStatusBlock from './Blocks/TravelGrantStatusBlock';
import GavelReviewingBlock from './Blocks/GavelReviewingBlock';
import PartnerReviewingBlock from './Blocks/PartnerReviewingBlock';
import ReviewingPeriodBlock from './Blocks/ReviewingPeriodBlock';
import CertificateBlock from './Blocks/CertificateBlock';
import EventOverBlock from './Blocks/EventOverBlock';

// const useStyles = makeStyles(theme => ({
//     stepper: {
//         backgroundColor: 'transparent'
//     }
// }));

const EventDashboardHome = ({ event, registration, loading }) => {
    //TODO: Re-add quick links at a later time
    return (
        <Box>
            <PageHeader heading="Dashboard" />
            <Box mt={2} />
            {/* <QuickLinks /> */}
            <Grid container spacing={5}>
                <EventOverBlock />
                <CertificateBlock />
                <ReviewingPeriodBlock />
                <RegistrationStatusBlock />
                <TravelGrantStatusBlock />
                <VisaInvitationBlock />
                <ProjectBlock />
                <TeamStatusBlock />
                <GavelReviewingBlock />
                <PartnerReviewingBlock />
            </Grid>
        </Box>
    );
};

const mapStateToProps = state => ({
    event: DashboardSelectors.event(state),
    registration: DashboardSelectors.registration(state),
    loading: DashboardSelectors.registrationLoading(state) || DashboardSelectors.eventLoading(state)
});

export default connect(mapStateToProps)(EventDashboardHome);
