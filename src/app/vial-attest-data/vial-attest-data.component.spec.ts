import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VialAttestDataComponent } from './vial-attest-data.component';

describe('VialAttestDataComponent', () => {
  let component: VialAttestDataComponent;
  let fixture: ComponentFixture<VialAttestDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VialAttestDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VialAttestDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
