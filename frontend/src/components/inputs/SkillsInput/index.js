import React, { useCallback, useState, useRef } from 'react';
import {
    Grid,
    Typography,
    Button,
    Box,
    FormControlLabel,
    RadioGroup,
    Radio,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider
} from '@material-ui/core';
import { Skills } from '@hackjunction/shared';
import { find } from 'lodash-es';
import { withSnackbar } from 'notistack';
import { makeStyles } from '@material-ui/core/styles';
import Select from 'components/inputs/Select';

const useStyles = makeStyles(theme => ({
    radioGroup: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap'
    }
}));

const SkillsInput = React.memo(({ value = [], onChange, onBlur, autoFocus, enqueueSnackbar }) => {
    const classes = useStyles();
    const selectEl = useRef(null);
    const [level, setLevel] = useState();
    const [skill, setSkill] = useState();

    const handleLevelChange = useCallback(event => {
        setLevel(event.target.value);
    }, []);

    const handleAdd = useCallback(() => {
        const item = { skill, level };

        if (find(value, item => item.skill === skill)) {
            enqueueSnackbar(`You've already added ${skill}`, { variant: 'warning' });
            return;
        }
        onChange(value.concat(item));
        setLevel(undefined);
        setSkill(undefined);
        selectEl.current.focus();
    }, [skill, level, value, onChange, enqueueSnackbar]);

    const handleRemove = useCallback(
        index => {
            onChange(
                value.filter((item, idx) => {
                    return index !== idx;
                })
            );
        },
        [value, onChange]
    );

    const buttonDisabled = !level || !skill;

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Select
                    autoFocus={autoFocus}
                    onBlur={onBlur}
                    innerRef={selectEl}
                    label="Choose a skill"
                    placeholder="Type to search for skills"
                    options="skill"
                    value={skill}
                    onChange={setSkill}
                />
            </Grid>
            <Grid item xs={4}>
                <Typography variant="subtitle1">Level of expertise</Typography>
            </Grid>
            <Grid item xs={8}>
                <RadioGroup
                    className={classes.radioGroup}
                    aria-label="Level of expertise"
                    value={level}
                    onChange={handleLevelChange}
                >
                    {Skills.skillLevelLabelsArray.map((label, index) => (
                        <FormControlLabel
                            key={label}
                            value={`${index + 1}`}
                            control={<Radio color="primary" />}
                            label={label}
                            labelPlacement="left"
                        />
                    ))}
                </RadioGroup>
            </Grid>
            <Grid item xs={12}>
                <Box display="flex" flexDirection="row" justifyContent="flex-end">
                    <Button onClick={handleAdd} disabled={buttonDisabled} color="primary" variant="contained">
                        Add
                    </Button>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <List>
                    {value.map(({ skill, level }, index) => [
                        <Divider key={skill + '-divider'} />,
                        <ListItem key={skill}>
                            <ListItemText
                                primary={
                                    <Typography>
                                        {skill} ({Skills.getLabelForSkillLevel(level)})
                                    </Typography>
                                }
                                secondary={
                                    <Typography color="textSecondary" style={{ marginRight: '50px' }}>
                                        {Skills.getDescriptionForSkillLevel(level)}
                                    </Typography>
                                }
                            />
                            <ListItemSecondaryAction>
                                <Button onClick={() => handleRemove(index)} color="error">
                                    Remove
                                </Button>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ])}
                </List>
            </Grid>
        </Grid>
    );
});

export default withSnackbar(SkillsInput);
