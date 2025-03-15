import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';
import useAppDispatch from '../../hooks/useAppDispatch';
import { incrementModerationCount, TeamMember } from '../../store/teamSlice';

interface SpinningWheelProps {
  members: Record<string, TeamMember>;
  teamName: string;
}

const DISTINCT_PASTEL_COLORS = [
  '#FFB3BA', // Soft Pink
  '#B3FFBA', // Soft Green
  '#BAF0FF', // Soft Blue
  '#FFDFBA', // Soft Orange
  '#D1BFFF', // Soft Purple
  '#FFFFBA', // Soft Yellow
  '#FFB3E6', // Soft Magenta
  '#B3FFDF', // Soft Mint
  '#BAFFD1', // Soft Cyan
  '#FFB3D1', // Soft Rose
  '#BFFFBF', // Soft Lime
  '#D1B3FF'  // Soft Lavender
];

const SpinningWheel = ({ members, teamName }: SpinningWheelProps) => {
  const wheelRef = useRef<SVGSVGElement>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const dispatch = useAppDispatch();
  
  const memberArray = Object.keys(members);
  
  const calculateTextPosition = (index: number) => {
    const segmentAngle = 360 / memberArray.length;
    const middleAngle = index * segmentAngle + segmentAngle / 2;
    const radius = 150;
    const centerX = 200;
    const centerY = 200;
    
    const textRad = (middleAngle * Math.PI) / 180;
    return {
      x: centerX + (radius * 0.7) * Math.cos(textRad),
      y: centerY + (radius * 0.7) * Math.sin(textRad)
    };
  };

  const spinWheel = () => {
    if (isSpinning || memberArray.length < 2) return;
    
    setIsSpinning(true);
    setWinner(null);
    
    // Randomly select winner first
    const winnerIndex = Math.floor(Math.random() * memberArray.length);
    const winnerName = memberArray[winnerIndex];
    
    // Calculate required rotation to bring winner to top
    const currentRotation = gsap.getProperty(wheelRef.current, "rotation") || 0;
    const { x, y } = calculateTextPosition(winnerIndex);
    
    // Calculate angle needed to bring this point to top (12 o'clock)
    const centerX = 200;
    const centerY = 200;
    const deltaX = x - centerX;
    const deltaY = y - centerY;
    const targetAngle = Math.atan2(deltaY, deltaX) * 180 / Math.PI + 90;
    
    // Calculate required rotation (3 full spins + adjustment)
    const fullSpins = 3;
    const baseRotation = fullSpins * 360;
    const totalRotation = baseRotation - targetAngle;
    
    // Adjust for current rotation
    const currentRotationMod = Number(currentRotation) % 360;
    const finalRotation = totalRotation + (360 - currentRotationMod);
    
    gsap.to(wheelRef.current, {
      rotation: `+=${finalRotation}`,
      duration: 4,
      ease: "power2.out",
      transformOrigin: "center center",
      onComplete: () => {
        setWinner(winnerName);
        // Enable spinning again immediately
        setIsSpinning(false);
        dispatch(incrementModerationCount({ teamName, memberName: winnerName }));
        
        // Highlight winner
        gsap.to(`[data-member="${winnerName}"] path`, {
          scale: 1.1,
          fill: '#FFD700',
          duration: 0.5,
          transformOrigin: "center center",
          zIndex: 1000 // Temporarily elevate z-index
        });
        
        // Confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Reset highlight after 5 seconds, but don't affect spin state
        setTimeout(() => {
          gsap.to(`[data-member="${winnerName}"] path`, {
            scale: 1,
            fill: DISTINCT_PASTEL_COLORS[memberArray.indexOf(winnerName) % DISTINCT_PASTEL_COLORS.length],
            duration: 0.5,
            transformOrigin: "center center",
            zIndex: 0 // Reset z-index
          });
        }, 5000);
      }
    });
  };

  const createWheelSegments = () => {
    const radius = 150;
    const centerX = 200;
    const centerY = 200;
    
    return memberArray.map((member, index) => {
      const segmentAngle = 360 / memberArray.length;
      const startAngle = index * segmentAngle;
      const endAngle = (index + 1) * segmentAngle;
      
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      
      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);
      
      const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
      const { x: textX, y: textY } = calculateTextPosition(index);
      
      // Get a distinct pastel color
      const colorIndex = index % DISTINCT_PASTEL_COLORS.length;
      const color = DISTINCT_PASTEL_COLORS[colorIndex];
      
      return (
        <g key={member} data-member={member}>
          <path d={path} fill={color} stroke="#D6536D" />
          <text
            x={textX}
            y={textY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="14"
            fill="#E43D12"
            transform={`rotate(${index * segmentAngle + segmentAngle / 2}, ${textX}, ${textY})`}
          >
            {member.length > 10 ? `${member.substring(0, 8)}...` : member}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full relative">
      {winner && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow-lg text-center border-2 border-[#FFA2B6]">
            <h3 className="text-xl font-bold text-[#D6536D]">Winner:</h3>
            <p className="text-2xl text-[#E43D12] font-bold mt-2">{winner}</p>
          </div>
        </div>
      )}
      
      <div className="relative mb-8">
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-10">
          <svg width="30" height="30" viewBox="0 0 30 30">
            <polygon points="15,30 30,0 0,0" fill="#E43D12" />
          </svg>
        </div>
        
        <svg
          ref={wheelRef}
          width="400"
          height="400"
          viewBox="0 0 400 400"
          className="transform"
        >
          <g>
            {createWheelSegments()}
            <circle cx="200" cy="200" r="30" fill="#EFB11D" stroke="#E43D12" strokeWidth="2" />
          </g>
        </svg>
      </div>
      
      <button
        onClick={spinWheel}
        disabled={isSpinning || memberArray.length < 2}
        className={`px-6 py-3 rounded-full text-white font-bold text-lg shadow-lg transition-all z-50 ${
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