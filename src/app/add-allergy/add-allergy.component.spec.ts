import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddAllergyComponent } from './add-allergy.component';

describe('AddAllergyComponent', () => {
  let component: AddAllergyComponent;
  let fixture: ComponentFixture<AddAllergyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAllergyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAllergyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
