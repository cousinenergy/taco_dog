import React, { useState, useEffect, useRef, useCallback } from 'react';
import './GameBoard.css';
import Pepperoni from './icons/Pepperoni';
import Mushroom from './icons/Mushroom';
import Olive from './icons/Olive';
import BellPepper from './icons/BellPepper';

const GRID_SIZE = 7;
const PIECES = [
  { type: 'pepperoni', Icon: Pepperoni },
  { type: 'mushroom', Icon: Mushroom },
  { type: 'olive', Icon: Olive },
  { type: 'bell-pepper', Icon: BellPepper },
];

const getRandomPiece = () => PIECES[Math.floor(Math.random() * PIECES.length)];

const GamePiece = ({ piece, onClick, size, isSelected }) => {
  const Icon = piece.Icon;
  return (
    <div 
      className={`game-piece ${isSelected ? 'selected' : ''}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
      }}
      onClick={onClick}
    >
      <Icon />
    </div>
  );
};

const GameBoard = () => {
  const [board, setBoard] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [pieceSize, setPieceSize] = useState(40);
  const boardRef = useRef(null);

  useEffect(() => {
    const newBoard = Array(GRID_SIZE).fill().map(() => 
      Array(GRID_SIZE).fill().map(() => getRandomPiece())
    );
    setBoard(newBoard);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (boardRef.current) {
        const smallestDimension = Math.min(window.innerWidth, window.innerHeight);
        const maxBoardSize = smallestDimension * 0.8;
        const newPieceSize = Math.floor(maxBoardSize / GRID_SIZE);
        setPieceSize(newPieceSize);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const checkForMatches = useCallback((board) => {
    const matches = new Set();

    // Check horizontal matches
    for (let row = 0; row < GRID_SIZE; row++) {
      let count = 1;
      for (let col = 1; col < GRID_SIZE; col++) {
        if (board[row][col].type === board[row][col-1].type) {
          count++;
          if (count >= 7) {
            for (let i = 0; i < 7; i++) {
              matches.add(`${row},${col-i}`);
            }
          }
        } else {
          count = 1;
        }
      }
    }

    // Check vertical matches
    for (let col = 0; col < GRID_SIZE; col++) {
      let count = 1;
      for (let row = 1; row < GRID_SIZE; row++) {
        if (board[row][col].type === board[row-1][col].type) {
          count++;
          if (count >= 7) {
            for (let i = 0; i < 7; i++) {
              matches.add(`${row-i},${col}`);
            }
          }
        } else {
          count = 1;
        }
      }
    }

    return matches;
  }, []);

  const [matchedPieces, setMatchedPieces] = useState(new Set());
  const [fallingPieces, setFallingPieces] = useState(new Set());

  const handleMatches = useCallback((matches) => {
    setMatchedPieces(matches);
    setTimeout(() => {
      setBoard(prevBoard => {
        const newBoard = prevBoard.map(row => [...row]);
        
        // Remove matched pieces
        matches.forEach(match => {
          const [row, col] = match.split(',').map(Number);
          newBoard[row][col] = null;
        });

        // Mark pieces as falling
        const falling = new Set();
        for (let col = 0; col < GRID_SIZE; col++) {
          let emptyRow = GRID_SIZE - 1;
          for (let row = GRID_SIZE - 1; row >= 0; row--) {
            if (newBoard[row][col] !== null) {
              if (emptyRow !== row) {
                falling.add(`${emptyRow},${col}`);
              }
              newBoard[emptyRow][col] = newBoard[row][col];
              if (emptyRow !== row) {
                newBoard[row][col] = null;
              }
              emptyRow--;
            }
          }
        }
        setFallingPieces(falling);

        // Fill empty spaces with new pieces
        for (let row = 0; row < GRID_SIZE; row++) {
          for (let col = 0; col < GRID_SIZE; col++) {
            if (newBoard[row][col] === null) {
              newBoard[row][col] = getRandomPiece();
              falling.add(`${row},${col}`);
            }
          }
        }

        setTimeout(() => {
          setMatchedPieces(new Set());
          setFallingPieces(new Set());
        }, 500);

        return newBoard;
      });
    }, 500);
  }, []);

  const handlePieceClick = useCallback((row, col) => {
    if (!selectedPiece) {
      setSelectedPiece({ row, col });
    } else {
      const isAdjacent = 
        (Math.abs(selectedPiece.row - row) === 1 && selectedPiece.col === col) ||
        (Math.abs(selectedPiece.col - col) === 1 && selectedPiece.row === row);

      if (isAdjacent) {
        setBoard(prevBoard => {
          const newBoard = prevBoard.map(row => [...row]);
          const temp = newBoard[selectedPiece.row][selectedPiece.col];
          newBoard[selectedPiece.row][selectedPiece.col] = newBoard[row][col];
          newBoard[row][col] = temp;
          
          // Check for matches after swapping
          const matches = checkForMatches(newBoard);
          if (matches.size > 0) {
            setTimeout(() => handleMatches(matches), 300); // Delay to allow animation
          }
          
          return newBoard;
        });
        setSelectedPiece(null);
      } else {
        setSelectedPiece({ row, col });
      }
    }
  }, [selectedPiece, checkForMatches, handleMatches]);

  return (
    <div className="retro-container">
      <div className="retro-screen">
        <div 
          ref={boardRef}
          className="game-board" 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${pieceSize}px)`, 
            gap: '2px',
            padding: '10px',
          }}
        >
          {board.map((row, rowIndex) => 
            row.map((piece, colIndex) => (
              <div key={`${rowIndex}-${colIndex}`} className="piece-container">
                <GamePiece
                  piece={piece}
                  onClick={() => handlePieceClick(rowIndex, colIndex)}
                  size={pieceSize - 4}
                  isSelected={selectedPiece && selectedPiece.row === rowIndex && selectedPiece.col === colIndex}
                  isMatched={matchedPieces.has(`${rowIndex},${colIndex}`)}
                  isFalling={fallingPieces.has(`${rowIndex},${colIndex}`)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;