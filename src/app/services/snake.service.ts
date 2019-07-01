import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { combineLatest } from "rxjs";
import { Coord, BoardDirection } from "../types";

@Injectable({
  providedIn: "root"
})
export class SnakeService {
  boardSize = 20;
  private _isPlaying = true;
  private _coords: BehaviorSubject<Coord[]> = new BehaviorSubject([
    [3, 3],
    [3, 4],
    [3, 5]
  ]);
  private _currentDirection: BehaviorSubject<
    BoardDirection
  > = new BehaviorSubject("L");
  private _target: BehaviorSubject<Coord> = new BehaviorSubject(
    this.getNewTarget()
  );
  currentDirection: Observable<
    BoardDirection
  > = this._currentDirection.asObservable();
  board$: Observable<string[][]> = combineLatest(
    this._coords.pipe(
      map(coords =>
        coords.reduce(
          (board, [x, y]) => {
            board[x][y] = "o";
            return board;
          },
          Array(this.boardSize)
            .fill(null)
            .map(() => Array(this.boardSize).fill(""))
        )
      )
    ),
    this._target
  ).pipe(
    map(([coords, [targetX, targetY]]) => {
      coords[targetX][targetY] = "X";
      return coords;
    })
  );

  private getNewCoords(coord: Coord, direction: BoardDirection): Coord {
    const [x, y] = coord;
    switch (direction) {
      case "U":
        return x === 0 ? [this.boardSize - 1, y] : [x - 1, y];
      case "D":
        return x === this.boardSize - 1 ? [0, y] : [x + 1, y];
      case "L":
        return y === 0 ? [x, this.boardSize - 1] : [x, y - 1];
      case "R":
        return y === this.boardSize - 1 ? [x, 0] : [x, y + 1];
      default:
        return coord;
    }
  }

  private onSnake(x: number, y: number): boolean {
    const coords = this._coords.getValue();
    return coords.some(coord => coord[0] === x && coord[1] === y);
  }

  private getNewTarget(): Coord {
    let xCoord = Math.floor(Math.random() * this.boardSize);
    let yCoord = Math.floor(Math.random() * this.boardSize);

    while (this.onSnake(xCoord, yCoord)) {
      xCoord = Math.floor(Math.random() * this.boardSize);
      yCoord = Math.floor(Math.random() * this.boardSize);
    }

    return [xCoord, yCoord];
  }

  setDirection(direction: BoardDirection) {
    direction = this.getDirection(direction);
    this._currentDirection.next(direction);
  }

  private getDirection(direction: BoardDirection): BoardDirection {
    const opposites = {
      L: "R",
      R: "L",
      U: "D",
      D: "U"
    };

    const currentDirection = this._currentDirection.getValue();
    if (direction === opposites[currentDirection]) {
      return currentDirection;
    }

    return direction;
  }

  private endGame() {
    this._isPlaying = false;
    let playAgain = confirm("Game Over! Play again?");
    if (playAgain) {
      window.location.reload();
    } else {
      this._coords.complete();
      this._currentDirection.complete();
    }
  }

  move(direction: BoardDirection) {
    if (this._isPlaying) {
      this._currentDirection.next(direction);
      const coords = this._coords.getValue();
      const target = this._target.getValue();

      const nextHead = this.getNewCoords(coords[0], direction);

      if (nextHead[0] === target[0] && nextHead[1] === target[1]) {
        coords.unshift(target);
        this._coords.next(coords);
        this._target.next(this.getNewTarget());
      } else if (this.onSnake(nextHead[0], nextHead[1])) {
        this.endGame();
      } else {
        this._coords.next(
          coords.map((coord, i) =>
            i === 0 ? this.getNewCoords(coord, direction) : coords[i - 1]
          )
        );
      }
    }
  }
}
