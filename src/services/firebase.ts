import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, off } from 'firebase/database';
import { TeamState } from '../store/teamSlice';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-auth-domain",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "your-database-url",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-storage-bucket",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "your-messaging-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Database reference
const teamsRef = ref(database, 'teams');

// Save team data to Firebase
export const saveTeamData = (teamState: TeamState) => {
  try {
    set(teamsRef, teamState.teams)
      .then(() => {
        console.log('Team data saved to Firebase successfully');
      })
      .catch((error) => {
        console.error('Error saving team data to Firebase:', error);
      });
  } catch (error) {
    console.error('Error saving team data to Firebase:', error);
  }
};

// Load team data from Firebase
export const loadTeamData = (callback: (data: any) => void) => {
  onValue(teamsRef, (snapshot) => {
    const data = snapshot.val();
    callback(data || {});
  }, (error) => {
    console.error('Error loading team data from Firebase:', error);
  });
};

// Unsubscribe from Firebase updates
export const unsubscribeFromTeamData = () => {
  off(teamsRef);
};

export default database;
