import React from 'react';
import { Card as CardType, Suit } from '../types';
import { motion } from 'motion/react';

interface CardProps {
  card: CardType;
  selected?: boolean;
  onClick?: () => void;
  hidden?: boolean;
  className?: string;
}

const getSuitSymbol = (suit: Suit) => {
  switch (suit) {
    case 'spades': return '♠';
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
  }
};

const getSuitColor = (suit: Suit) => {
  return (suit === 'hearts' || suit === 'diamonds') ? 'text-red-600' : 'text-slate-900';
};

const Card: React.FC<CardProps> = ({ card, selected, onClick, hidden, className }) => {
  if (hidden) {
    return (
      <div className={`w-16 h-24 sm:w-20 sm:h-32 bg-indigo-800 rounded-lg border-2 border-white shadow-md flex items-center justify-center ${className}`}>
        <div className="w-12 h-20 sm:w-16 sm:h-28 border border-white/20 rounded flex items-center justify-center">
          <div className="text-white/20 text-2xl font-bold">CY</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      layout
      whileHover={{ y: -10 }}
      animate={{ y: selected ? -20 : 0 }}
      onClick={onClick}
      className={`relative w-16 h-24 sm:w-20 sm:h-32 bg-white rounded-lg border border-slate-200 shadow-md cursor-pointer select-none flex flex-col ${className}`}
    >
      {/* Top Left Label */}
      <div className={`absolute top-1 left-1 sm:top-2 sm:left-2 flex flex-col items-center leading-none ${getSuitColor(card.suit)}`}>
        <span className="text-sm sm:text-lg font-bold">{card.label}</span>
        <span className="text-xs sm:text-sm">{getSuitSymbol(card.suit)}</span>
      </div>
      
      {/* Center Large Symbol */}
      <div className={`absolute inset-0 flex items-center justify-center text-2xl sm:text-4xl ${getSuitColor(card.suit)} opacity-10`}>
        {getSuitSymbol(card.suit)}
      </div>

      {/* Bottom Right Label (Not inverted) */}
      <div className={`absolute bottom-1 right-1 sm:bottom-2 sm:right-2 flex flex-col items-center leading-none ${getSuitColor(card.suit)}`}>
        <span className="text-xs sm:text-sm">{getSuitSymbol(card.suit)}</span>
        <span className="text-sm sm:text-lg font-bold">{card.label}</span>
      </div>

      {selected && (
        <div className="absolute inset-0 bg-blue-500/10 rounded-lg border-2 border-blue-500 pointer-events-none" />
      )}
    </motion.div>
  );
};

export default Card;
