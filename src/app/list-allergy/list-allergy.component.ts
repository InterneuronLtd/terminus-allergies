//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2021  Interneuron CIC

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
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Person } from '../models/entities/core-person.model';
import { AppService } from '../services/app.service';
import { Subject, Subscription } from 'rxjs';
import { ApirequestService } from '../services/apirequest.service';
import { AllergyWithMeta } from '../models/baseviews/allergy-with-meta';
import { AllergyCategory } from '../models/entities/allergy-category';
import { AllergyClinicalStatus } from '../models/entities/allergy-clinical-status';
import { AllergyCriticality } from '../models/entities/allergy-criticality';
import { AllergyVerificationStatus } from '../models/entities/allergy-verification-status';
import { AllergyReportedByGroup } from '../models/entities/allergy-reported-by-group';
import { AllergyIntolerance } from '../models/entities/allergy-intolerance';
import { Guid } from 'guid-typescript';
import { SNOMED } from '../models/snomed-model';
import { escapeRegExp } from '@angular/compiler/src/util';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { ToasterService } from '../services/toaster-service.service';
import { SubjectsService } from '../services/subjects.service';
import { AllergiesService } from '../services/allergies.service';
@Component({
  selector: 'app-list-allergy',
  templateUrl: './list-allergy.component.html',
  styleUrls: ['./list-allergy.component.css']
})
export class ListAllergyComponent {

  subscriptions: Subscription = new Subscription();

  personId: string;

  allergyIntolerance: AllergyIntolerance;
  
  showAllergyReactions: boolean;
  addAllergyStep: Number;
  bsConfig: any;
  refreshingList: boolean;
  selectedAllergiesView: string;
  saving: boolean = false;
  dropdownSettings:IDropdownSettings = {} as IDropdownSettings;

  getAllergyListForPersonURI: string;

  allergyIntoleranceList: AllergyWithMeta[];
  categoryList: AllergyCategory[];
  clinicalStatusList: AllergyClinicalStatus[];
  criticalityList: AllergyCriticality[];
  verificationStatusList: AllergyVerificationStatus[];
  reportedByGroupList: AllergyReportedByGroup[];
  
  addNonCodedAllergy: boolean;

  oldVerificationStatus: string;
  oldreportedbyname: string;
  oldreportedbygroup: string;

  displayWarningMessage: String;

  reverifyList: boolean;
  allergyIntoleranceListUpated: any;
  
  getAllergyURI: string = this.appService.baseURI + "/GetObject?synapsenamespace=core&synapseentityname=allergyintolerance&id=";
  getCategoryListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergycategory&orderby=displayorder ASC";
  getClinicalStatusListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergyclinicalstatus&orderby=displayorder ASC";
  getCriticalityListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergycriticality&orderby=displayorder ASC";
  getVerificationStatusListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergyverificationstatus&orderby=displayorder ASC";
  getReportedByGroupListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergyreportedbygroup&orderby=displayorder ASC";
  postAllergyURI: string = this.appService.baseURI + "/PostObject?synapsenamespace=core&synapseentityname=allergyintolerance";
  postArrayAllergyURI: string = this.appService.baseURI + "/PostObjectArray?synapsenamespace=core&synapseentityname=allergyintolerance";

  private _person: Person;
  @Input() set person(value: Person) {
    this.saving = false;

    this.selectedAllergiesView = "list";
    this.refreshingList = false;
    this.bsConfig = {  dateInputFormat: 'DD/MM/YYYY', containerClass: 'theme-default', adaptivePosition: true };
    this.addAllergyStep = 1
    this.showAllergyReactions = true;

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'allergyreportedbygroup_id',
      textField: 'groupname',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 10,
      allowSearchFilter: true
    };

    this.personId = value.person_id;


    // this.getAllergyListForPersonURI = this.appService.baseURI +  "/GetListByAttribute?synapsenamespace=core&synapseentityname=allergyintolerance&synapseattributename=person_id&attributevalue=" + this.personId + "&orderby=clinicalstatusvalue ASC, causativeagentcodesystem DESC, _sequenceid DESC";

