import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoRow } from './info-row';

describe('InfoRow', () => {
  let component: InfoRow;
  let fixture: ComponentFixture<InfoRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoRow],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoRow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
