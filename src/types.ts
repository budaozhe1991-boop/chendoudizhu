export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

export interface Card {
  id: string;
  suit: Suit;
  rank: number; // 3-15 (3-10, J=11, Q=12, K=13, A=14, 2=15)
  label: string;
}

export type CardType = 
  | 'single'
  | 'pair'
  | 'triple'
  | 'triple_with_one'
  | 'triple_with_two'
  | 'straight' // 顺子
  | 'consecutive_pairs' // 连对
  | 'bomb' // 炸弹
  | 'none';

export interface PlayResult {
  type: CardType;
  value: number; // The main rank value for comparison
  length: number; // For straights and consecutive pairs
}

export type PlayerRole = 'landlord' | 'peasant';

export interface Player {
  id: number;
  name: string;
  role: PlayerRole;
  hand: Card[];
  isAI: boolean;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  lastPlay: {
    cards: Card[];
    result: PlayResult;
    playerIndex: number;
  } | null;
  winner: number | null;
  phase: 'lobby' | 'dealing' | 'playing' | 'gameOver';
}
