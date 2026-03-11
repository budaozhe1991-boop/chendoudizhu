import React, { useState, useEffect, useCallback } from 'react';
import { Card as CardType, Player, GameState, PlayResult } from './types';
import { createDeck, sortCards, canPlay, analyzeCards } from './logic/gameLogic';
import { getAIAction } from './logic/ai';
import Card from './components/Card';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, User, Cpu, Play, SkipForward, RefreshCw } from 'lucide-react';

const INITIAL_STATE: GameState = {
  players: [
    { id: 0, name: '你', role: 'peasant', hand: [], isAI: false },
    { id: 1, name: '电脑 1', role: 'peasant', hand: [], isAI: true },
    { id: 2, name: '电脑 2', role: 'peasant', hand: [], isAI: true },
  ],
  currentPlayerIndex: 0,
  lastPlay: null,
  winner: null,
  phase: 'lobby',
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const [passCount, setPassCount] = useState(0);

  const dealCards = useCallback(() => {
    const deck = createDeck();
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    
    // Randomly pick landlord
    const landlordIndex = Math.floor(Math.random() * 3);
    
    const newPlayers = gameState.players.map((p, i) => {
      const role = i === landlordIndex ? 'landlord' : 'peasant';
      const count = role === 'landlord' ? 20 : 16;
      const hand = sortCards(shuffled.splice(0, count));
      return { ...p, role, hand };
    });

    setGameState({
      ...gameState,
      players: newPlayers,
      currentPlayerIndex: landlordIndex,
      phase: 'playing',
      lastPlay: null,
      winner: null,
    });
    setPassCount(0);
    setSelectedCards([]);
  }, [gameState.players]);

  useEffect(() => {
    if (gameState.phase === 'dealing') {
      dealCards();
    }
  }, [gameState.phase, dealCards]);

  const handlePlay = (cards: CardType[]) => {
    const player = gameState.players[gameState.currentPlayerIndex];
    const result = canPlay(cards, gameState.lastPlay);

    if (result) {
      const newHand = player.hand.filter(c => !cards.find(sc => sc.id === c.id));
      const newPlayers = [...gameState.players];
      newPlayers[gameState.currentPlayerIndex] = { ...player, hand: newHand };

      if (newHand.length === 0) {
        setGameState({
          ...gameState,
          players: newPlayers,
          winner: gameState.currentPlayerIndex,
          phase: 'gameOver',
        });
        return;
      }

      setGameState({
        ...gameState,
        players: newPlayers,
        lastPlay: { cards, result, playerIndex: gameState.currentPlayerIndex },
        currentPlayerIndex: (gameState.currentPlayerIndex + 1) % 3,
      });
      setPassCount(0);
      setSelectedCards([]);
    }
  };

  const handlePass = () => {
    const nextPassCount = passCount + 1;
    const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % 3;
    
    // If two people passed, the next person starts a new round
    if (nextPassCount >= 2) {
      setGameState({
        ...gameState,
        lastPlay: null,
        currentPlayerIndex: nextPlayerIndex,
      });
      setPassCount(0);
    } else {
      setGameState({
        ...gameState,
        currentPlayerIndex: nextPlayerIndex,
      });
      setPassCount(nextPassCount);
    }
    setSelectedCards([]);
  };

  const handleHint = () => {
    const hintCards = getAIAction(
      gameState.players[0].hand,
      gameState.lastPlay,
      0
    );
    if (hintCards) {
      setSelectedCards(hintCards);
    } else {
      // If no hint, maybe just pass or show a message
      handlePass();
    }
  };

  // AI Turn Logic
  useEffect(() => {
    if (gameState.phase === 'playing' && gameState.players[gameState.currentPlayerIndex].isAI && gameState.winner === null) {
      const timer = setTimeout(() => {
        const aiCards = getAIAction(
          gameState.players[gameState.currentPlayerIndex].hand,
          gameState.lastPlay,
          gameState.currentPlayerIndex
        );

        if (aiCards) {
          handlePlay(aiCards);
        } else {
          handlePass();
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayerIndex, gameState.phase, gameState.lastPlay, gameState.players, gameState.winner]);

  const toggleCardSelection = (card: CardType) => {
    if (gameState.currentPlayerIndex !== 0) return;
    
    setSelectedCards(prev => 
      prev.find(c => c.id === card.id) 
        ? prev.filter(c => c.id !== card.id)
        : [...prev, card]
    );
  };

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = gameState.currentPlayerIndex === 0 && gameState.phase === 'playing';

  if (gameState.phase === 'lobby') {
    return (
      <div className="min-h-screen bg-emerald-900 text-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="z-10 text-center"
        >
          <div className="mb-8 relative inline-block">
            <h1 className="text-7xl sm:text-9xl font-black italic tracking-tighter text-yellow-400 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
              chenyang
            </h1>
            <div className="absolute -bottom-4 right-0 bg-white text-emerald-900 px-4 py-1 font-bold text-2xl transform rotate-3 shadow-lg">
              斗地主
            </div>
          </div>
          
          <p className="text-white/60 text-lg mb-12 max-w-md mx-auto">
            经典三打一扑克游戏，52张牌纯点数对抗。地主20张，农民16张。
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setGameState({ ...gameState, phase: 'dealing' })}
            className="group relative bg-yellow-400 text-emerald-900 px-16 py-6 rounded-2xl font-black text-3xl shadow-[0_10px_0_rgb(202,138,4)] hover:shadow-[0_5px_0_rgb(202,138,4)] hover:translate-y-[5px] active:shadow-none active:translate-y-[10px] transition-all"
          >
            开始游戏
          </motion.button>
        </motion.div>

        {/* Background Cards Decoration */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-10 left-10 rotate-12"><Card card={{suit: 'spades', rank: 15, label: '2', id: '1'} as any} /></div>
          <div className="absolute bottom-20 right-20 -rotate-12"><Card card={{suit: 'hearts', rank: 14, label: 'A', id: '2'} as any} /></div>
          <div className="absolute top-1/2 left-1/4 -rotate-45"><Card card={{suit: 'diamonds', rank: 13, label: 'K', id: '3'} as any} /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-900 text-white font-sans overflow-hidden flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-black/20 backdrop-blur-sm border-b border-white/10">
        <h1 className="text-xl font-bold tracking-tight italic">chenyang斗地主</h1>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm">
            <User size={16} />
            <span>玩家</span>
          </div>
          <button 
            onClick={() => setGameState({ ...gameState, phase: 'lobby' })}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      {/* Game Board */}
      <main className="flex-1 relative p-4 flex flex-col items-center justify-center">
        {/* Opponent 1 (Top Left) */}
        <div className="absolute top-8 left-8 flex flex-col items-center gap-2">
          <div className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center ${gameState.currentPlayerIndex === 1 ? 'border-yellow-400 bg-yellow-400/20 scale-110 shadow-lg' : 'border-white/20 bg-black/20'}`}>
            <Cpu size={40} className={gameState.currentPlayerIndex === 1 ? 'text-yellow-400' : 'text-white/40'} />
            <div className="text-sm font-bold mt-2">电脑 1</div>
            <div className="text-[10px] opacity-60 uppercase tracking-widest">{gameState.players[1].role === 'landlord' ? '地主' : '农民'}</div>
            <div className="mt-3 bg-yellow-400 text-emerald-900 px-3 py-1 rounded-lg font-black text-xl shadow-inner">
              {gameState.players[1].hand.length}
            </div>
          </div>
        </div>

        {/* Opponent 2 (Top Right) */}
        <div className="absolute top-8 right-8 flex flex-col items-center gap-2">
          <div className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center ${gameState.currentPlayerIndex === 2 ? 'border-yellow-400 bg-yellow-400/20 scale-110 shadow-lg' : 'border-white/20 bg-black/20'}`}>
            <Cpu size={40} className={gameState.currentPlayerIndex === 2 ? 'text-yellow-400' : 'text-white/40'} />
            <div className="text-sm font-bold mt-2">电脑 2</div>
            <div className="text-[10px] opacity-60 uppercase tracking-widest">{gameState.players[2].role === 'landlord' ? '地主' : '农民'}</div>
            <div className="mt-3 bg-yellow-400 text-emerald-900 px-3 py-1 rounded-lg font-black text-xl shadow-inner">
              {gameState.players[2].hand.length}
            </div>
          </div>
        </div>

        {/* Central Play Area */}
        <div className="flex flex-col items-center gap-4">
          <AnimatePresence mode="wait">
            {gameState.lastPlay ? (
              <motion.div 
                key={gameState.lastPlay.playerIndex}
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="text-xs uppercase tracking-widest opacity-40 mb-2">
                  {gameState.players[gameState.lastPlay.playerIndex].name} 出牌
                </div>
                <div className="flex -space-x-8">
                  {gameState.lastPlay.cards.map((c) => (
                    <Card key={c.id} card={c} className="shadow-2xl" />
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="h-32 flex items-center justify-center text-white/20 italic">
                {gameState.phase === 'playing' ? '等待出牌...' : ''}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Player Area */}
        <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-6">
          {/* Controls */}
          {isMyTurn && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex gap-4"
            >
              <button
                onClick={handlePass}
                disabled={!gameState.lastPlay}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${!gameState.lastPlay ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20'}`}
              >
                <SkipForward size={20} />
                不出
              </button>
              <button
                onClick={handleHint}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-bold bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/40 transition-all"
              >
                <RefreshCw size={20} />
                提示
              </button>
              <button
                onClick={() => handlePlay(selectedCards)}
                disabled={!canPlay(selectedCards, gameState.lastPlay)}
                className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all shadow-lg ${canPlay(selectedCards, gameState.lastPlay) ? 'bg-yellow-400 text-emerald-900 hover:scale-105 active:scale-95' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
              >
                <Play size={20} />
                出牌
              </button>
            </motion.div>
          )}

          {/* Hand */}
          <div className="flex flex-col items-center gap-2">
            <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 transition-all ${isMyTurn ? 'bg-yellow-400 text-emerald-900 scale-110' : 'bg-black/20 text-white/40'}`}>
              {gameState.players[0].role === 'landlord' ? '地主' : '农民'} • {isMyTurn ? "轮到你出牌" : "等待中..."}
            </div>
            <div className="flex -space-x-8 sm:-space-x-12 px-8">
              {gameState.players[0].hand.map((card) => (
                <Card 
                  key={card.id} 
                  card={card} 
                  selected={!!selectedCards.find(c => c.id === card.id)}
                  onClick={() => toggleCardSelection(card)}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Victory Overlay */}
      <AnimatePresence>
        {gameState.phase === 'gameOver' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-emerald-800 border-2 border-yellow-400 p-12 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-md w-full"
            >
              <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-yellow-400/20">
                <Trophy size={48} className="text-emerald-900" />
              </div>
              <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter italic">
                {gameState.winner === 0 ? '大获全胜!' : '遗憾落败'}
              </h2>
              <p className="text-white/60 mb-8">
                {gameState.players[gameState.winner!].name} ({gameState.players[gameState.winner!].role === 'landlord' ? '地主' : '农民'}) 赢得了比赛！
              </p>
              <button 
                onClick={() => setGameState({ ...gameState, phase: 'lobby' })}
                className="w-full bg-yellow-400 text-emerald-900 py-4 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                返回首页
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none opacity-5 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 border-[40px] border-white rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 border-[40px] border-white rounded-full" />
      </div>
    </div>
  );
}
