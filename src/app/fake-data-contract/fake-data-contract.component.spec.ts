import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FakeDataContractComponent } from './fake-data-contract.component';

describe('FakeDataContractComponent', () => {
  let component: FakeDataContractComponent;
  let fixture: ComponentFixture<FakeDataContractComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FakeDataContractComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FakeDataContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
