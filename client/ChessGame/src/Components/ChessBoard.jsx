import { useState, useEffect } from 'react';
import '../ChessBoard.css';

const ChessBoard = () => {
    const createEmptyBoard = () => Array.from({ length: 5 }, () => Array(5).fill(null));

    const [board, setBoard] = useState(createEmptyBoard());
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [currentPlayer, setCurrentPlayer] = useState('A');
    const [statusMessage, setStatusMessage] = useState('');
    const [winner, setWinner] = useState(null);

    const setupBoard = () => {
        const startingBoard = createEmptyBoard();
        // Set initial positions for player A
        startingBoard[0][0] = { player: 'A', piece: 'P1' };
        startingBoard[0][1] = { player: 'A', piece: 'P2' };
        startingBoard[0][2] = { player: 'A', piece: 'H1' };
        startingBoard[0][3] = { player: 'A', piece: 'H2' };
        startingBoard[0][4] = { player: 'A', piece: 'P3' };
        // Set initial positions for player B
        startingBoard[4][0] = { player: 'B', piece: 'P1' };
        startingBoard[4][1] = { player: 'B', piece: 'P2' };
        startingBoard[4][2] = { player: 'B', piece: 'H1' };
        startingBoard[4][3] = { player: 'B', piece: 'H2' };
        startingBoard[4][4] = { player: 'B', piece: 'P3' };
        setBoard(startingBoard);
    };

    useEffect(() => {
        setupBoard();
    }, []);

    const selectPiece = (x, y) => {
        const piece = board[x][y];
        if (piece && piece.player === currentPlayer) {
            setSelectedPiece({ x, y, piece });
            setStatusMessage('');
        } else {
            setStatusMessage('Invalid selection. Choose your own piece.');
        }
    };

    const movePiece = (direction) => {
        if (!selectedPiece) {
            setStatusMessage('Select a piece first.');
            return;
        }

        const { x, y, piece } = selectedPiece;
        const [dx, dy] = calculateMovement(piece.piece, direction, currentPlayer);

        const newX = x + dx;
        const newY = y + dy;

        if (newX < 0 || newX >= 5 || newY < 0 || newY >= 5) {
            setStatusMessage('Invalid move. Out of bounds.');
            return;
        }

        const updatedBoard = [...board];
        const targetPiece = updatedBoard[newX][newY];

        if (targetPiece && targetPiece.player === currentPlayer) {
            setStatusMessage('Invalid move. You can’t capture your own piece.');
            return;
        }

        updatedBoard[x][y] = null;
        updatedBoard[newX][newY] = piece;
        setBoard(updatedBoard);
        setSelectedPiece(null);
        checkWinCondition(updatedBoard);
        setCurrentPlayer(currentPlayer === 'A' ? 'B' : 'A');
        setStatusMessage('');
    };

    const calculateMovement = (pieceType, direction, player) => {
        const forward = player === 'A' ? 1 : -1;

        switch (pieceType) {
            case 'P1': 
            case 'P2':
            case 'P3':
                return direction === 'L' ? [0, -1] :
                       direction === 'R' ? [0, 1] :
                       direction === 'F' ? [forward, 0] :
                       direction === 'B' ? [-forward, 0] : [0, 0];
            case 'H1':
                return direction === 'L' ? [0, -2] :
                       direction === 'R' ? [0, 2] :
                       direction === 'F' ? [forward * 2, 0] :
                       direction === 'B' ? [-forward * 2, 0] : [0, 0];
            case 'H2':
                return direction === 'FL' ? [forward * 2, -2] :
                       direction === 'FR' ? [forward * 2, 2] :
                       direction === 'BL' ? [-forward * 2, -2] :
                       direction === 'BR' ? [-forward * 2, 2] : [0, 0];
            default:
                return [0, 0];
        }
    };

    const checkWinCondition = (currentBoard) => {
        const playerACount = currentBoard.flat().filter(cell => cell?.player === 'A').length;
        const playerBCount = currentBoard.flat().filter(cell => cell?.player === 'B').length;

        if (playerACount === 0) {
            setWinner('B');
        } else if (playerBCount === 0) {
            setWinner('A');
        }
    };

    const restartGame = () => {
        setupBoard();
        setCurrentPlayer('A');
        setStatusMessage('');
        setWinner(null);
    };

    return (
        <center>
        <div>
            <h2>Current Player: {currentPlayer}</h2>
            <hr />
            <p>Click on your piece to select it</p>
            {statusMessage && <p className="message">{statusMessage}</p>}
            <div className="game-board">
                {board.map((row, rowIndex) => (
                    <div key={rowIndex} className="board-row">
                        {row.map((cell, colIndex) => (
                            <div
                                key={colIndex}
                                className={`board-cell ${cell ? 'occupied' : ''}`}
                                onClick={() => selectPiece(rowIndex, colIndex)}
                            >
                                {cell ? `${cell.player}-${cell.piece}` : ''}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            {selectedPiece && (
                <div className="action-controls">
                    {['L', 'R', 'F', 'B'].map((direction) => (
                        <button key={direction} onClick={() => movePiece(direction)}>
                            {direction}
                        </button>
                    ))}
                    {selectedPiece.piece.piece === 'H2' && (
                        <>
                            <button onClick={() => movePiece('FL')}>FL</button>
                            <button onClick={() => movePiece('FR')}>FR</button>
                            <button onClick={() => movePiece('BL')}>BL</button>
                            <button onClick={() => movePiece('BR')}>BR</button>
                        </>
                    )}
                </div>
            )}
            {winner && (
                <div className="victory-modal">
                    <div className="victory-content">
                        <h2>Player {winner} Wins!</h2>
                        <button onClick={restartGame}>Reset Game</button>
                    </div>
                </div>
            )}
        </div>
        </center>
    );
};

export default ChessBoard;
