import type { PieceSymbol, Color, Move as ChessJSMove } from 'chess.js';

export type PieceType = 
  'wP' | 'wN' | 'wB' | 'wR' | 'wQ' | 'wK' |
  'bP' | 'bN' | 'bB' | 'bR' | 'bQ' | 'bK';

export interface CustomModelData {
  file: string | null;
  fileName?: string;
  rotation?: [number, number, number];
  yOffset?: number;
}

export type CustomModels = {
  [key in PieceType]?: CustomModelData;
};

export interface Move {
    piece: PieceSymbol;
    from: string;
    to: string;
    color: Color;
}

export interface GameState {
    fen: string;
    history: ChessJSMove[];
    customModels: CustomModels;
}