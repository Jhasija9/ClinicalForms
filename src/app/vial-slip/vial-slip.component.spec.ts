import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VialSlipComponent } from './vial-slip.component';

describe('VialSlipComponent', () => {
  let component: VialSlipComponent;
  let fixture: ComponentFixture<VialSlipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VialSlipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VialSlipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
