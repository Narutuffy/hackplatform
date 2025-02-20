import React from 'react';
import { connect } from 'react-redux';
import { RegistrationFields } from '@hackjunction/shared';
import { groupBy, find } from 'lodash-es';
import { ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Typography, Grid } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import DescriptionItem from 'components/generic/DescriptionItem';
import * as OrganiserSelectors from 'redux/organiser/selectors';

const EditRegistrationContent = React.memo(({ registration, event }) => {
    const fields = Object.keys(registration.answers);
    const grouped = groupBy(fields, field => RegistrationFields.getCategory(field));
    const categoryNames = Object.keys(grouped).filter(key => key !== '');

    return (
        <React.Fragment>
            {categoryNames.map(name => (
                <ExpansionPanel key={name}>
                    <ExpansionPanelSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`${name}-content`}
                        id={`${name}-header`}
                    >
                        <Typography>{name}</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <Grid container spacing={3}>
                            {grouped[name].map(field => {
                                let label = RegistrationFields.fieldToLabelMap[field];
                                if (!label) {
                                    const customField = find(event.registrationQuestions, f => f.name === field);
                                    if (customField) {
                                        label = customField.label;
                                    }
                                }
                                return (
                                    <DescriptionItem
                                        title={label}
                                        content={registration.answers[field]}
                                        fieldName={field}
                                    />
                                );
                            })}
                        </Grid>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            ))}
            {event.customQuestions.map(section => {
                const sectionAnswers = registration.answers[section.name] || {};
                return (
                    <ExpansionPanel key={section.name}>
                        <ExpansionPanelSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`${section.name}-content`}
                            id={`${section.name}-header`}
                        >
                            <Typography>{section.label}</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <Grid container spacing={3}>
                                {section.questions.map(question => {
                                    return (
                                        <DescriptionItem
                                            title={question.label}
                                            content={sectionAnswers[question.name]}
                                        />
                                    );
                                })}
                            </Grid>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                );
            })}
        </React.Fragment>
    );
});

const mapState = state => ({
    event: OrganiserSelectors.event(state)
});

export default connect(mapState)(EditRegistrationContent);
