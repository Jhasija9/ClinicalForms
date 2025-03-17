import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitDataComponent } from './visit-data.component';

describe('VisitDataComponent', () => {
  let component: VisitDataComponent;
  let fixture: ComponentFixture<VisitDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
