import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmitComponent } from './smit.component';

describe('SmitComponent', () => {
  let component: SmitComponent;
  let fixture: ComponentFixture<SmitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
});
