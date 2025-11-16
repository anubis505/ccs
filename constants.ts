import type { PieceType, CustomModels } from "./types";
import type { PieceSymbol } from "chess.js";

export const PIECE_TYPES: { id: PieceType, name: string }[] = [
    { id: 'wP', name: 'Peón Blanco' },
    { id: 'wN', name: 'Caballo Blanco' },
    { id: 'wB', name: 'Alfil Blanco' },
    { id: 'wR', name: 'Torre Blanca' },
    { id: 'wQ', name: 'Reina Blanca' },
    { id: 'wK', name: 'Rey Blanco' },
    { id: 'bP', name: 'Peón Negro' },
    { id: 'bN', name: 'Caballo Negro' },
    { id: 'bB', name: 'Alfil Negro' },
    { id: 'bR', name: 'Torre Negra' },
    { id: 'bQ', name: 'Reina Negra' },
    { id: 'bK', name: 'Rey Negro' },
];

export const INITIAL_MODELS: CustomModels = PIECE_TYPES.reduce((acc, piece) => {
    acc[piece.id] = { file: null, rotation: [0, 0, 0], yOffset: 0 };
    return acc;
}, {} as CustomModels);

export const PIECE_NAMES: { [key in PieceSymbol]: string } = {
    p: 'Peón',
    n: 'Caballo',
    b: 'Alfil',
    r: 'Torre',
    q: 'Reina',
    k: 'Rey',
};