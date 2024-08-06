import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AllergyLookupDescriptionsComponent } from './allergy-lookup-descriptions.component';

describe('AllergyLookupDescriptionsComponent', () => {
  let component: AllergyLookupDescriptionsComponent;
  let fixture: ComponentFixture<AllergyLookupDescriptionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AllergyLookupDescriptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllergyLookupDescriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
