import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LargeLabelAttestDataComponent } from './large-label-attest-data.component';

describe('LargeLabelAttestDataComponent', () => {
  let component: LargeLabelAttestDataComponent;
  let fixture: ComponentFixture<LargeLabelAttestDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LargeLabelAttestDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LargeLabelAttestDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
