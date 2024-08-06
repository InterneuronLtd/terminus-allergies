import { Injectable } from '@angular/core';
//import { Observable } from 'rxjs/Observable';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AllergyLookupDescriptionsComponent } from './allergy-lookup-descriptions.component';

@Injectable()
export class AllergyLookupDescriptionsService {

  constructor(private modalService: NgbModal) { }

  formBuilderFormId: string;


  public confirm(
    title: string,
    message: string = '',
    btnOkText: string = 'Yes',
    btnCancelText: string = 'No',
    dialogSize: 'sm'|'lg' = 'lg'): Promise<boolean> {

    const modalRef = this.modalService.open(AllergyLookupDescriptionsComponent, { size: dialogSize, centered: true });

    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.btnOkText = btnOkText;
    modalRef.componentInstance.btnCancelText = btnCancelText;

    return modalRef.result;

  }

}
