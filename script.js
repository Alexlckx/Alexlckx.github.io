import pygame
import random

# Initialize Pygame
pygame.init()

# Constants
SCREEN_WIDTH = 300
SCREEN_HEIGHT = 530
GRID_SIZE = 30
GRID_WIDTH = SCREEN_WIDTH // GRID_SIZE
GRID_HEIGHT = SCREEN_HEIGHT // GRID_SIZE
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GRAY = (128, 128, 128)
TETROMINOES = {
    'I': [
        [(1,), (1,), (1,), (1,)]
    ],
    'J': [
        [(1, 0), (1, 1), (1,)]
    ],
    'L': [
        [(0, 1), (0, 1), (1, 1)]
    ],
    'O': [
        [(1, 1), (1, 1)]
    ],
    'S': [
        [(0, 1, 1), (1, 1, 0)]
    ],
    'T': [
        [(0, 1, 0), (1, 1, 1)]
    ],
    'Z': [
        [(1, 1, 0), (0, 1, 1)]
    ]
}
TETROMINO_COLORS = {
    'I': (0, 255, 255),
    'J': (0, 0, 255),
    'L': (255, 128, 0),
    'O': (255, 255, 0),
    'S': (0, 255, 0),
    'T': (128, 0, 128),
    'Z': (255, 0, 0)
}


def create_block():
    block_type = random.choice(list(TETROMINOES.keys()))
    rotation = random.randint(0, len(TETROMINOES[block_type]) - 1)
    x = (GRID_WIDTH - len(TETROMINOES[block_type][rotation][0])) // 2
    y = 0
    return {
        'type': block_type,
        'rotation': rotation,
        'x': x,
        'y': y
    }


def draw_block(screen, block):
    block_type = block['type']
    rotation = block['rotation']
    x = block['x']
    y = block['y']
    for i, row in enumerate(TETROMINOES[block_type][rotation]):
        for j, cell in enumerate(row):
            if cell:
                pygame.draw.rect(screen, TETROMINO_COLORS[block_type],
                                 (x * GRID_SIZE + j * GRID_SIZE, y * GRID_SIZE + i * GRID_SIZE, GRID_SIZE, GRID_SIZE))
                pygame.draw.rect(screen, BLACK,
                                 (x * GRID_SIZE + j * GRID_SIZE, y * GRID_SIZE + i * GRID_SIZE, GRID_SIZE, GRID_SIZE), 1)


def main():
    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    clock = pygame.time.Clock()

    current_block = create_block()
    grid = [[0] * GRID_WIDTH for _ in range(GRID_HEIGHT)]

    fall_time = 0
    fall_speed = 0.5  # Adjust the speed here
    score = 0

    game_over = False

    while not game_over:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                return
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_LEFT:
                    current_block['x'] -= 1
                    if is_collision(current_block, grid):
                        current_block['x'] += 1
                elif event.key == pygame.K_RIGHT:
                    current_block['x'] += 1
                    if is_collision(current_block, grid):
                        current_block['x'] -= 1
                elif event.key == pygame.K_DOWN:
                    current_block['y'] += 1
                    if is_collision(current_block, grid):
                        current_block['y'] -= 1
                        merge_block(current_block, grid)
                        current_block = create_block()
                        remove_full_rows(grid)
                        score += 1
                        if is_collision(current_block, grid):
                            game_over = True

        screen.fill(BLACK)
        draw_grid(screen, grid)
        draw_block(screen, current_block)
        pygame.display.flip()

        # Automatic block falling
        fall_time += clock.get_rawtime()
        clock.tick()
        if fall_time / 1000 > fall_speed:
            current_block['y'] += 1
            if is_collision(current_block, grid):
                current_block['y'] -= 1
                merge_block(current_block, grid)
                current_block = create_block()
                remove_full_rows(grid)
                score += 1
                if is_collision(current_block, grid):
                    game_over = True
            fall_time = 0

        if game_over:
            game_over_screen(screen)
            pygame.quit()
            return


def is_collision(block, grid):
    block_type = block['type']
    rotation = block['rotation']
    x = block['x']
    y = block['y']
    for i, row in enumerate(TETROMINOES[block_type][rotation]):
        for j, cell in enumerate(row):
            if cell:
                # Check if the block is outside the grid boundaries or if there's already a block in the grid cell
                if (x + j < 0 or x + j >= GRID_WIDTH or y + i >= GRID_HEIGHT or grid[y + i][x + j]):
                    return True
    return False


def merge_block(block, grid):
    block_type = block['type']
    rotation = block['rotation']
    x = block['x']
    y = block['y']
    for i, row in enumerate(TETROMINOES[block_type][rotation]):
        for j, cell in enumerate(row):
            if cell:
                grid[y + i][x + j] = block_type


def draw_grid(screen, grid):
    for i in range(GRID_WIDTH):
        for j in range(GRID_HEIGHT):
            if grid[j][i]:
                pygame.draw.rect(screen, TETROMINO_COLORS[grid[j][i]],
                                 (i * GRID_SIZE, j * GRID_SIZE, GRID_SIZE, GRID_SIZE))
                pygame.draw.rect(screen, BLACK,
                                 (i * GRID_SIZE, j * GRID_SIZE, GRID_SIZE, GRID_SIZE), 1)
            else:
                pygame.draw.rect(screen, GRAY,
                                 (i * GRID_SIZE, j * GRID_SIZE, GRID_SIZE, GRID_SIZE), 1)


def remove_full_rows(grid):
    full_rows = []
    for i in range(len(grid)):
        if all(grid[i]):
            full_rows.append(i)

    for row in full_rows:
        del grid[row]
        grid.insert(0, [0] * GRID_WIDTH)


def game_over_screen(screen):
    font = pygame.font.Font(None, 36)
    text = font.render("Game Over!", True, WHITE)
    text_rect = text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2))
    screen.blit(text, text_rect)
    pygame.display.flip()
    pygame.time.wait(2000)


if __name__ == "__main__":
    main()
