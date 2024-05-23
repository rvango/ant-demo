const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync('ant_game.proto', {});
const antGamePackage = grpc.loadPackageDefinition(packageDefinition).AntGame;

let games = [];
let clients = [];

const server = new grpc.Server();

function createExampleGame() {
  const exampleGame = {
    id: 1,
    name: "Example Game",
    players: [],
    state: antGamePackage.State.WAITING,
    maxPlayers: 1,
    world: {
      width: 10,
      height: 10,
      ants: [
        { playerId: 1, x: 1, y: 1, direction: antGamePackage.Direction.NORTH, food: 0 }
      ],
      food: [
        { x: 5, y: 5 },
        { x: 7, y: 8 }
      ],
      obstacles: [
        { x: 3, y: 3 },
        { x: 6, y: 6 }
      ],
      age : 0
    }
  };
  games.push(exampleGame);
}

function showGames(call, callback) {
  console.log("Listing all games");
  const gameList = games.map(game => ({
    id: game.id,
    name: game.name,
    players: game.players,
    state: game.state
  }));
  callback(null, { games: gameList });
}

function connect(call, callback) {
  const gameID = call.request.id;
  const game = games.find(game => game.id === gameID);
  if (game) {
    if (game.players.length < game.maxPlayers) {
      const playerID = game.players.length + 1;
      game.players.push({ playerId: playerID });
      clients.push({ id: playerID, gameID: gameID, stub: call });
      console.log(`Player ${playerID} connected to game ${gameID}`);
      callback(null, { playerId: playerID });

      if (game.players.length === game.maxPlayers) {
        startGame(gameID);
      } else {
        console.log(`Game ${gameID} waiting for more players`);
        // We should send stream update of game status until it is full and started
      }
    } else {
      console.log(`Game ${gameID} is full`);
      callback(new Error("Game is full"));
    }
  } else {
    console.log(`Game ${gameID} not found`);
    callback(new Error("Game not found"));
  }
}

function startGame(gameID) {
  console.log(`Starting game ${gameID}`);
  const game = games.find(game => game.id === gameID);
  game.state = antGamePackage.State.RUNNING;
  const world = game.world;
  const players = game.players;

  console.log(`Game ${gameID} started with ${players.length} players`);

  setInterval(() => {
    // Game loop logic here
    console.log(`Game ${gameID} running`);

    world.age++;
  }, 1000);
}

function getWorld(call, callback) {
  const playerID = call.request.playerId;
  const client = clients.find(client => client.id === playerID);
  if (client) {
    const game = games.find(game => game.id === client.gameID);
    if (game) {
      callback(null, game.world);
    } else {
      callback(new Error("Game not found"));
    }
  } else {
    callback(new Error("Player not found"));
  }
}

function sendMoves(call, callback) {
  const playerID = call.request.playerId;
  const client = clients.find(client => client.id === playerID);
  if (client) {
    const game = games.find(game => game.id === client.gameID);
    if (game) {
      const moves = call.request.moves;
      // Apply the moves to the game world
      applyMovesToWorld(game.world, moves);
      callback(null, game.world);
    } else {
      callback(new Error("Game not found"));
    }
  } else {
    callback(new Error("Player not found"));
  }
}

function applyMovesToWorld(world, moves) {
  // Update state-of-the-world based on moves
}

createExampleGame();

server.addService(antGamePackage.AntGameService.service, {
  ShowGames: showGames,
  Connect: connect,
  GetWorld: getWorld,
  SendMoves: sendMoves
});

server.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), () => {
  server.start();
  console.log('Server running at http://127.0.0.1:50051');
});
