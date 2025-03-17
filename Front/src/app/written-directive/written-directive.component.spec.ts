import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WrittenDirectiveComponent } from './written-directive.component';

describe('WrittenDirectiveComponent', () => {
  let component: WrittenDirectiveComponent;
  let fixture: ComponentFixture<WrittenDirectiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WrittenDirectiveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WrittenDirectiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
