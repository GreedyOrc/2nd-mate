import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionInfoComponent } from './position-info.component';

describe('PositionInfoComponent', () => {
  let component: PositionInfoComponent;
  let fixture: ComponentFixture<PositionInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PositionInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PositionInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
