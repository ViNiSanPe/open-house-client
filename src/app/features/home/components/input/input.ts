import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-input',
  imports: [],
  templateUrl: './input.html',
  styleUrl: './input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Input {
  readonly label = input('');
  readonly placeholder = input('');
  readonly type = input('text');
  readonly error = input('');
  readonly disabled = input(false);
  readonly required = input(false);
  readonly value = input('');
  readonly autocomplete = input('');

  readonly valueChange = output<string>();
  readonly touched = output<void>();

  protected readonly inputId = `input-${Math.random().toString(36).slice(2, 11)}`;

  protected onInputChange(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }

  protected onInputBlur(): void {
    this.touched.emit();
  }
}
