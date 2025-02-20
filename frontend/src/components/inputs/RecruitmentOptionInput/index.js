import React, { useCallback } from 'react';

import { Misc } from '@hackjunction/shared';
import { Grid, Typography } from '@material-ui/core';

import Select from 'components/inputs/Select';
import BooleanInput from 'components/inputs/BooleanInput';

const STATUS_OPTIONS = Misc.recruitmentStatuses.asArray.map(({ id, label }) => ({
    value: id,
    label
}));

const RELOCATION_OPTIONS = Misc.relocationOptions.asArray.map(({ id, label }) => ({
    value: id,
    label
}));

const RecruitmentOptionInput = ({ value = {}, onChange, onBlur, autoFocus }) => {
    const handleChange = useCallback(
        (field, fieldValue) => {
            if (field === 'status' && fieldValue === 'not-interested') {
                onChange({
                    ...value,
                    status: fieldValue,
                    consent: false,
                    relocation: undefined
                });
            } else {
                onChange({
                    ...value,
                    [field]: fieldValue
                });
            }
        },
        [onChange, value]
    );

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="body1" gutterBottom>
                    What is your current professional situation?
                </Typography>
                <Select
                    autoFocus={autoFocus}
                    placeholder="Choose one"
                    value={value.status}
                    onChange={status => handleChange('status', status)}
                    onBlur={onBlur}
                    options={STATUS_OPTIONS}
                />
            </Grid>
            {value.status &&
                value.status !== 'not-interested' && [
                    <Grid item xs={12}>
                        <Typography variant="body1">
                            Cool! Can our partners contact you regarding job opportunities they have?
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                            This means that relevant recruitment information about you (ex. contact info, education,
                            skills and other cv information) will be visible to select Junction partners representatives
                            who are looking to hire. You can also choose to opt out of this later.
                        </Typography>
                        <BooleanInput value={value.consent} onChange={consent => handleChange('consent', consent)} />
                    </Grid>,
                    <Grid item xs={12}>
                        <Typography variant="body1" gutterBottom>
                            Would you consider relocating to another country for work as a possibility?
                        </Typography>
                        <Select
                            placeholder="Choose one"
                            value={value.relocation}
                            onChange={relocation => handleChange('relocation', relocation)}
                            options={RELOCATION_OPTIONS}
                        />
                    </Grid>
                ]}
        </Grid>
    );
};

export default RecruitmentOptionInput;
