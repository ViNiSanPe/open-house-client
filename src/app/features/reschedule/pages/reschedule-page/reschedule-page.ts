import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { ApiError, Invite } from '../../../../core/models/invite.model';
import { environment } from '../../../../shared/config/environment';
import { InviteService } from '../../../../shared/services/invite.service';
import { Card } from '../../../home/components/card/card';
import { InfoRow } from '../../../home/components/info-row/info-row';

const PAGE_TITLE = 'Open-House remarcado';
const PAGE_DESCRIPTION =
  'Por motivos de ajustes e reformas na casa, precisamos remarcar nosso Open-House. A nova data já está confirmada.';

@Component({
  selector: 'app-reschedule-page',
  imports: [Card, InfoRow],
  templateUrl: './reschedule-page.html',
  styleUrl: './reschedule-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReschedulePage implements OnInit {
  private readonly inviteService = inject(InviteService);
  private readonly route = inject(ActivatedRoute);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  readonly eventData = environment.event;
  readonly loading = signal(false);
  readonly invite = signal<Invite | null>(null);
  readonly error = signal<string | null>(null);
  readonly now = signal(new Date());

  readonly guestName = computed(() => this.invite()?.name ?? 'Convidado(a) Especial');
  readonly hasInvite = computed(() => this.invite() !== null);
  readonly eventDateTime = computed(
    () => this.formatInviteDay(this.invite()?.day) ?? `${environment.event.date} — ${environment.event.time}`,
  );

  ngOnInit(): void {
    this.updatePreviewTags();

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.loading.set(true);

    this.inviteService.getInvite(id).subscribe({
      next: (invite) => {
        this.invite.set(invite);
        this.updatePreviewTags(invite);
        this.loading.set(false);
      },
      error: (err: ApiError) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  private formatInviteDay(value: string | undefined): string | null {
    return this.formatDate(this.parseInviteDay(value));
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
    const parsedYear = 2000 + Number(year);
    const parsedDate = new Date(
      parsedYear,
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
    );

    if (
      parsedDate.getFullYear() !== parsedYear ||
      parsedDate.getMonth() !== Number(month) - 1 ||
      parsedDate.getDate() !== Number(day) ||
      parsedDate.getHours() !== Number(hour) ||
      parsedDate.getMinutes() !== Number(minute)
    ) {
      return null;
    }

    while (parsedDate < this.now()) {
      parsedDate.setFullYear(parsedDate.getFullYear() + 1);
    }

    return parsedDate;
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

  private updatePreviewTags(invite?: Invite): void {
    const title = invite ? `${invite.name}: ${PAGE_TITLE}` : PAGE_TITLE;
    const description = invite
      ? `${invite.name}, precisamos remarcar nosso Open-House por motivos de ajustes e reformas na casa. Nova data: ${this.eventDateTime()}.`
      : PAGE_DESCRIPTION;
    const url = invite
      ? `${environment.siteUrl}/invite/${encodeURIComponent(invite._id)}`
      : environment.siteUrl;

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: 'Open-House' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: environment.defaultPreviewImage });
    this.meta.updateTag({ property: 'og:image:alt', content: `Open-House remarcado para ${this.guestName()}` });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: environment.defaultPreviewImage });
    this.meta.updateTag({ name: 'twitter:image:alt', content: `Open-House remarcado para ${this.guestName()}` });
  }
}
