import { Card, PlayResult, Player } from '../types';
import { analyzeCards, canPlay, sortCards } from './gameLogic';

export const getAIAction = (
  hand: Card[],
  lastPlay: { cards: Card[]; result: PlayResult; playerIndex: number } | null,
  myIndex: number
): Card[] | null => {
  // If no last play or last play was by me (everyone passed)
  const isFreePlay = !lastPlay || lastPlay.playerIndex === myIndex;

  if (isFreePlay) {
    // Just play the smallest single card for now
    const sorted = sortCards(hand);
    return [sorted[sorted.length - 1]];
  }

  // Try to beat the last play
  // Simple strategy: try all combinations of the same length and type
  const sorted = sortCards(hand);
  
  // Try singles
  if (lastPlay.result.type === 'single') {
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (canPlay([sorted[i]], lastPlay)) return [sorted[i]];
    }
  }

  // Try pairs
  if (lastPlay.result.type === 'pair') {
    for (let i = sorted.length - 1; i > 0; i--) {
      if (sorted[i].rank === sorted[i-1].rank) {
        if (canPlay([sorted[i], sorted[i-1]], lastPlay)) return [sorted[i], sorted[i-1]];
      }
    }
  }

  // Try bombs (as a last resort)
  for (let i = sorted.length - 1; i > 2; i--) {
    const potentialBomb = sorted.slice(i - 3, i + 1);
    if (potentialBomb.length === 4 && potentialBomb.every(c => c.rank === potentialBomb[0].rank)) {
      if (canPlay(potentialBomb, lastPlay)) return potentialBomb;
    }
  }

  // Pass
  return null;
};
