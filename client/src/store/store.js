import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import correctionRequestsReducer from './correctionRequestsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    correctionRequests: correctionRequestsReducer,
  },
});

export default store;