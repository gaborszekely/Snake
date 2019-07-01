import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription, timer } from "rxjs";
import { SnakeService } from "src/app/services/snake.service";
import { tap } from "rxjs/operators";

@Component({
  selector: "app-board",
  templateUrl: "./board.component.html",
  styleUrls: ["./board.component.scss"]
})
export class BoardComponent implements OnInit, OnDestroy {
  directionSub: Subscription;
  direction: any;
  speed = 100;

  constructor(private snakeService: SnakeService) {}

  get board$() {
    return this.snakeService.board$;
  }

  ngOnInit() {
    document.addEventListener("keydown", this.move.bind(this));

    this.directionSub = this.snakeService.currentDirection.subscribe(
      direction => {
        this.direction = direction;
      }
    );

    timer(300, this.speed)
      .pipe(tap(() => this.snakeService.move(this.direction)))
      .subscribe();
  }

  ngOnDestroy() {
    document.removeEventListener("keydown", this.move.bind(this));
    this.directionSub.unsubscribe();
  }

  move(e: KeyboardEvent) {
    const directionMap = {
      ArrowLeft: "L",
      ArrowUp: "U",
      ArrowDown: "D",
      ArrowRight: "R"
    };

    if (!Object.keys(directionMap).includes(e.key)) return;

    this.snakeService.setDirection(directionMap[e.key]);
  }

  setSpeed(speed: number) {
    this.speed = speed;
  }
}
