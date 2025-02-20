import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { sortBy } from 'lodash-es';
import { List, ListItem, ListItemText, Menu, MenuItem, Paper, Box, Divider } from '@material-ui/core';

import FilterForm from './FilterForm';
import FilterList from './FilterList';
import FilterSaveForm from './FilterSaveForm';

import * as OrganiserSelectors from 'redux/organiser/selectors';

const useStyles = makeStyles(theme => ({
    root: {}
}));

const FilterGroupMenu = ({
    onChange = () => {},
    onSelectedChange = () => {},
    event,
    filterGroups,
    showEdit = true
}) => {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const [selected, setSelected] = useState();
    const [filters, setFilters] = useState([]);

    useEffect(() => {
        if (selected) {
            setFilters(selected.filters);
        } else {
            setFilters([]);
        }
    }, [selected]);

    useEffect(() => {
        onSelectedChange(selected);
    }, [selected, onSelectedChange]);

    useEffect(() => {
        onChange(filters);
    }, [filters, onChange]);

    const handleFilterAdd = useCallback(
        filter => {
            setFilters(filters.concat(filter));
        },
        [filters]
    );

    const handleClickListItem = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuItemClick = option => {
        if (option.isDefault) {
            setSelected();
        } else {
            setSelected(option);
        }
        setAnchorEl(null);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const options = useMemo(() => {
        let items = [
            {
                label: 'All participants',
                description: 'No filters',
                filters: [],
                isDefault: true
            }
        ];

        if (showEdit) {
            items.push({
                label: 'New filters',
                description: 'Apply a set of custom filters',
                filters: [],
                isAdd: true
            });
        }

        items = items.concat(sortBy(filterGroups, 'label'));

        return items;
    }, [filterGroups, showEdit]);

    const activeItem = selected || options[0];
    const reservedLabels = options.map(option => option.label);

    return (
        <Paper className={classes.root}>
            <List component="nav" aria-label="Selected filter group">
                <ListItem
                    button
                    aria-haspopup="true"
                    aria-controls="lock-menu"
                    aria-label="when device is locked"
                    onClick={handleClickListItem}
                >
                    <ListItemText primary={activeItem.label} secondary={activeItem.description} />
                </ListItem>
            </List>
            <Menu id="lock-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                {options.map((option, index) => {
                    let items = [];
                    if (index !== 0) {
                        items.push(<Divider key={option.label + 'divider'} />);
                    }
                    items.push(
                        <MenuItem
                            key={option.label}
                            selected={option.label === activeItem.label}
                            onClick={() => handleMenuItemClick(option)}
                        >
                            <ListItemText
                                primary={option.label}
                                secondary={option.isAdd || option.isDefault ? option.description : ''}
                            />
                        </MenuItem>
                    );
                    return items;
                })}
            </Menu>
            {showEdit && !activeItem.isDefault && (
                <Box p={2}>
                    <FilterForm onSubmit={handleFilterAdd} />
                    <FilterList
                        activeItemKey={activeItem ? activeItem.label : null}
                        filters={filters}
                        onChange={setFilters}
                    />
                    <FilterSaveForm
                        filters={filters}
                        activeItem={activeItem}
                        reservedLabels={reservedLabels}
                        onSave={setSelected}
                        onDelete={setSelected}
                    />
                </Box>
            )}
        </Paper>
    );
};

const mapState = state => ({
    filterGroups: OrganiserSelectors.filterGroups(state),
    event: OrganiserSelectors.event(state)
});

export default connect(mapState)(FilterGroupMenu);
