import React from 'react';
import { connect } from 'react-redux';

import * as OrganiserSelectors from 'redux/organiser/selectors';
import * as FilterUtils from 'utils/filters';

import Divider from 'components/generic/Divider';
import AttendeeTable from 'components/tables/AttendeeTable';
import AttendeeFilters from './AttendeeFilters';

const SearchAttendeesPage = ({ registrations, registrationsLoading, filters }) => {
    const filtered = FilterUtils.applyFilters(registrations, filters);
    return (
        <React.Fragment>
            <AttendeeFilters />
            <Divider size={1} />
            <AttendeeTable attendees={filtered} loading={registrationsLoading} />
        </React.Fragment>
    );
};

const mapState = state => ({
    registrations: OrganiserSelectors.registrationsFiltered(state),
    registrationsLoading: OrganiserSelectors.registrationsLoading(state),
    filters: OrganiserSelectors.registrationsFilters(state)
});

export default connect(mapState)(SearchAttendeesPage);
