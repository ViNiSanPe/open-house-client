import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { environment } from '../../../../shared/config/environment';
import { InviteService } from '../../../../shared/services/invite.service';
import { ReschedulePage } from './reschedule-page';

describe('ReschedulePage', () => {
  let component: ReschedulePage;
  let fixture: ComponentFixture<ReschedulePage>;
  const invite = {
    _id: '6a14e712590d2ae4746be193',
    name: 'João e Maria',
    day: '27/06/26 14:00',
    confirmed: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReschedulePage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => invite._id,
              },
            },
          },
        },
        {
          provide: InviteService,
          useValue: {
            getInvite: () => of(invite),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReschedulePage);
    component = fixture.componentInstance;
    component.now.set(new Date(2026, 5, 24));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the reschedule notice', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Open-House');
    expect(text).toContain('remarcado');
    expect(text).toContain('João e Maria');
    expect(text).toContain('por motivos de ajustes e reformas na casa');
  });

  it('should show the updated event date from the invite', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(component.eventDateTime()).toContain('27 de junho');
    expect(component.eventDateTime()).toContain('14:00');
    expect(text).toContain('27 de junho');
    expect(text).toContain('14:00');
    expect(text).toContain(environment.event.location);
  });

  it('should update page title and sharing description', () => {
    const title = TestBed.inject(Title);
    const meta = TestBed.inject(Meta);

    expect(title.getTitle()).toBe('João e Maria: Open-House remarcado');
    expect(meta.getTag('name="description"')?.content).toContain('ajustes e reformas');
    expect(meta.getTag('property="og:title"')?.content).toBe(
      'João e Maria: Open-House remarcado',
    );
  });
});
