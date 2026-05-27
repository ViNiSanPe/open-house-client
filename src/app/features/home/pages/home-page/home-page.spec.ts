import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { InviteService } from '../../../../shared/services/invite.service';
import { HomePage } from './home-page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                flow: 'invite',
              },
              paramMap: {
                get: () => 'demo',
              },
            },
          },
        },
        {
          provide: InviteService,
          useValue: {
            getInvite: () =>
              of({
                _id: 'demo',
                name: 'João e Maria',
                day: '27/06/25 14:00',
                confirmed: false,
              }),
            updateEmail: () => of(void 0),
            confirmPresence: () => of(void 0),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the event date returned by the API', () => {
    expect(component.eventDateTime()).toContain('27 de junho');
    expect(component.eventDateTime()).toContain('14:00');
  });

  it('should personalize preview tags with invite name and day', () => {
    const title = TestBed.inject(Title);
    const meta = TestBed.inject(Meta);

    expect(title.getTitle()).toContain('João e Maria');
    expect(title.getTitle()).toContain('27 de junho');
    expect(meta.getTag('property="og:title"')?.content).toContain('João e Maria');
    expect(meta.getTag('property="og:title"')?.content).toContain('27 de junho');
    expect(meta.getTag('property="og:description"')?.content).toContain('João e Maria');
    expect(meta.getTag('property="og:description"')?.content).toContain('27 de junho');
  });
});
