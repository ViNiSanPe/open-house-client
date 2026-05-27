import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

type ButtonVariant = 'primary' | 'secondary';
type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  readonly label = input('Botão');
  readonly variant = input<ButtonVariant>('primary');
  readonly type = input<ButtonType>('button');
  readonly disabled = input(false);
  readonly isLoading = input(false);
  readonly pressed = output<void>();

  protected handleClick(): void {
    if (!this.isLoading() && !this.disabled()) {
      this.pressed.emit();
    }
  }
}
