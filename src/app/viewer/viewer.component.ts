//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2024  Interneuron Limited

//This program is free software: you can redistribute it and/or modify
//it under the terms of the GNU General Public License as published by
//the Free Software Foundation, either version 3 of the License, or
//(at your option) any later version.

//This program is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

//See the
//GNU General Public License for more details.

//You should have received a copy of the GNU General Public License
//along with this program.If not, see<http://www.gnu.org/licenses/>.
//END LICENSE BLOCK 
import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, ElementRef, TemplateRef, Injectable } from '@angular/core';
//import { SubjectsService } from './services/subjects.service';
import { Subscription } from 'rxjs';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
//import { EscalationForm } from '../models/fluidbalanceescalation.model';
import { v4 as uuidv4 } from 'uuid';
import { SubjectsService } from '../services/subjects.service';
import { Person } from '../models/entities/core-person.model';
import { environment } from 'src/environments/environment';
import { NgxSpinnerService } from "ngx-spinner";
import { ToasterService } from '../services/toaster-service.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

import { RouterModule, Routes } from '@angular/router';
import { Guid } from 'guid-typescript';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { UserSettings } from '../models/entities/user-settings';
import { AllergyIntolerance } from '../models/entities/allergy-intolerance';






@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css']
})


export class ViewerComponent implements OnInit, OnDestroy {


  subscriptions: Subscription = new Subscription();


  personId: string;
  poaId: string;

  person: Person = new Person();

  selectedView: string = 'viewer';

  selectedAllergiesView: string;

  allergy: any;

  //Define  output property
  @Output() personChange:EventEmitter<Person> =new EventEmitter<Person>();

  @Output() viewChange: EventEmitter<any> = new EventEmitter();

   //Raise the event using the emit method.
  update() {
    this.appService.personId = this.personId;
    this.personChange.emit(this.person);
  }

  getNotification(evt) {
    // Do something with the notification (evt) sent by the child!
    if(evt.allergy_id)
    {
      this.selectedView = evt.selectedAllergiesView;
      this.selectedAllergiesView = evt.selectedAllergiesView;
      this.allergy = evt.allergy_id;
    }
    else{
      this.selectedView = evt;
      this.selectedAllergiesView = evt;
    }
    
  }
  

  constructor(private apiRequest: ApirequestService, public appService: AppService, private subjects: SubjectsService, private spinner: NgxSpinnerService, private toasterService: ToasterService, private modalService: BsModalService, private confirmationDialogService: ConfirmationDialogService) {

    this.subjects.personIdChange.subscribe( () => {
      if(!this.appService.personId) {
      return;
    }

    this.checkLockedOrBlocked();

    this.personId = this.appService.personId;

    this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.baseURI + '/GetObject?synapsenamespace=core&synapseentityname=person&id=' + this.appService.personId)
        .subscribe((response) => {
          this.selectedView = 'list';
          this.poaId = null;
          var data = JSON.parse(response);
          this.person = data;
          this.appService.currentPersonName = this.person.fullname;
          this.update();  //Lets the other modules know that loading has completed
          // if(this.person.fullname != null) {
          //   this.toasterService.showToaster("info", this.person.fullname + " loaded");
          // }


        })
      );
    })
  }

  async checkLockedOrBlocked() {
    if(this.appService.authoriseAction('Edit POA')) {
      this.appService.blocked = false;
    }
    else
    {
      this.appService.blocked = true;
    }

    if(this.appService.blocked || this.appService.locked) {
      this.appService.lockedOrBlocked = true;
    }
    else
    {
      this.appService.lockedOrBlocked = false;
    }
  }

  ngOnDestroy(): void {
   this.subscriptions.unsubscribe();
  }

  // @Output() hideScrollBarEvent = new EventEmitter<Boolean>();

  // hideScrollBar(hide: boolean) {
  //   console.log("hideScrollBar(" + hide + ")");
  //   this.hideScrollBarEvent.emit(hide);
  // }

  ngOnInit() {

  }

  gotoView(view: string) {
    this.selectedView = view;
  }

  goToMedicationHistory() {
    this.selectedView = "medicationHistory";
  }

  goToHome() {
    this.selectedView = "home";
  }

  goToDynamicForm() {
    this.selectedView = "dynamicForm";
  }
    //Modal
  confirmModalRef: BsModalRef;

  openConfirmModal(template: TemplateRef<any>) {
    this.confirmModalRef = this.modalService.show(template, {
      backdrop: true,
      ignoreBackdropClick: true,
      class: 'modal-sm modal-dialog-centered'
    });
  }

  cancel(): void {
    this.confirmModalRef.hide();

  }

  onViewClosed(event)
  {

  }

}
