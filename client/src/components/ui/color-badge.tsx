interface ColorBadgeProps {
  color: {
    id: number;
    name: string;
    hexCode: string;
  };
  isSelected: boolean;
  onClick: () => void;
}

export default function ColorBadge({ color, isSelected, onClick }: ColorBadgeProps) {
  // Special case for white to add a border
  const needsBorder = color.name.toLowerCase() === 'white';
  
  return (
    <button 
      className={`
        w-8 h-8 rounded-full
        ${needsBorder ? 'border border-gray-300' : ''}
        ${isSelected ? 'border-2 border-white outline outline-2 outline-primary' : ''}
        transition
      `}
      style={{ backgroundColor: color.hexCode }}
      onClick={onClick}
      title={color.name}
      aria-label={`${color.name} color`}
    />
  );
}
