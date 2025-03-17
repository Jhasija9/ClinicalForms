import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolumeCalculationComponent } from './volume-calculation.component';

describe('VolumeCalculationComponent', () => {
  let component: VolumeCalculationComponent;
  let fixture: ComponentFixture<VolumeCalculationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VolumeCalculationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VolumeCalculationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
