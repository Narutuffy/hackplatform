import { isEmpty } from 'lodash-es';

export const hasProfile = state => !isEmpty(state.user.profile);
export const userProfile = state => state.user.profile;
export const userProfileLoading = state => state.user.profileLoading;
export const userProfileError = state => state.user.profileError;
export const registrations = state => state.user.registrations;
export const registrationsLoading = state => state.user.registrationsLoading;
export const registrationsError = state => state.user.registrationsError;
