import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleLayerComponent } from './google-layer.component';

describe('GoogleLayerComponent', () => {
  let component: GoogleLayerComponent;
  let fixture: ComponentFixture<GoogleLayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoogleLayerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoogleLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
