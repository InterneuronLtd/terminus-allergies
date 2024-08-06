import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubjectsService {

  encounterChange = new Subject();
  personIdChange = new Subject();
  poaIdChange = new Subject();
  apiServiceReferenceChange = new Subject();
  showMessage = new Subject();
  unload = new Subject();
  frameworkEvent = new Subject();
  currentmedsunload = new Subject();

  constructor() { }
}
