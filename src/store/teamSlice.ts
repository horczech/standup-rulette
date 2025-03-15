import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define a type for the team member
export interface TeamMember {
  moderationCount: number;
  isPresent: boolean;
}

// Define a type for a single team
export interface Team {
  members: Record<string, TeamMember>;
}

// Define a type for the state
export interface TeamState {
  teams: Record<string, Team>;
  currentTeam: string | null;
}

// Define the initial state
const initialState: TeamState = {
  teams: {},
  currentTeam: null,
};

// Create the slice
export const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    // Set the current team
    setCurrentTeam: (state, action: PayloadAction<string>) => {
      state.currentTeam = action.payload;
    },
    
    // Create a new team
    createTeam: (state, action: PayloadAction<string>) => {
      if (!state.teams[action.payload]) {
        state.teams[action.payload] = { members: {} };
      }
      state.currentTeam = action.payload;
    },
    
    // Add a team member
    addTeamMember: (state, action: PayloadAction<{ teamName: string; memberName: string }>) => {
      const { teamName, memberName } = action.payload;
      if (state.teams[teamName] && !state.teams[teamName].members[memberName]) {
        state.teams[teamName].members[memberName] = { moderationCount: 0, isPresent: true };
      }
    },
    
    // Remove a team member
    removeTeamMember: (state, action: PayloadAction<{ teamName: string; memberName: string }>) => {
      const { teamName, memberName } = action.payload;
      if (state.teams[teamName] && state.teams[teamName].members[memberName]) {
        delete state.teams[teamName].members[memberName];
      }
    },
    
    // Update moderation count
    updateModerationCount: (state, action: PayloadAction<{ teamName: string; memberName: string; count: number }>) => {
      const { teamName, memberName, count } = action.payload;
      if (state.teams[teamName] && state.teams[teamName].members[memberName]) {
        state.teams[teamName].members[memberName].moderationCount = count;
      }
    },
    
    // Increment moderation count
    incrementModerationCount: (state, action: PayloadAction<{ teamName: string; memberName: string }>) => {
      const { teamName, memberName } = action.payload;
      if (state.teams[teamName] && state.teams[teamName].members[memberName]) {
        state.teams[teamName].members[memberName].moderationCount += 1;
      }
    },
    
    // Toggle team member presence
    togglePresence: (state, action: PayloadAction<{ teamName: string; memberName: string }>) => {
      const { teamName, memberName } = action.payload;
      if (state.teams[teamName] && state.teams[teamName].members[memberName]) {
        state.teams[teamName].members[memberName].isPresent = !state.teams[teamName].members[memberName].isPresent;
      }
    },
    
    // Set team member presence
    setPresence: (state, action: PayloadAction<{ teamName: string; memberName: string; isPresent: boolean }>) => {
      const { teamName, memberName, isPresent } = action.payload;
      if (state.teams[teamName] && state.teams[teamName].members[memberName]) {
        state.teams[teamName].members[memberName].isPresent = isPresent;
      }
    },
    
    // Load teams from storage
    loadTeamsFromStorage: (state, action: PayloadAction<Record<string, Team>>) => {
      state.teams = action.payload;
    },
  },
});

// Export actions
export const {
  setCurrentTeam,
  createTeam,
  addTeamMember,
  removeTeamMember,
  updateModerationCount,
  incrementModerationCount,
  togglePresence,
  setPresence,
  loadTeamsFromStorage,
} = teamSlice.actions;

// Export selectors
export const selectCurrentTeam = (state: { team: TeamState }) => state.team.currentTeam;
export const selectTeam = (state: { team: TeamState }, teamName: string) => state.team.teams[teamName];
export const selectTeamMembers = (state: { team: TeamState }, teamName: string) => 
  state.team.teams[teamName]?.members || {};
export const selectPresentMembers = (state: { team: TeamState }, teamName: string) => {
  const members = state.team.teams[teamName]?.members || {};
  return Object.entries(members)
    .filter(([_, member]) => member.isPresent)
    .reduce((acc, [name, member]) => {
      acc[name] = member;
      return acc;
    }, {} as Record<string, TeamMember>);
};
export const selectAbsentMembers = (state: { team: TeamState }, teamName: string) => {
  const members = state.team.teams[teamName]?.members || {};
  return Object.entries(members)
    .filter(([_, member]) => !member.isPresent)
    .reduce((acc, [name, member]) => {
      acc[name] = member;
      return acc;
    }, {} as Record<string, TeamMember>);
};
export const selectMemberWithHighestCount = (state: { team: TeamState }, teamName: string) => {
  const members = state.team.teams[teamName]?.members || {};
  return Object.entries(members).reduce(
    (highest, [name, member]) => {
      if (!highest.name || member.moderationCount > highest.count) {
        return { name, count: member.moderationCount };
      }
      return highest;
    },
    { name: '', count: -1 }
  ).name;
};

export default teamSlice.reducer;