    this.getAllergyListForPersonURI = this.appService.baseURI +  "/GetBaseViewListByAttribute/terminus_personallergylist?synapseattributename=person_id&attributevalue=" + this.personId + "&orderby=clinicalstatusvalue ASC, causativeagentcodesystem DESC, _sequenceid DESC";

    this.initialiseData();

  };

  get person(): Person { return this._person; }


  constructor(private apiRequest: ApirequestService, 
    public appService: AppService,
    private confirmationDialogService: ConfirmationDialogService,
    private toasterService: ToasterService,
    private subjects: SubjectsService,
    private allergyService: AllergiesService) { }

  async recordNotAbleToVerify() {

    var displayConfirmation = this.appService.displayWarnings;
    if(displayConfirmation) {
      var response = false;
      await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to record that it has not possible to ascertain if the patient has any allergies and intolerances?')
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {
        return;
      }
    }

    this.allergyIntolerance = {} as AllergyIntolerance;


    this.allergyIntolerance.allergyintolerance_id = String(Guid.create());
    this.allergyIntolerance.person_id = this.personId;
    this.allergyIntolerance.encounter_id = null;

    this.allergyIntolerance.causativeagentcodesystem = "NON-ALLERGY";
    this.allergyIntolerance.causativeagentcode = "Not possible to ascertain if patient has any allergies and intolerances";
    this.allergyIntolerance.causativeagentdescription = "Not possible to ascertain if patient has any allergies and intolerances";

    this.allergyIntolerance.clinicalstatusvalue = "Active";
    this.allergyIntolerance.clinicalstatusby = this.appService.loggedInUserName;
    this.allergyIntolerance.cliinicialstatusdatetime = this.allergyService.getDateTime();

    this.allergyIntolerance.category = "Flag";
    this.allergyIntolerance.criticality = "Unable to Assess";

    this.allergyIntolerance.onsetdate = this.allergyService.getDate();
    this.allergyIntolerance.enddate = null;
    this.allergyIntolerance.lastoccurencedate = this.allergyService.getDate();

    this.allergyIntolerance.reportedbygroup = '[ { "allergyreportedbygroup_id": "Patient", "groupname": "Patient" } ]';
    this.allergyIntolerance.reportedbyname = this.appService.currentPersonName;
    this.allergyIntolerance.reportedbydatetime = this.allergyService.getDateTime();

    this.allergyIntolerance.recordedby = this.appService.loggedInUserName;
    this.allergyIntolerance.recordeddatetime = this.allergyService.getDateTime();

    this.allergyIntolerance.verificationstatus = "Unconfirmed";
    this.allergyIntolerance.assertedby = this.appService.loggedInUserName;
    this.allergyIntolerance.asserteddatetime = this.allergyService.getDateTime();

    this.allergyIntolerance. allergynotes = null;
    this.allergyIntolerance.manifestationnotes = null;

        //this.allergyIntolerance.category = "Flag";
        this.allergyIntolerance.reactionconcepts = '{"_term":"flag","_code":"flag","bindingValue":"flag | flag","fsn":"flag","level":0,"parentCode":null}';

    this.subscriptions.add(
      this.apiRequest.postRequest(this.postAllergyURI, this.allergyIntolerance)
        .subscribe((response) => {

         this.toasterService.showToaster("Success","Not possible to ascertain recorded");
         this.allergyService.resetAllergy();
          //Update patient banner
          this.subjects.frameworkEvent.next("UPDATE_HEIGHT_WEIGHT");
         this.getAllergyListForPerson();

        })
      )

  }

  async initialiseData() {
    await this.getAllergyListForPerson();
    await this.getCategoryList();
    await this.getClinicalStatusList();
    await this.getCriticalityList();
    await this.getVerificationStatusList();
    await this.getReportedByList();
  }

  async refreshAlllergyList() {
    await this.getAllergyListForPerson();
  }

  async  getAllergyListForPerson() {
    this.refreshingList = true;
    await this.subscriptions.add(
     this.apiRequest.getRequest(this.getAllergyListForPersonURI)
     .subscribe((response) => {
       this.allergyIntoleranceList = JSON.parse(response);
       this.allergyIntoleranceList.forEach((element,index) => {
        this.allergyIntoleranceList[index].reactionconcepts = JSON.parse(element.reactionconcepts);
       });
       this.refreshingList = false;
     })
   )
  }

  get activeAllergies(): AllergyWithMeta[] {
    return this.allergyIntoleranceList.filter((a) =>
      a.clinicalstatusvalue == 'Active' && a.causativeagentcodesystem != "NON-ALLERGY"
    );
  }

  get activeAllergiesAndFlags(): AllergyWithMeta[] {
    return this.allergyIntoleranceList.filter((a) =>
      a.clinicalstatusvalue == 'Active' && a.causativeagentcode != this.allergyIntolerance.causativeagentcode
    );
  }

  get NoKnownAllergiesRecorded(): boolean{

    if(!this.allergyIntoleranceList) {
      return false;
    }

    var filter = this.allergyIntoleranceList.filter((a) =>
      a.causativeagentcode == 'No known allergies and intolerances' && a.causativeagentcodesystem == "NON-ALLERGY"
    );

    if(!filter) {
      return false;
    }
    else if(filter.length > 0) {
      return true;
    }
    else {
      return false;
    }

  }

  get ActiveNoKnownAllergiesRecorded(): boolean{

    if(!this.allergyIntoleranceList) {
      return false;
    }

    var filter = this.allergyIntoleranceList.filter((a) =>
      a.clinicalstatusvalue == 'Active' && a.causativeagentcode == 'No known allergies and intolerances' && a.causativeagentcodesystem == "NON-ALLERGY"
    );

    if(!filter) {
      return false;
    }
    else if(filter.length > 0) {
      return true;
    }
    else {
      return false;
    }

  }

  get NotAbleToAscertainRecorded(): boolean{

    if(!this.allergyIntoleranceList) {
      return false;
    }

    var filter = this.allergyIntoleranceList.filter((a) =>
      a.causativeagentcode == 'Not possible to ascertain if patient has any allergies and intolerances' && a.causativeagentcodesystem == "NON-ALLERGY"
    );

    if(!filter) {
      return false;
    }
    else if(filter.length > 0) {
      return true;
    }
    else {
      return false;
    }

  }

  get ActiveNotAbleToAscertainRecorded(): boolean{

    if(!this.allergyIntoleranceList) {
      return false;
    }

    var filter = this.allergyIntoleranceList.filter((a) =>
    a.clinicalstatusvalue == 'Active' && a.causativeagentcode == 'Not possible to ascertain if patient has any allergies and intolerances' && a.causativeagentcodesystem == "NON-ALLERGY"
    );

    if(!filter) {
      return false;
    }
    else if(filter.length > 0) {
      return true;
    }
    else {
      return false;
    }

  }

  async  getCategoryList() {
    await this.subscriptions.add(
     this.apiRequest.getRequest(this.getCategoryListURI)
     .subscribe((response) => {
       this.categoryList = JSON.parse(response);
     })
   )
  }

  async  getReportedByList() {
    await this.subscriptions.add(
     this.apiRequest.getRequest(this.getReportedByGroupListURI)
     .subscribe((response) => {
       this.reportedByGroupList = JSON.parse(response);
     })
   )
  }

  async  getClinicalStatusList() {
    await this.subscriptions.add(
     this.apiRequest.getRequest(this.getClinicalStatusListURI)
     .subscribe((response) => {
       this.clinicalStatusList = JSON.parse(response);
     })
   )
  }

  async  getCriticalityList() {
    await this.subscriptions.add(
     this.apiRequest.getRequest(this.getCriticalityListURI)
     .subscribe((response) => {
       this.criticalityList = JSON.parse(response);
     })
   )
  }

  async  getVerificationStatusList() {
    await this.subscriptions.add(
     this.apiRequest.getRequest(this.getVerificationStatusListURI)
     .subscribe((response) => {
       this.verificationStatusList = JSON.parse(response);
     })
   )
  }

  @Output() viewChange: EventEmitter<any> = new EventEmitter();

  @Output() viewClosed = new EventEmitter<boolean>();

  addAllergy() {
    this.selectedAllergiesView = "add";
    this.viewChange.emit(this.selectedAllergiesView);
    this.addNonCodedAllergy = false;
    this.addAllergyStep = 1;
  }

  getNotification(evt) {
    // Do something with the notification (evt) sent by the child!
    this.selectedAllergiesView = evt;
  }

  cancel() {
    // var r = confirm("Are you sure that you want to go back to the menu without saving?");
    // if (r == false)  {
    //   //do nothing
    //   return;
    // }
    // else if (r == true) {
      this.viewClosed.emit(true);
    // } else {
    //   //do nothing
    //   return;
    // }
  }

  async recordNoKnownAllergies() {


    var displayConfirmation = this.appService.displayWarnings;
    if(displayConfirmation) {
      var response = false;
      await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to record that this patient has no known allergies and intolerances?')
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {
        return;
      }
    }

    this.allergyIntolerance = {} as AllergyIntolerance;


    this.allergyIntolerance.allergyintolerance_id = String(Guid.create());
    this.allergyIntolerance.person_id = this.personId;
    this.allergyIntolerance.encounter_id = null;

    this.allergyIntolerance.causativeagentcodesystem = "NON-ALLERGY";
    this.allergyIntolerance.causativeagentcode = "No known allergies and intolerances";
    this.allergyIntolerance.causativeagentdescription = "No known allergies and intolerances";

    this.allergyIntolerance.clinicalstatusvalue = "Active";
    this.allergyIntolerance.clinicalstatusby = this.appService.loggedInUserName;
    this.allergyIntolerance.cliinicialstatusdatetime = this.allergyService.getDateTime();

    this.allergyIntolerance.category = "Flag";
    this.allergyIntolerance.criticality = "Unable to Assess";

    this.allergyIntolerance.onsetdate = this.allergyService.getDate();
    this.allergyIntolerance.enddate = null;
    this.allergyIntolerance.lastoccurencedate = this.allergyService.getDate();

    this.allergyIntolerance.reportedbygroup = '[ { "allergyreportedbygroup_id": "Patient", "groupname": "Patient" } ]';
    this.allergyIntolerance.reportedbyname = this.appService.currentPersonName;
    this.allergyIntolerance.reportedbydatetime = this.allergyService.getDateTime();

    this.allergyIntolerance.recordedby = this.appService.loggedInUserName;
    this.allergyIntolerance.recordeddatetime = this.allergyService.getDateTime();

    this.allergyIntolerance.verificationstatus = "Unconfirmed";
    this.allergyIntolerance.assertedby = this.appService.loggedInUserName;
    this.allergyIntolerance.asserteddatetime = this.allergyService.getDateTime();

    //this.allergyIntolerance.category = "Flag";
    this.allergyIntolerance.reactionconcepts = '{"_term":"flag","_code":"flag","bindingValue":"flag | flag","fsn":"flag","level":0,"parentCode":null}';

    this.allergyIntolerance. allergynotes = null;
    this.allergyIntolerance.manifestationnotes = null;

    this.subscriptions.add(
      this.apiRequest.postRequest(this.postAllergyURI, this.allergyIntolerance)
        .subscribe((response) => {

         this.toasterService.showToaster("Success","No Allergies and Intolerances for patient recorded");
         this.allergyService.resetAllergy();
         //Update patient banner
         this.subjects.frameworkEvent.next("UPDATE_HEIGHT_WEIGHT");
         this.getAllergyListForPerson();

        })
      )

  }

  async reverifyAllergy(data) {
    var displayConfirmation = this.appService.displayWarnings;
    if(displayConfirmation) {
      var response = false;
      await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to reverify?')
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {
        return;
      }
    }
    data.assertedby = this.appService.loggedInUserName;
    data.asserteddatetime = this.allergyService.getDateTime();
    
    delete data.poaname;
    delete data.poaonly;

    // this.allergyIntolerance = data;
    let updatedData = Object.assign({}, data);

    updatedData.allergyconcept = JSON.stringify(updatedData.allergyconcept);
    updatedData.reportedbygroup = JSON.stringify(updatedData.reportedbygroup);
    updatedData.reactionconcepts = JSON.stringify(updatedData.reactionconcepts);
    updatedData.lastupdatedrecorddatetime = this.allergyService.getDateTime();
    updatedData.reactiontext = updatedData.reactionconcepts;

    //update the entity record
    await this.subscriptions.add(
      this.apiRequest.postRequest(this.postAllergyURI, updatedData)
        .subscribe((response) => {

          this.saving = false;

          this.getAllergyListForPerson();

          this.showAllergyReactions = true;

          this.allergyService.resetAllergy();

          this.selectedAllergiesView = "list";
          this.viewChange.emit(this.selectedAllergiesView);
        })
      )
  }

  async reverifyAllAllergy()
  {
    
    this.allergyIntoleranceListUpated = this.allergyIntoleranceList;

    var displayConfirmation = this.appService.displayWarnings;
    if(displayConfirmation) {
      var response = false;
      await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to reverify?')
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {
        this.reverifyList = false;
        return;
      }
    }
    
    this.reverifyList = true;
    this.allergyIntoleranceListUpated.forEach(element => {
      element.asserteddatetime = this.allergyService.getDateTime();
      element.allergyconcept = JSON.stringify(element.allergyconcept);
      element.reportedbygroup = JSON.stringify(element.reportedbygroup);
      element.reactionconcepts = JSON.stringify(element.reactionconcepts);
      element.lastupdatedrecorddatetime = this.allergyService.getDateTime();
      delete element.poaname;
      delete element.poaonly;
      delete element._sequenceid;
    });

    //update the entity record
    await this.subscriptions.add(
      this.apiRequest.postRequest(this.postArrayAllergyURI, this.allergyIntoleranceListUpated)
        .subscribe((response) => {

          this.saving = false;
          this.reverifyList = false;

          this.getAllergyListForPerson();

          //Update patient banner
          this.subjects.frameworkEvent.next("UPDATE_HEIGHT_WEIGHT");

          if(this.allergyIntoleranceListUpated.causativeagentcodesystem != "NON-ALLERGY" && this.allergyIntoleranceListUpated.clinicalstatusvalue === "Active") {
            this.allergyIntoleranceList.forEach( (element) => {

              if(element.causativeagentcodesystem == "NON-ALLERGY" && element.clinicalstatusvalue === "Active" ) {
                //this.markAllergyInactive(element);

                element.clinicalstatusvalue = 'Inactive';
                element.enddate = this.allergyService.getDate();

                //update the entity record
                this.subscriptions.add(
                  this.apiRequest.postRequest(this.postAllergyURI, element)
                    .subscribe((response) => {
                      //Update patient banner
                      this.subjects.frameworkEvent.next("UPDATE_HEIGHT_WEIGHT");
                      this.getAllergyListForPerson();
                      this.toasterService.showToaster("Info", element.causativeagentdescription + ' set to inactive');
                    })
                  )

              }
          });

          }

          this.showAllergyReactions = true;

          this.allergyService.resetAllergy();

          this.selectedAllergiesView = "list";
          this.viewChange.emit(this.selectedAllergiesView);
        })
      )
  }

  async editAllergy(allergy: AllergyIntolerance) {

    let data = {
      'selectedAllergiesView':this.selectedAllergiesView = "edit",
      'allergy_id':allergy
    }
    
    this.viewChange.emit(data);

  }

  checkActiveEnteredInError() {

    if(this.allergyIntolerance.verificationstatus === "Entered in error" && this.allergyIntolerance.clinicalstatusvalue == 'Active') {
      this.allergyIntolerance.displaywarning = null;
      this.displayWarningMessage = "Unable to have Status set to 'Active' and Verification Status set to 'Entered in error'";
    }
    else {
      this.allergyIntolerance.displaywarning = "No errors";
      this.displayWarningMessage = "";
    }

  }
  
  replaceAll(str, find, replace) {
    if(!str) {
      return null;
    }
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
  }

}
