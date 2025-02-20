import React, { useCallback, useEffect, useState } from 'react';

import { connect } from 'react-redux';
import { Box, Typography, IconButton, CircularProgress } from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

import { useDebounce } from 'hooks/customHooks';

import * as RecruitmentSelectors from 'redux/recruitment/selectors';
import * as RecruitmentActions from 'redux/recruitment/actions';

const Pagination = ({ currentPage, pageSize, totalResults, totalPages, setPage, loading }) => {
    const [_currentPage, _setCurrentPage] = useState(currentPage);
    const debouncedPage = useDebounce(_currentPage, 200);

    const handlePageChange = useCallback(
        page => {
            setPage(page);
        },
        [setPage]
    );

    useEffect(() => {
        _setCurrentPage(currentPage);
    }, [currentPage]);

    useEffect(() => {
        handlePageChange(debouncedPage);
    }, [debouncedPage, handlePageChange]);

    const handlePrevPage = useCallback(() => {
        _setCurrentPage(_currentPage - 1);
    }, [_currentPage]);

    const handleNextPage = useCallback(() => {
        _setCurrentPage(_currentPage + 1);
    }, [_currentPage]);

    return (
        <Box display="flex" flexDirection="row" alignItems="center">
            <IconButton disabled={_currentPage === 0} onClick={handlePrevPage}>
                <ChevronLeftIcon />
            </IconButton>
            <Box padding={1}>
                {totalResults === 0 && loading ? (
                    <CircularProgress size={24} />
                ) : (
                    <Typography variant="overline">
                        Page {_currentPage + 1} of {totalPages}
                    </Typography>
                )}
            </Box>
            <IconButton disabled={_currentPage + 1 === totalPages} onClick={handleNextPage}>
                <ChevronRightIcon />
            </IconButton>
        </Box>
    );
};

const mapState = state => ({
    currentPage: RecruitmentSelectors.page(state),
    totalPages: RecruitmentSelectors.pageCount(state),
    totalResults: RecruitmentSelectors.searchResultsCount(state),
    pageSize: RecruitmentSelectors.pageSize(state),
    loading: RecruitmentSelectors.searchResultsLoading(state)
});

const mapDispatch = dispatch => ({
    setPageSize: pageSize => dispatch(RecruitmentActions.setPageSize(pageSize)),
    setPage: page => dispatch(RecruitmentActions.setPage(page))
});

export default connect(
    mapState,
    mapDispatch
)(Pagination);
