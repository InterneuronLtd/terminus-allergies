import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AllergyHistoryViewerComponent } from './allergy-history-viewer.component';

describe('AllergyHistoryViewerComponent', () => {
  let component: AllergyHistoryViewerComponent;
  let fixture: ComponentFixture<AllergyHistoryViewerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AllergyHistoryViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllergyHistoryViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
