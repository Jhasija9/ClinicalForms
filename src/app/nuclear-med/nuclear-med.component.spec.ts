import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuclearMedComponent } from './nuclear-med.component';

describe('NuclearMedComponent', () => {
  let component: NuclearMedComponent;
  let fixture: ComponentFixture<NuclearMedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuclearMedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuclearMedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
