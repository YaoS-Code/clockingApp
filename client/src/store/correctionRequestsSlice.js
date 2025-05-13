import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as correctionRequestsService from '../services/correctionRequests';

// Async thunks
export const fetchCorrectionRequests = createAsyncThunk(
    'correctionRequests/fetchAll',
    async () => {
        return await correctionRequestsService.fetchCorrectionRequests();
    }
);

export const fetchCorrectionRequestsCount = createAsyncThunk(
    'correctionRequests/fetchCount',
    async () => {
        return await correctionRequestsService.fetchCorrectionRequestsCount();
    }
);

export const approveCorrectionRequest = createAsyncThunk(
    'correctionRequests/approve',
    async (id) => {
        return await correctionRequestsService.approveCorrectionRequest(id);
    }
);

export const rejectCorrectionRequest = createAsyncThunk(
    'correctionRequests/reject',
    async (id) => {
        return await correctionRequestsService.rejectCorrectionRequest(id);
    }
);

const initialState = {
    requests: {
        pending: [],
        approved: [],
        rejected: []
    },
    loading: false,
    error: null
};

const correctionRequestsSlice = createSlice({
    name: 'correctionRequests',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch all correction requests
            .addCase(fetchCorrectionRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCorrectionRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.requests = action.payload;
            })
            .addCase(fetchCorrectionRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Fetch count
            .addCase(fetchCorrectionRequestsCount.fulfilled, (state, action) => {
                state.count = action.payload.count;
            })
            // Approve request
            .addCase(approveCorrectionRequest.fulfilled, (state, action) => {
                // Refresh will be handled by fetchCorrectionRequests
            })
            // Reject request
            .addCase(rejectCorrectionRequest.fulfilled, (state, action) => {
                // Refresh will be handled by fetchCorrectionRequests
            });
    },
});

export default correctionRequestsSlice.reducer; 