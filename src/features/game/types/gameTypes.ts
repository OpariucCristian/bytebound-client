  export enum BattleActionEnum {
    IDLE = "idle",
    PLAYER_ATTACK = "player-attack",
    ENEMY_ATTACK = "enemy-attack",
    ENEMY_WIN = "enemy-win",
    START_GAME = "start-game",
    DIFFICULTY_CHANGE = "difficulty-change",
  }

  export type BattleAction = BattleActionEnum;
