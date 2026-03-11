import { Card, PlayResult, CardType } from '../types';

export const RANKS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]; // 3 to 2
export const SUITS: ('spades' | 'hearts' | 'diamonds' | 'clubs')[] = ['spades', 'hearts', 'diamonds', 'clubs'];

export const getRankLabel = (rank: number): string => {
  if (rank <= 10) return rank.toString();
  if (rank === 11) return 'J';
  if (rank === 12) return 'Q';
  if (rank === 13) return 'K';
  if (rank === 14) return 'A';
  if (rank === 15) return '2';
  return '';
};

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        label: getRankLabel(rank),
      });
    }
  }
  return deck;
};

export const sortCards = (cards: Card[]): Card[] => {
  return [...cards].sort((a, b) => b.rank - a.rank || a.suit.localeCompare(b.suit));
};

export const analyzeCards = (cards: Card[]): PlayResult => {
  const len = cards.length;
  if (len === 0) return { type: 'none', value: 0, length: 0 };

  const sorted = [...cards].sort((a, b) => a.rank - b.rank);
  const counts: Record<number, number> = {};
  sorted.forEach(c => counts[c.rank] = (counts[c.rank] || 0) + 1);
  const uniqueRanks = Object.keys(counts).map(Number).sort((a, b) => a - b);
  const countValues = Object.values(counts);

  // Single
  if (len === 1) return { type: 'single', value: sorted[0].rank, length: 1 };

  // Pair
  if (len === 2 && countValues[0] === 2) return { type: 'pair', value: sorted[0].rank, length: 1 };

  // Bomb
  if (len === 4 && countValues[0] === 4) return { type: 'bomb', value: sorted[0].rank, length: 1 };

  // Triple
  if (len === 3 && countValues[0] === 3) return { type: 'triple', value: sorted[0].rank, length: 1 };

  // Triple with one
  if (len === 4) {
    const tripleRank = Object.entries(counts).find(([_, count]) => count === 3)?.[0];
    if (tripleRank) return { type: 'triple_with_one', value: Number(tripleRank), length: 1 };
  }

  // Triple with two
  if (len === 5) {
    const tripleRank = Object.entries(counts).find(([_, count]) => count === 3)?.[0];
    const pairRank = Object.entries(counts).find(([_, count]) => count === 2)?.[0];
    if (tripleRank && pairRank) return { type: 'triple_with_two', value: Number(tripleRank), length: 1 };
  }

  // Straight (5+ cards)
  if (len >= 5 && uniqueRanks.length === len && countValues.every(v => v === 1)) {
    const isConsecutive = uniqueRanks.every((r, i) => i === 0 || r === uniqueRanks[i - 1] + 1);
    // 2 (rank 15) cannot be part of a straight
    if (isConsecutive && uniqueRanks[uniqueRanks.length - 1] < 15) {
      return { type: 'straight', value: uniqueRanks[0], length: len };
    }
  }

  // Consecutive Pairs (3+ pairs)
  if (len >= 6 && len % 2 === 0 && uniqueRanks.length === len / 2 && countValues.every(v => v === 2)) {
    const isConsecutive = uniqueRanks.every((r, i) => i === 0 || r === uniqueRanks[i - 1] + 1);
    if (isConsecutive && uniqueRanks[uniqueRanks.length - 1] < 15) {
      return { type: 'consecutive_pairs', value: uniqueRanks[0], length: len / 2 };
    }
  }

  return { type: 'none', value: 0, length: 0 };
};

export const canPlay = (selectedCards: Card[], lastPlay: { result: PlayResult } | null): PlayResult | null => {
  const result = analyzeCards(selectedCards);
  if (result.type === 'none') return null;

  if (!lastPlay) return result;

  // Bomb beats anything except a higher bomb
  if (result.type === 'bomb') {
    if (lastPlay.result.type !== 'bomb') return result;
    if (result.value > lastPlay.result.value) return result;
  }

  // Same type comparison
  if (result.type === lastPlay.result.type && result.length === lastPlay.result.length) {
    if (result.value > lastPlay.result.value) return result;
  }

  return null;
};
