export function shuffleArray<T>(array: T[]): T[] {    
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function getDifficultColor(difficulty: number): string {
    if (difficulty > Difficulty.Easy) return DifficultyColor.Medium;
    return DifficultyColor.Easy;
}

enum Difficulty {
    Easy = 1,
    Medium = 2,
    Hard = 3
}

enum DifficultyColor {
    Easy = "accent",
    Medium = "secondary",
    Hard = "destructive"
}