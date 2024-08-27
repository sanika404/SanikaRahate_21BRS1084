const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

let gameState = {
    board: Array(5).fill(null).map(() => Array(5).fill(null)), //5x5 array
    players: {}, 
    currentPlayer: null, //turncheck
    winner: null 
};

//to reset the game or restart
const resetGameState = () => {
    gameState.board = Array(5).fill(null).map(() => Array(5).fill(null));
    gameState.players = {};
    gameState.currentPlayer = null;
    gameState.winner = null;
};

//game logic to move in matrix
const processMove = (player, move) => {
    const [character, direction] = move.split(':');
    if (!gameState.players[player] || !gameState.players[player][character]) {
        return { valid: false, message: 'invalid character' };
    }

    let { x, y } = gameState.players[player][character];
    const moveMapping = {
        'P': { L: [0, -1], R: [0, 1], F: [-1, 0], B: [1, 0] }, // Pawn
        'H1': { L: [0, -2], R: [0, 2], F: [-2, 0], B: [2, 0] }, // Hero1
        'H2': { FL: [-2, -2], FR: [-2, 2], BL: [2, -2], BR: [2, 2] } // Hero2
    };

    const [dx, dy] = moveMapping[character[0]][direction];
    const newX = x + dx;
    const newY = y + dy;

//validity checking whether it is going out of bounds which is not allowed
    if (newX < 0 || newX >= 5 || newY < 0 || newY >= 5) {
        return { valid: false, message: 'invalid move. out of bounds.' };
    }

    const targetPiece = gameState.board[newX][newY];
    if (targetPiece && targetPiece.player === player) {
        return { valid: false, message: 'invalid move. cannot capture your own piece.' };
    }
    //need to check for valid path for hero1 and hero2, if there is another piece of ours then it can go there 
    if (character[0] === 'H1' || character[0] === 'H2') {
        const path = getPath(character[0], direction, x, y);
        for (const [px, py] of path) {
            if (px < 0 || px >= 5 || py < 0 || py >= 5) {
                return { valid: false, message: 'invalid move. out of bounds.' };
            }
            if (gameState.board[px][py] && gameState.board[px][py].player === player) {
                return { valid: false, message: 'invalid move. cannot capture your own piece.' };
            }
        }
    }

    if (targetPiece && targetPiece.player !== player) {
        delete gameState.players[targetPiece.player][targetPiece.character];
    }

    // update board and pos
    gameState.board[x][y] = null;
    gameState.board[newX][newY] = { player, character };
    gameState.players[player][character] = { x: newX, y: newY };

    return { valid: true };
};

const getPath = (type, direction, startX, startY) => {
    const path = [];
    const moveMapping = {
        'H1': { L: [[0, -1], [0, -2]], R: [[0, 1], [0, 2]], F: [[-1, 0], [-2, 0]], B: [[1, 0], [2, 0]] },
        'H2': { FL: [[-1, -1], [-2, -2]], FR: [[-1, 1], [-2, 2]], BL: [[1, -1], [2, -2]], BR: [[1, 1], [2, 2]] }
    };

    const steps = moveMapping[type][direction];
    for (const [dx, dy] of steps) {
        const newX = startX + dx;
        const newY = startY + dy;
        path.push([newX, newY]);
    }
    return path;
};

//check who is winnner
const checkWinner = () => {
    const playerA = Object.keys(gameState.players.A || {}).length === 0;
    const playerB = Object.keys(gameState.players.B || {}).length === 0;

    if (playerA) {
        gameState.winner = 'B';
    } else if (playerB) {
        gameState.winner = 'A';
    }
};

server.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        switch (data.type) {
            case 'join':
                if (!gameState.players.A) {
                    gameState.players.A = data.characters;
                    gameState.currentPlayer = 'A';
                } else if (!gameState.players.B) {
                    gameState.players.B = data.characters;
                }

                //initiaal position
                Object.keys(data.characters).forEach((char, index) => {
                    const row = gameState.players.A ? 0 : 4;
                    gameState.players[data.player][char] = { x: row, y: index };
                    gameState.board[row][index] = { player: data.player, character: char };
                });

                ws.send(JSON.stringify({ type: 'state', gameState }));
                break;

            case 'move':
                if (gameState.currentPlayer !== data.player || gameState.winner) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Invalid turn or game over' }));
                    break;
                }

                const result = processMove(data.player, data.move);
                if (!result.valid) {
                    ws.send(JSON.stringify({ type: 'error', message: result.message }));
                } else {
                    checkWinner();
                    gameState.currentPlayer = gameState.currentPlayer === 'A' ? 'B' : 'A';

                    server.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({ type: 'state', gameState }));
                        }
                    });
                }
                break;

            case 'reset':
                resetGameState();
                server.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'state', gameState }));
                    }
                });
                break;

            default:
                ws.send(JSON.stringify({ type: 'error', message: 'Unknown command' }));
                break;
        }
    });
});

console.log('WebSocket server is running on ws://localhost:8080');