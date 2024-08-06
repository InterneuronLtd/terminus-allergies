import { Injectable } from '@angular/core';
//import { Observable } from 'rxjs/Observable';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AllergyHistoryViewerComponent } from './allergy-history-viewer.component';

@Injectable()
export class AllergyHistoryViewerService {

  constructor(private modalService: NgbModal) { }

  formBuilderFormId: string;


  public confirm(
    allergyId: string,
    title: string,
    message: string = '',
    btnOkText: string = 'Yes',
    btnCancelText: string = 'No',
    dialogSize: 'sm'|'lg' = 'lg'): Promise<boolean> {

    const modalRef = this.modalService.open(AllergyHistoryViewerComponent, { size: dialogSize, centered: true, windowClass: 'custom-class' });

    modalRef.componentInstance.allergyId = allergyId;
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.btnOkText = btnOkText;
    modalRef.componentInstance.btnCancelText = btnCancelText;

    return modalRef.result;

  }

}
