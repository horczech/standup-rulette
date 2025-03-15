import { useState, useEffect } from 'react';
import useAppDispatch from '../../hooks/useAppDispatch';
import useAppSelector from '../../hooks/useAppSelector';
import { 
  addTeamMember, 
  removeTeamMember, 
  selectAbsentMembers, 
  selectMemberWithHighestCount, 
  selectPresentMembers, 
  setPresence, 
  updateModerationCount 
} from '../../store/teamSlice';

interface TeamListPanelProps {
  teamName: string;
}

const TeamListPanel = ({ teamName }: TeamListPanelProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [editingMember, setEditingMember] = useState<{ name: string; count: number } | null>(null);
  const [moderationCount, setModerationCount] = useState(0);

  const dispatch = useAppDispatch();
  const presentMembers = useAppSelector((state) => selectPresentMembers(state, teamName));
  const absentMembers = useAppSelector((state) => selectAbsentMembers(state, teamName));
  const memberWithHighestCount = useAppSelector((state) => selectMemberWithHighestCount(state, teamName));

  const handleAddMember = () => {
    if (newMemberName.trim()) {
      dispatch(addTeamMember({ teamName, memberName: newMemberName.trim() }));
      setNewMemberName('');
    }
  };

  const handleRemoveMember = (memberName: string) => {
    dispatch(removeTeamMember({ teamName, memberName }));
  };

  const handleUpdateModerationCount = () => {
    if (editingMember) {
      dispatch(updateModerationCount({ 
        teamName, 
        memberName: editingMember.name, 
        count: moderationCount 
      }));
      setEditingMember(null);
    }
  };

  const handleMoveMember = (memberName: string, isPresent: boolean) => {
    dispatch(setPresence({ teamName, memberName, isPresent }));
  };

  const handleEditModerationCount = (name: string, count: number) => {
    setEditingMember({ name, count });
    setModerationCount(count);
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && showEditModal) {
      setShowEditModal(false);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showEditModal]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full border border-[#FFA2B6]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#E43D12]">Team Members</h2>
        <button 
          onClick={() => setShowEditModal(true)}
          className="text-[#D6536D] hover:text-[#E43D12] bg-transparent border-0 p-0 focus:outline-none"
          aria-label="Edit team members"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
      </div>

      {/* Working List */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2 text-[#D6536D] text-left border-l-4 border-[#D6536D] pl-2">Working:</h3>
        <ul className="space-y-2 pl-1">
          {Object.entries(presentMembers).length > 0 ? (
            Object.entries(presentMembers).map(([name, member]) => (
              <li key={name} className="flex justify-between items-center p-2 hover:bg-[#EBE9E1] rounded">
                <div className="flex items-center">
                  <span className="mr-1 w-4" title="Most moderations">
                    {name === memberWithHighestCount ? '👑' : ''}
                  </span>
                  <span className="ml-2">{name}</span>
                  <span className="ml-2 text-sm text-[#D6536D]">{member.moderationCount}</span>
                </div>
                <button 
                  onClick={() => handleMoveMember(name, false)}
                  className="text-[#E43D12] hover:text-[#d13810] bg-transparent hover:bg-[#E43D12]/10 border-0 p-2 focus:outline-none transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </li>
            ))
          ) : (
            <li className="text-gray-500 italic p-2">No team members present 😴</li>
          )}
        </ul>
      </div>

      {/* Slacking List */}
      <div>
        <h3 className="text-lg font-medium mb-2 text-[#D6536D] text-left border-l-4 border-[#D6536D] pl-2">Slacking:</h3>
        <ul className="space-y-2 pl-1">
          {Object.entries(absentMembers).length > 0 ? (
            Object.entries(absentMembers).map(([name, member]) => (
              <li key={name} className="flex justify-between items-center p-2 hover:bg-[#EBE9E1] rounded">
                <div className="flex items-center">
                  <span className="mr-1 w-4" title="Most moderations">
                    {name === memberWithHighestCount ? '👑' : ''}
                  </span>
                  <span className="ml-2">{name}</span>
                  <span className="ml-2 text-sm text-[#D6536D]">{member.moderationCount}</span>
                </div>
                <button 
                  onClick={() => handleMoveMember(name, true)}
                  className="text-[#EFB11D] hover:text-[#e0a41b] bg-transparent hover:bg-[#EFB11D]/10 border-0 p-2 focus:outline-none transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </li>
            ))
          ) : (
            <li className="text-gray-500 italic p-2">No absent team members 🎉</li>
          )}
        </ul>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 shadow-xl relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-[#E43D12] hover:text-[#d13810] bg-transparent border-0 p-0 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#E43D12] mb-2">Edit Team Members</h2>
              <p className="text-[#D6536D] text-sm">Manage your team members and their moderation counts</p>
            </div>

            <div className="space-y-4">
              {/* Team Members List */}
              <div className="border-b border-[#FFA2B6] pb-4">
                {Object.entries(presentMembers).length + Object.entries(absentMembers).length > 0 && (
                  <h3 className="text-lg font-semibold text-[#E43D12] mb-2">Team Members</h3>
                )}
                <div className="space-y-2">
                  {Object.entries(presentMembers).length + Object.entries(absentMembers).length === 0 ? (
                    <div className="p-4 text-center text-[#D6536D] opacity-80">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <p>No team members yet</p>
                      <p className="text-sm">Add your first team member using the input below</p>
                    </div>
                  ) : (
                    [...Object.entries(presentMembers), ...Object.entries(absentMembers)].sort(([a], [b]) => a.localeCompare(b)).map(([name, member]) => (
                      <div key={name} className="flex items-center justify-between p-2 bg-[#FFF5F5] rounded">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium flex items-center">
                            {name}
                          </span>
                          {editingMember && editingMember.name === name ? (
                            <div className="flex items-center space-x-6">
                              <input
                                type="number"
                                value={moderationCount}
                                onChange={(e) => setModerationCount(parseInt(e.target.value) || 0)}
                                min="0"
                                className="w-20 px-4 py-2 border border-[#FFA2B6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E43D12]"
                              />
                              <div className="flex items-center space-x-4">
                                <button
                                  onClick={handleUpdateModerationCount}
                                  className="text-green-500 hover:text-green-700 bg-transparent hover:bg-green-50/10 border-0 p-1 focus:outline-none transition-colors duration-200"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="text-red-500 hover:text-red-700 bg-transparent hover:bg-red-50/10 border-0 p-1 focus:outline-none transition-colors duration-200"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span
                              className="text-sm text-[#D6536D] cursor-pointer hover:underline"
                              onClick={() => handleEditModerationCount(name, member.moderationCount)}
                            >
                              ({member.moderationCount || 0})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleRemoveMember(name)}
                            className="text-[#E43D12] hover:text-[#d13810] transition-colors duration-200 bg-transparent border-0 focus:outline-none"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Member */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newMemberName.trim()) {
                      handleAddMember();
                      e.preventDefault();
                    }
                  }}
                  placeholder="Enter new member name"
                  className="flex-1 px-4 py-2 border border-[#FFA2B6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E43D12]"
                />
                <button
                  onClick={handleAddMember}
                  className="px-4 py-2 bg-[#E43D12] text-white rounded-lg hover:bg-[#d13810] transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamListPanel;
