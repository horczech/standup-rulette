import { configureStore } from '@reduxjs/toolkit';
import teamReducer, { loadTeamsFromStorage } from './teamSlice';
import { loadTeamData, saveTeamData, unsubscribeFromTeamData } from '../services/firebase';

// Create the Redux store
const store = configureStore({
  reducer: {
    team: teamReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Load initial data from Firebase
loadTeamData((teamData) => {
  if (teamData && Object.keys(teamData).length > 0) {
    store.dispatch(loadTeamsFromStorage(teamData));
  }
});

// Subscribe to store changes to save to Firebase
let saveTimeout: NodeJS.Timeout;

store.subscribe(() => {
  const state = store.getState();
  
  // Debounce the save operation to avoid excessive writes
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  saveTimeout = setTimeout(() => {
    saveTeamData(state.team);
  }, 1000);
});

// Clean up Firebase subscription when store is destroyed
store.subscribe(() => {
  if (store.getState().team.teams) {
    unsubscribeFromTeamData();
  }
});

// Export the store
export default store;

// Define RootState type for useSelector hook
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
