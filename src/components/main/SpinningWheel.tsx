import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import useAppDispatch from '../../hooks/useAppDispatch';
import { incrementModerationCount, TeamMember } from '../../store/teamSlice';

interface SpinningWheelProps {
  members: Record<string, TeamMember>;
  teamName: string;
}

const SpinningWheel = ({ members, teamName }: SpinningWheelProps) => {
  const wheelRef = useRef<SVGSVGElement>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const dispatch = useAppDispatch();
  
  // Create an array of members for the wheel
  const memberArray = Object.keys(members);
  
  useEffect(() => {
    // Reset winner when members change
    setWinner(null);
  }, [members]);
  
  const spinWheel = () => {
    if (isSpinning || memberArray.length < 2) return;
    
    setIsSpinning(true);
    setWinner(null);
    
    // Random number of rotations between 2 and 5
    const rotations = 2 + Math.random() * 3;
    
    // Random winner
    const winnerIndex = Math.floor(Math.random() * memberArray.length);
    const winnerName = memberArray[winnerIndex];
    
    // Calculate the angle to land on the winner
    const segmentAngle = 360 / memberArray.length;
    const winnerAngle = segmentAngle * winnerIndex;
    
    // Total rotation amount (full rotations + winner position)
    const endAngle = rotations * 360 + (360 - winnerAngle);
    
    // Animate wheel rotation
    gsap.to(wheelRef.current, {
      rotation: `+=${endAngle}`,
      duration: 4,
      ease: "power2.out",
      onComplete: () => {
        // Update state with winner
        setWinner(winnerName);
        setIsSpinning(false);
        
        // Increment moderation count for winner
        dispatch(incrementModerationCount({ teamName, memberName: winnerName }));
      }
    });
  };
  
  // Create wheel segments based on members
  const createWheelSegments = () => {
    if (memberArray.length === 0) return null;
    
    const segmentAngle = 360 / memberArray.length;
    const radius = 150; // Wheel radius
    const centerX = 200; // SVG center X
    const centerY = 200; // SVG center Y
    
    return memberArray.map((member, index) => {
      const startAngle = index * segmentAngle;
      const endAngle = (index + 1) * segmentAngle;
      
      // Calculate points for the segment
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      
      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);
      
      // Create path for segment
      const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
      
      // Calculate text position
      const textAngle = (startAngle + endAngle) / 2;
      const textRad = (textAngle * Math.PI) / 180;
      const textX = centerX + (radius * 0.7) * Math.cos(textRad);
      const textY = centerY + (radius * 0.7) * Math.sin(textRad);
      
      // Alternate colors for segments using the app's color palette
      const color = index % 2 === 0 ? '#FFA2B6' : '#EBE9E1';
      
      return (
        <g key={member}>
          <path d={path} fill={color} stroke="#D6536D" />
          <text
            x={textX}
            y={textY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="14"
            fontWeight="bold"
            fill="#E43D12"
            transform={`rotate(${textAngle}, ${textX}, ${textY})`}
          >
            {member.length > 10 ? `${member.substring(0, 8)}...` : member}
          </text>
        </g>
      );
    });
  };
  
  // Create winner display
  const createWinnerDisplay = () => {
    if (!winner) return null;
    
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow-lg text-center border-2 border-[#FFA2B6]">
          <h3 className="text-xl font-bold text-[#D6536D]">Winner:</h3>
          <p className="text-2xl text-[#E43D12] font-bold mt-2">{winner}</p>
        </div>
      </div>
    );
  };

  // Render empty state when no members are present
  if (memberArray.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center p-8 bg-[#FFA2B6] bg-opacity-10 rounded-xl border-2 border-dashed border-[#D6536D]">
          <div className="text-6xl mb-4">😴</div>
          <h3 className="text-2xl font-bold text-[#E43D12] mb-2">Seems like everyone is slacking today!</h3>
          <p className="text-[#D6536D]">Add some team members to the "Working" list to start the rulette.</p>
        </div>
      </div>
    );
  }
  
  // Render wheel when there's only one member
  if (memberArray.length === 1) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center p-8 bg-[#FFA2B6] bg-opacity-10 rounded-xl border-2 border-[#D6536D]">
          <div className="text-6xl mb-4">👑</div>
          <h3 className="text-2xl font-bold text-[#E43D12] mb-2">Only one person is working!</h3>
          <p className="text-[#D6536D] mb-4">{memberArray[0]} wins by default!</p>
          <button
            onClick={() => dispatch(incrementModerationCount({ teamName, memberName: memberArray[0] }))}
            className="px-5 py-2.5 bg-[#EFB11D] hover:bg-[#e0a41b] text-white rounded-lg font-medium transition-colors"
          >
            Record Moderation
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center h-full relative">
      {/* Winner display */}
      {createWinnerDisplay()}
      
      {/* Wheel SVG */}
      <div className="relative mb-8">
        {/* Triangle pointer */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10">
          <svg width="30" height="30" viewBox="0 0 30 30">
            <polygon points="15,0 30,30 0,30" fill="#E43D12" />
          </svg>
        </div>
        
        {/* Wheel */}
        <svg
          ref={wheelRef}
          width="400"
          height="400"
          viewBox="0 0 400 400"
          className="transform"
        >
          {/* Wheel segments */}
          <g>
            {createWheelSegments()}
            {/* Center circle */}
            <circle cx="200" cy="200" r="30" fill="#EFB11D" stroke="#E43D12" strokeWidth="2" />
          </g>
        </svg>
      </div>
      
      {/* Spin button */}
      <button
        onClick={spinWheel}
        disabled={isSpinning || memberArray.length < 2}
        className={`px-6 py-3 rounded-full text-white font-bold text-lg shadow-lg transition-all ${
          isSpinning || memberArray.length < 2 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-[#E43D12] hover:bg-[#d13810] hover:shadow-xl'
        }`}
      >
        {isSpinning ? 'Spinning...' : 'Spin the Wheel'}
      </button>
    </div>
  );
};

export default SpinningWheel;
