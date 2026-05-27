import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type InfoIcon = 'map-pin' | 'calendar' | 'pizza' | 'heart';

@Component({
  selector: 'app-info-row',
  imports: [],
  templateUrl: './info-row.html',
  styleUrl: './info-row.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoRow {
  readonly label = input('');
  readonly value = input('');
  readonly icon = input<InfoIcon>('map-pin');
}
