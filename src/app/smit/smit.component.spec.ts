import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SMITComponent } from './smit.component';

describe('SMITComponent', () => {
  let component: SMITComponent;
  let fixture: ComponentFixture<SMITComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SMITComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SMITComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
