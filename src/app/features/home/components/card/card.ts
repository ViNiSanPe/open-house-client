import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Card {
  readonly padded = input(true);
}
