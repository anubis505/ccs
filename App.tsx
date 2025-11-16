

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Chess, Square, Piece, PieceSymbol, Color } from 'chess.js';
import ChessScene from './components/ChessScene';
import Sidebar from './components/Sidebar';
import type { CustomModels, GameState, Move, PieceType } from './types';
import { INITIAL_MODELS } from './constants';
import { fileToBase64, base64ToFile } from './utils/fileUtils';

export default function App() {
  const [game, setGame] = useState(new Chess());
  const [history, setHistory] = useState<Move[]>([]);
  const [customModels, setCustomModels] = useState<CustomModels>(INITIAL_MODELS);
  const [isOrbitEnabled, setIsOrbitEnabled] = useState(true);
  const [lightIntensity, setLightIntensity] = useState(1);
  
  const moves = useMemo(() => game.history({ verbose: true }), [game]);
  const gameKey = useRef(0);

  const updateGame = useCallback((newGame: Chess) => {
    setGame(newGame);
    const newHistory = newGame.history({ verbose: true }).map(move => ({
      piece: `${move.piece}` as PieceSymbol,
      from: move.from,
      to: move.to,
      color: move.color as Color,
    }));
    setHistory(newHistory);
  }, []);

  const onMove = (from: Square, to: Square): boolean => {
    const gameCopy = new Chess(game.fen());
    try {
      const move = gameCopy.move({ from, to, promotion: 'q' });
      if (move) {
        updateGame(gameCopy);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Invalid move:", e);
      return false;
    }
  };

  const handleReset = useCallback(() => {
    const newGame = new Chess();
    updateGame(newGame);
    gameKey.current += 1; // Force re-mount of ChessScene to reset piece positions
  }, [updateGame]);

  const handleUndo = useCallback(() => {
    const moves = game.history();
    if (moves.length === 0) {
      return; // No moves to undo
    }

    const newGame = new Chess();
    // Replay all moves except the last one
    for (let i = 0; i < moves.length - 1; i++) {
      newGame.move(moves[i]);
    }
    
    updateGame(newGame);
    gameKey.current += 1; // Force re-render to correctly place pieces (e.g. captures)
  }, [game, updateGame]);

  const handleToggleView = useCallback(() => {
    setIsOrbitEnabled(prev => !prev);
  }, []);

  const handleLightIntensityChange = useCallback((value: number) => {
    setLightIntensity(value);
  }, []);

  const handleExport = useCallback(async () => {
    const gameState: GameState = {
      fen: game.fen(),
      history: game.history({ verbose: true }),
      customModels: customModels,
    };
    const jsonString = JSON.stringify(gameState, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chessmaster-3d-game.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [game, customModels]);
  
  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          const gameState: GameState = JSON.parse(result);
          const newGame = new Chess(gameState.fen);
          updateGame(newGame);
          setCustomModels(gameState.customModels);
          gameKey.current += 1;
        } catch (error) {
          console.error('Failed to import game state:', error);
          alert('Error: Invalid game file.');
        }
      };
      reader.readAsText(file);
    }
  }, [updateGame]);
  
  const handleModelUpload = useCallback(async (piece: PieceType, file: File) => {
    try {
      const base64 = await fileToBase64(file);
      setCustomModels(prev => ({
        ...prev,
        [piece]: {
          ...(prev[piece] || {}),
          file: base64,
          fileName: file.name
        }
      }));
    } catch (error) {
      console.error("Error loading model:", error);
    }
  }, []);
  
  const handleModelRotationChange = useCallback((piece: PieceType, axis: 'x' | 'y' | 'z', value: number) => {
    setCustomModels(prev => {
        const currentRotation = prev[piece]?.rotation || [0, 0, 0];
        const newRotation = [...currentRotation] as [number, number, number];
        if(axis === 'x') newRotation[0] = value;
        if(axis === 'y') newRotation[1] = value;
        if(axis === 'z') newRotation[2] = value;
        return {
            ...prev,
            [piece]: {
                ...(prev[piece] || {}),
                rotation: newRotation
            }
        }
    });
  }, []);

  const handleModelYOffsetChange = useCallback((piece: PieceType, yOffset: number) => {
    setCustomModels(prev => ({
      ...prev,
      [piece]: {
        ...(prev[piece] || {}),
        yOffset: yOffset
      }
    }));
  }, []);


  const board = useMemo(() => game.board(), [game]);
  const turn = useMemo(() => game.turn(), [game]);

  const customModelCount = Object.keys(customModels).filter(key => customModels[key as PieceType]?.file).length;

  return (
    <div className="flex h-screen w-screen text-gray-200 bg-[#0f172a] overflow-hidden">
      <Sidebar
        turn={turn}
        moves={moves.length}
        customModelCount={customModelCount}
        history={history}
        onReset={handleReset}
        onUndo={handleUndo}
        onToggleView={handleToggleView}
        isOrbitEnabled={isOrbitEnabled}
        onExport={handleExport}
        onImport={handleImport}
        onModelUpload={handleModelUpload}
        onModelRotationChange={handleModelRotationChange}
        onModelYOffsetChange={handleModelYOffsetChange}
        customModels={customModels}
        lightIntensity={lightIntensity}
        onLightIntensityChange={handleLightIntensityChange}
      />
      <main className="flex-1 flex flex-col relative">
        <ChessScene
          key={gameKey.current}
          board={board}
          onMove={onMove}
          turn={turn}
          customModels={customModels}
          isOrbitEnabled={isOrbitEnabled}
          lightIntensity={lightIntensity}
        />
         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/50 text-white py-2 px-4 rounded-lg text-sm backdrop-blur-sm">
          <p className="flex items-center gap-4">
            <span><strong className="font-bold">Arrastra</strong> para rotar</span> • 
            <span><strong className="font-bold">Rueda</strong> para zoom</span> • 
            <span><strong className="font-bold">Click</strong> en pieza para seleccionar</span>
          </p>
          <p className="text-center text-xs text-gray-400 mt-1">Haz click en el tablero para mover las piezas</p>
        </div>
      </main>
    </div>
  );
}