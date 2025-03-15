import { createAsyncThunk } from '@reduxjs/toolkit';
import { saveTeamData } from '../services/firebase';
import { createTeam as createTeamAction, setCurrentTeam, TeamState } from './teamSlice';

// Async thunk for creating a team
export const createTeamAsync = createAsyncThunk(
  'team/createTeamAsync',
  async (teamName: string, { dispatch, getState }) => {
    try {
      // First create the team in the local state
      dispatch(createTeamAction(teamName));
      
      // Then save to Firebase
      const state = getState() as { team: TeamState };
      await saveTeamData(state.team);
      
      // Set as current team
      dispatch(setCurrentTeam(teamName));
      
      return { teamName, success: true };
    } catch (error) {
      console.error('Error creating team:', error);
      return { teamName, success: false, error };
    }
  }
);
