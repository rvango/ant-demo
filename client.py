import grpc
import asyncio
import ant_game_pb2
import ant_game_pb2_grpc


class AntGameClient:
    def __init__(self):
        self.player_id = None
        self.channel = grpc.aio.insecure_channel('localhost:50051')
        self.stub = ant_game_pb2_grpc.AntGameServiceStub(self.channel)

    async def list_games(self):
        games = await self.stub.ShowGames(ant_game_pb2.Empty())
        for game in games.games:
            print(
                f"Game ID: {game.id}, Name: {game.name}, Players: {len(game.players)}, State: {ant_game_pb2.State.Name(game.state)}")

    async def connect_to_game(self, game_id):
        response = await self.stub.Connect(ant_game_pb2.Game(id=game_id))
        self.player_id = response.playerId
        print(f"Connected to game with Player ID: {self.player_id}")

    async def get_world_state(self):
        response = await self.stub.GetWorld(ant_game_pb2.Player(playerId=self.player_id))
        self.print_world_state(response)

    async def send_moves(self, moves):
        move_list = ant_game_pb2.MoveList(moves=[ant_game_pb2.Move(direction=move) for move in moves])
        response = await self.stub.SendMoves(move_list)
        self.print_world_state(response)

    def print_world_state(self, world):
        print(f"World state: Width: {world.width}, Height: {world.height}")
        for ant in world.ants:
            print(
                f"Ant - Player ID: {ant.playerId}, X: {ant.x}, Y: {ant.y}, Direction: {ant_game_pb2.Direction.Name(ant.direction)}, Food: {ant.food}")
        for food in world.food:
            print(f"Food - X: {food.x}, Y: {food.y}")
        for obstacle in world.obstacles:
            print(f"Obstacle - X: {obstacle.x}, Y: {obstacle.y}")
        print(f"Age: {world.age}")


async def main():
    client = AntGameClient()
    await client.list_games()
    game_id = int(input("Enter game ID to connect: "))
    await client.connect_to_game(game_id)

    while True:
        print("\n1. Get world state\n2. Send moves\n3. Exit")
        choice = int(input("Enter your choice: "))
        if choice == 1:
            await client.get_world_state()
        elif choice == 2:
            moves = input(
                "Enter moves (comma-separated directions as numbers, e.g., 0 for NORTH, 1 for EAST, 2 for SOUTH, 3 for WEST): ")
            moves = list(map(int, moves.split(',')))
            await client.send_moves(moves)
        elif choice == 3:
            break
        else:
            print("Invalid choice. Please try again.")


if __name__ == '__main__':
    asyncio.run(main())
