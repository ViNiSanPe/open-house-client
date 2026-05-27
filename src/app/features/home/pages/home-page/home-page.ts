import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

import { ApiError, Invite } from '../../../../core/models/invite.model';
import { environment } from '../../../../shared/config/environment';
import { InviteService } from '../../../../shared/services/invite.service';
import { Card } from '../../components/card/card';
import { InfoRow } from '../../components/info-row/info-row';
import { Input } from '../../components/input/input';
import { Modal } from '../../components/modal/modal';

type Flow = 'invite' | 'confirm';
type ModalStep = 'idle' | 'email' | 'email-success' | 'confirm' | 'presence-success' | 'error';

@Component({
  selector: 'app-home-page',
  imports: [Modal, Input, Card, InfoRow],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit {
  private readonly inviteService = inject(InviteService);
  private readonly route = inject(ActivatedRoute);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  readonly loading = signal(true);
  readonly invite = signal<Invite | null>(null);
  readonly currentStep = signal<ModalStep>('idle');
  readonly emailValue = signal('');
  readonly emailError = signal('');
  readonly error = signal<string | null>(null);
  readonly isConfirmed = signal(false);
  readonly isSubmitting = signal(false);
  readonly inviteId = signal<string | null>(null);
  readonly flow = signal<Flow>('invite');
  readonly now = signal(new Date());

  readonly eventData = environment.event;

  readonly hasInvite = computed(() => this.invite() !== null);
  readonly isInviteFlow = computed(() => this.flow() === 'invite');
  readonly eventDate = computed(() => this.parseInviteDay(this.invite()?.day));
  readonly eventDateTime = computed(() => {
    const day = this.invite()?.day;
    return this.formatInviteDay(day) ?? `${this.eventData.date} — ${this.eventData.time}`;
  });
  readonly primaryButtonLabel = computed(() => {
    if (this.isInviteFlow()) {
      return this.emailValue() ? 'Atualizar Email' : 'Receber Lembrete';
    }

    if (this.isConfirmed()) {
      return 'Presença Confirmada';
    }

    return 'Confirmar Presença';
  });

  ngOnInit(): void {
    this.flow.set(this.route.snapshot.data?.['flow'] === 'confirm' ? 'confirm' : 'invite');
    this.loadInvite();
  }

  handlePrimaryAction(): void {
    if (this.isInviteFlow()) {
      this.openEmailModal();
      return;
    }

    this.openConfirmModal();
  }

  openEmailModal(): void {
    this.error.set(null);
    this.emailError.set('');
    this.currentStep.set('email');
  }

  openConfirmModal(): void {
    if (this.isConfirmed()) {
      return;
    }

    this.error.set(null);
    this.currentStep.set('confirm');
  }

  closeModal(): void {
    this.currentStep.set('idle');
    this.error.set(null);
    this.emailError.set('');
    this.isSubmitting.set(false);
  }

  updateEmailValue(value: string): void {
    this.emailValue.set(value);

    if (this.emailError()) {
      this.emailError.set('');
    }
  }

  submitEmail(event: Event): void {
    event.preventDefault();

    const trimmedEmail = this.emailValue().trim();
    const validationError = this.validateEmail(trimmedEmail);

    if (validationError) {
      this.emailError.set(validationError);
      return;
    }

    const inviteId = this.inviteId();

    if (!inviteId) {
      return;
    }

    this.isSubmitting.set(true);

    this.inviteService.updateEmail(inviteId, trimmedEmail).subscribe({
      next: () => {
        this.emailValue.set(trimmedEmail);
        this.currentStep.set('email-success');
        this.isSubmitting.set(false);
      },
      error: (err: ApiError) => {
        this.error.set(err.message);
        this.currentStep.set('error');
        this.isSubmitting.set(false);
      },
    });
  }

  confirmAttendance(): void {
    const inviteId = this.inviteId();

    if (!inviteId) {
      return;
    }

    this.isSubmitting.set(true);

    this.inviteService.confirmPresence(inviteId).subscribe({
      next: () => {
        this.isConfirmed.set(true);
        this.currentStep.set('presence-success');
        this.isSubmitting.set(false);
      },
      error: (err: ApiError) => {
        this.error.set(err.message);
        this.currentStep.set('error');
        this.isSubmitting.set(false);
      },
    });
  }

  private loadInvite(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('ID do convite inválido.');
      this.loading.set(false);
      return;
    }

    this.inviteId.set(id);

    this.inviteService.getInvite(id).subscribe({
      next: (data) => {
        this.invite.set(data);
        this.emailValue.set(data.email ?? '');
        this.isConfirmed.set(data.confirmed);
        this.updatePreviewTags(data);
        this.loading.set(false);
      },
      error: (err: ApiError) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  private validateEmail(value: string): string {
    if (value.length === 0 || value.length > 255) {
      return 'Digite um email válido.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Email inválido. Verifique e tente novamente.';
    }

    return '';
  }

  private parseInviteDay(value: string | undefined): Date | null {
    if (!value) {
      return null;
    }

    const match = /^(\d{2})[/-](\d{2})[/-](\d{2}) (\d{2}):(\d{2})$/.exec(value.trim());

    if (!match) {
      return null;
    }

    const [, day, month, year, hour, minute] = match;
    const fullYear = 2000 + Number(year);
    const parsedDate = new Date(
      fullYear,
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
    );

    if (
      parsedDate.getFullYear() !== fullYear ||
      parsedDate.getMonth() !== Number(month) - 1 ||
      parsedDate.getDate() !== Number(day) ||
      parsedDate.getHours() !== Number(hour) ||
      parsedDate.getMinutes() !== Number(minute)
    ) {
      return null;
    }

    return parsedDate;
  }

  private formatInviteDay(value: string | undefined): string | null {
    return this.formatDate(this.parseInviteDay(value));
  }

  private formatDate(value: Date | null): string | null {
    if (!value) {
      return null;
    }

    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }).format(value);
  }

  private updatePreviewTags(invite: Invite): void {
    const title = invite.previewTitle ?? this.buildPreviewTitle(invite);
    const description = invite.previewDescription ?? this.buildPreviewDescription(invite);
    const image = this.toAbsoluteUrl(invite.previewImage ?? environment.defaultPreviewImage);
    const url = this.buildPreviewUrl(invite._id);

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: 'Open-House' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
  }

  private buildPreviewTitle(invite: Invite): string {
    return this.isInviteFlow()
      ? `${invite.name}, você está convidado para o Open-House!`
      : `${invite.name}, confirme sua presença no Open-House`;
  }

  private buildPreviewDescription(invite: Invite): string {
    const date = this.formatInviteDay(invite.day);
    const dateText = date ? ` no dia ${date}` : '';

    return this.isInviteFlow()
      ? `Convite especial para ${invite.name}${dateText}. Venha celebrar conosco com muita pizza, batata frita e refrigerante!`
      : `Confirmação de presença de ${invite.name}${dateText}.`;
  }

  private buildPreviewUrl(inviteId: string): string {
    const path = this.isInviteFlow() ? 'invite' : 'confirm-presence';
    return `${environment.siteUrl}/${path}/${encodeURIComponent(inviteId)}`;
  }

  private toAbsoluteUrl(value: string): string {
    if (/^https?:\/\//.test(value)) {
      return value;
    }

    return `${environment.siteUrl}/${value.replace(/^\//, '')}`;
  }
}
