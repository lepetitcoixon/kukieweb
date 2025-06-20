
import React from 'react';
import { ALLERGEN_DETAILS } from '../../constants';
import { Allergen } from '../../types';

interface AllergenIconProps {
  allergen: Allergen;
  type: 'present' | 'customized-free' | 'available-customization';
  size?: 'sm' | 'md';
}

// Basic SVG icons (replace with more specific ones if available)
const GlutenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9.75v3.75m-18-3.75v3.75m10.5-11.25L12 6.75M9 3.75l3 3M15 3.75l-3 3m0 0L9 9.75M12 6.75l3 3M9.75 14.25h4.5M12 12.75V17.25" /></svg>; // Generic "no" symbol idea
const DairyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10.5 7.5h3v4.5h-3V7.5z" /></svg>; // Milk carton idea
const NutsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5M11.25 4.5V19.5" /></svg>; // Placeholder
const SugarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013-3.866A8.237 8.237 0 0115.362 5.214z" /></svg>; // Placeholder

const ICONS: Record<Allergen, React.FC> = {
  gluten: GlutenIcon,
  dairy: DairyIcon,
  nuts: NutsIcon,
  sugar: SugarIcon,
  eggs: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6c0-1.743-.766-3.324-1.992-4.44A6.002 6.002 0 006.008 8.31C4.766 9.426 4 11.007 4 12.75a6 6 0 006 6z" /></svg>, // Egg shape
};


export const AllergenDisplay: React.FC<AllergenIconProps> = ({ allergen, type, size = 'sm' }) => {
  const detail = ALLERGEN_DETAILS[allergen];
  const IconComponent = ICONS[allergen];
  
  let textColor = 'text-red-500'; 
  let bgColor = 'bg-red-100';
  let iconSizeClass = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  let textSizeClass = size === 'sm' ? 'text-xs' : 'text-sm';
  let fullLabel: string;
  let titleText: string;
  let iconContent: React.ReactNode = null;

  if (type === 'present') {
    bgColor = 'bg-pink-600';
    textColor = 'text-white';
    titleText = `Contiene ${detail.label}`;
    let prefix = '';
    if (allergen === 'gluten') prefix = '✨ ';
    else if (allergen === 'eggs') prefix = '🥚 ';
    // else if (allergen === 'dairy') prefix = '🥛 '; // Example for future
    // else if (allergen === 'nuts') prefix = '🥜 ';  // Example for future
    fullLabel = `${prefix}${detail.label}`;
    // No SVG icon component for 'present' type, using text prefix
  } else if (type === 'customized-free') {
    textColor = 'text-green-600';
    bgColor = 'bg-green-100';
    fullLabel = `Sin ${detail.label}`;
    titleText = `Personalizado Sin ${detail.label}`;
    if (IconComponent) iconContent = <span className={`${iconSizeClass} mr-1`}><IconComponent /></span>;
  } else if (type === 'available-customization') {
    textColor = 'text-blue-500';
    bgColor = 'bg-blue-100';
    if (allergen === 'gluten') {
        fullLabel = `Con ${detail.label}`;
        titleText = `Se puede personalizar para ser Con ${detail.label}`;
    } else {
        fullLabel = `Sin ${detail.label}`;
        titleText = `Se puede personalizar para ser Sin ${detail.label}`;
    }
    if (IconComponent) iconContent = <span className={`${iconSizeClass} mr-1`}><IconComponent /></span>;
  } else {
    // Fallback
    fullLabel = detail.label;
    titleText = detail.label;
    if (IconComponent) iconContent = <span className={`${iconSizeClass} mr-1`}><IconComponent /></span>;
  }

  return (
    <span 
      title={titleText}
      className={`inline-flex items-center justify-center ${bgColor} ${textColor} ${textSizeClass} font-medium px-2.5 py-1 rounded-full mr-1.5 mb-1.5 shadow-sm transition-all hover:opacity-90`}
      style={{ minWidth: size === 'sm' ? '70px' : '90px' }} // Ensure a minimum width for better visual consistency of pills
    >
      {iconContent} {/* Render SVG icon if available and not 'present' type */}
      {fullLabel}
    </span>
  );
};
