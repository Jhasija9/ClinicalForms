import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormOrderingComponent } from './form-ordering.component';

describe('FormOrderingComponent', () => {
  let component: FormOrderingComponent;
  let fixture: ComponentFixture<FormOrderingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormOrderingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormOrderingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
