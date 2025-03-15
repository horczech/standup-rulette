import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppDispatch from '../../hooks/useAppDispatch';
import useAppSelector from '../../hooks/useAppSelector';
import { setCurrentTeam } from '../../store/teamSlice';
import { createTeamAsync } from '../../store/teamThunks';

const WelcomePage = () => {
  const [teamName, setTeamName] = useState('');
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', isSuccess: true });
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const teams = useAppSelector((state) => state.team.teams);

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Handle keyboard events for the modal
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (showCreateTeamModal) {
      if (e.key === 'Escape') {
        setShowCreateTeamModal(false);
      } else if (e.key === 'Enter') {
        handleCreateTeam();
      }
    }
  }, [showCreateTeamModal, teamName]);

  // Set up and clean up keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName.trim()) {
      return;
    }
    
    if (teams[teamName]) {
      // Team exists, set as current team and navigate to main page
      dispatch(setCurrentTeam(teamName));
      navigate('/main');
    } else {
      // Team doesn't exist, show create team modal
      setShowCreateTeamModal(true);
    }
  };

  const handleCreateTeam = async () => {
    setShowCreateTeamModal(false);
    
    try {
      const resultAction = await dispatch(createTeamAsync(teamName)).unwrap();
      
      if (resultAction.success) {
        setNotification({
          show: true,
          message: `Team "${teamName}" has been created successfully!`,
          isSuccess: true
        });
        navigate('/main');
      } else {
        setNotification({
          show: true,
          message: 'Failed to create team. Please try again.',
          isSuccess: false
        });
      }
    } catch (error) {
      setNotification({
        show: true,
        message: 'An error occurred while creating the team.',
        isSuccess: false
      });
      console.error('Error creating team:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#EBE9E1] flex flex-col items-center justify-center p-6">
      {/* Logo/Header */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-extrabold text-[#E43D12] mb-3 tracking-tight">
          🎯 Standup Rulette 🎲
        </h1>
        <p className="text-[#D6536D] text-md opacity-70">Spin the wheel of fortune for your standups</p>
      </div>
      
      {/* Search Form */}
      <div className="w-full max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col md:flex-row gap-3 items-center w-full">
            {/* Search input */}
            <div className="flex-grow relative">
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
                className="w-full px-6 py-4 bg-white border-0 rounded-full text-xl text-gray-800 shadow-lg focus:outline-none focus:ring-4 focus:ring-[#FFA2B6]"
                autoFocus
              />
            </div>
            
            {/* Button */}
            <button
              type="submit"
              className="md:ml-3 px-8 py-4 bg-[#E43D12] hover:bg-[#d13810] text-white font-bold rounded-full transition-all duration-200 shadow-lg text-xl"
            >
              Let's Go
            </button>
          </div>
        </form>
        
        {/* Help text */}
        <p className="text-[#D6536D] text-center text-sm opacity-80">
          Don't have a team yet? Just enter a name and we'll create one for you.
        </p>
      </div>

      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-xl max-w-md transform transition-all duration-300 ease-in-out ${notification.isSuccess ? 'bg-green-100 border-l-4 border-green-500 text-green-700' : 'bg-red-100 border-l-4 border-red-500 text-red-700'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {notification.isSuccess ? (
                <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm">{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateTeamModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Close modal when clicking on the backdrop (outside the modal content)
            if (e.target === e.currentTarget) {
              setShowCreateTeamModal(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl transform transition-all animate-fadeIn">
            <div className="p-6 pb-0">
              <h2 className="text-2xl font-bold text-[#E43D12] mb-2">Create New Team</h2>
              <p className="mb-6 text-gray-600">
                Team "<span className="font-semibold text-[#D6536D]">{teamName}</span>" doesn't exist yet. Would you like to create it?
              </p>
            </div>
            
            <div className="p-6 bg-[#EBE9E1] flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateTeamModal(false)}
                className="px-5 py-2.5 border border-[#D6536D] text-[#D6536D] bg-white rounded-lg hover:bg-[#FFA2B6] hover:text-white hover:border-[#FFA2B6] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFA2B6]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTeam}
                className="px-5 py-2.5 bg-[#E43D12] text-white rounded-lg hover:bg-[#d13810] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#E43D12]"
              >
                Create Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomePage;
