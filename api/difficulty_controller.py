class DifficultyController:
    def __init__(self):
        self.levels = ["Easy", "Medium", "Hard"]

    def adjust_difficulty(self, current_difficulty, score):
        if current_difficulty not in self.levels:
            return "Easy"
        
        idx = self.levels.index(current_difficulty)
        new_idx = idx
        
        # Increase difficulty if score is high
        if score >= 8:
            new_idx = min(idx + 1, len(self.levels) - 1)
        # Decrease difficulty if score is low
        elif score <= 4:
            new_idx = max(idx - 1, 0)
            
        return self.levels[new_idx]