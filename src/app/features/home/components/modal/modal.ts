import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal {
  readonly labelledBy = input.required<string>();
  readonly close = output<void>();

  protected closeModal(): void {
    this.close.emit();
  }
}
