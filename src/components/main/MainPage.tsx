import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppSelector from '../../hooks/useAppSelector';
import TeamListPanel from './TeamListPanel';
import SpinningWheel from './SpinningWheel';
import { selectCurrentTeam, selectPresentMembers } from '../../store/teamSlice';

const MainPage = () => {
  const navigate = useNavigate();
  const currentTeam = useAppSelector(selectCurrentTeam);
  const presentMembers = useAppSelector((state) => 
    currentTeam ? selectPresentMembers(state, currentTeam) : {});

  useEffect(() => {
    // Redirect to welcome page if no team is selected
    if (!currentTeam) {
      navigate('/');
    }
  }, [currentTeam, navigate]);

  if (!currentTeam) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8F7F3] p-4 pb-24 flex flex-col">
      <div className="w-full max-w-6xl mx-auto flex flex-col h-full">
        {/* Main content */}
        <main className="flex-grow p-4 overflow-hidden">
          {/* Header */}
          <header className="mb-4 w-full">
            <h1 className="text-4xl font-bold text-[#E43D12] flex items-center text-left">
              <span className="text-5xl">Team {currentTeam}</span>
              <span className="ml-2">🎲</span>
            </h1>
            <p className="text-[#D6536D] opacity-80 text-sm mt-1 text-left ml-1">Who’s calling the shots today?</p>
          </header>

          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[75vh]">
            {/* Team list panel */}
            <div className="lg:col-span-1 h-full flex flex-col">
              <TeamListPanel teamName={currentTeam} />
            </div>

            {/* Spinning wheel */}
            <div className="lg:col-span-2 h-full flex flex-col">
              <div className="bg-white rounded-lg shadow-md p-4 border border-[#FFA2B6] flex-grow">
                <SpinningWheel members={presentMembers} teamName={currentTeam} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainPage;
