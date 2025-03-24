import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttestDataComponent } from './attest-data.component';

describe('AttestDataComponent', () => {
  let component: AttestDataComponent;
  let fixture: ComponentFixture<AttestDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttestDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttestDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
