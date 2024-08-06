import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ListAllergyComponent } from './list-allergy.component';

describe('ListAllergyComponent', () => {
  let component: ListAllergyComponent;
  let fixture: ComponentFixture<ListAllergyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ListAllergyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListAllergyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
