import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoaAttestDataComponent } from './coa-attest-data.component';

describe('CoaAttestDataComponent', () => {
  let component: CoaAttestDataComponent;
  let fixture: ComponentFixture<CoaAttestDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoaAttestDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoaAttestDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
