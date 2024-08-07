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
import { Component, EventEmitter, Inject, Input, LOCALE_ID, Output } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { Person } from '../models/entities/core-person.model';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';
import { ToasterService } from '../services/toaster-service.service';
import { AllergyCriticality } from '../models/entities/allergy-criticality';
import { AllergyIntolerance } from '../models/entities/allergy-intolerance';
import { AllergyCategory } from '../models/entities/allergy-category';
import { AllergyClinicalStatus } from '../models/entities/allergy-clinical-status';
import { AllergyVerificationStatus } from '../models/entities/allergy-verification-status';
import { Guid } from 'guid-typescript';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { AllergyReportedByGroup } from '../models/entities/allergy-reported-by-group';
import { SNOMED } from '../models/snomed-model';
import { TerminologyConcept } from '../models/terminology-concept';
import { AllergyLookupDescriptionsService } from '../allergy-lookup-descriptions/allergy-lookup-descriptions.service';
import { AllergyHistoryViewerService } from '../allergy-history-viewer/allergy-history-viewer.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { AllergyWithMeta } from '../models/baseviews/allergy-with-meta';
import { AllergiesService } from '../services/allergies.service';
import { AllergySources } from '../models/entities/allergy-source';
import { AudienceType, publishSenderNotificationWithParams } from '../notification/lib/notification.observable.util';
import * as moment from 'moment';

@Component({
  selector: 'app-add-allergy',
  templateUrl: './add-allergy.component.html',
  styleUrls: ['./add-allergy.component.css']
})
export class AddAllergyComponent {

  subscriptions: Subscription = new Subscription();

  personId: string;

  allergyIntolerance: AllergyIntolerance;
  oldVerificationStatus: string;
  oldreportedbyname: string;
  oldreportedbygroup: string;

  allergyIntoleranceList: AllergyWithMeta[];
  categoryList: AllergyCategory[];
  clinicalStatusList: AllergyClinicalStatus[];
  criticalityList: AllergyCriticality[];
  verificationStatusList: AllergyVerificationStatus[];
  reportedByGroupList: AllergyReportedByGroup[];
  sourceList: AllergySources[];

  refreshingList: boolean;

  displayWarningMessage: String;

  addAllergyStep: Number = 1;

  showAllergyReactions: boolean;

  maxDateValue: Date = new Date();

  saving: boolean = false;

  reportedByList: AllergyReportedByGroup[];

  //Date Picker Models
  model: any;
  bsConfig: any;

  //Multiselect
  dropdownList = [];
  selectedItems = [];
  dropdownSettings:IDropdownSettings = {} as IDropdownSettings;
  onItemSelect(item: any) {
    //this.getTaskName();
  }
  onSelectAll(items: any) {
    //this.getTaskName();
  }
  //Multiselect

  getAllergyListForPersonURI: string;
  getAllergyURI: string = this.appService.baseURI + "/GetObject?synapsenamespace=core&synapseentityname=allergyintolerance&id=";
  postAllergyURI: string = this.appService.baseURI + "/PostObject?synapsenamespace=core&synapseentityname=allergyintolerance";
  getCategoryListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergycategory&orderby=displayorder ASC";
  getClinicalStatusListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergyclinicalstatus&orderby=displayorder ASC";
  getCriticalityListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergycriticality&orderby=displayorder ASC";
  getVerificationStatusListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergyverificationstatus&orderby=displayorder ASC";
  getReportedByGroupListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergyreportedbygroup&orderby=displayorder ASC";
  getSourceListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergysources&orderby=displayname ASC";

  private _person: Person;
  @Input() set person(value: Person) {

    this.saving = false;

    this.selectedAllergiesView = "list";
    this.refreshingList = false;
    this.bsConfig = {  dateInputFormat: 'DD/MM/YYYY', containerClass: 'theme-default', adaptivePosition: true };
    this.addAllergyStep = 1
    this.showAllergyReactions = true;

    // this.dropdownSettings = {
    //   singleSelection: false,
    //   idField: 'allergyreportedbygroup_id',
    //   textField: 'groupname',
    //   selectAllText: 'Select All',
    //   unSelectAllText: 'UnSelect All',
    //   itemsShowLimit: 10,
    //   allowSearchFilter: true
    // };

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'allergysources_id',
      textField: 'source',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 10,
      allowSearchFilter: true
    };

    this.personId = value.person_id;

    //this.getAllergyListForPersonURI = this.appService.baseURI +  "/GetListByAttribute?synapsenamespace=core&synapseentityname=allergyintolerance&synapseattributename=person_id&attributevalue=" + this.personId + "&orderby=clinicalstatusvalue ASC, causativeagentcodesystem DESC, _sequenceid DESC";

    this.getAllergyListForPersonURI = this.appService.baseURI +  "/GetBaseViewListByAttribute/terminus_personallergylist?synapseattributename=person_id&attributevalue=" + this.personId + "&orderby=clinicalstatusvalue ASC, causativeagentcodesystem DESC, _sequenceid DESC";

    this.initialiseData();

  };
  get person(): Person { return this._person; }

  @Input("notifyAddAllergy") selectedAllergiesView: string;
  @Input("allergyIntolerance") allergyIntolerances: any;

  @Output() viewClosed = new EventEmitter<boolean>();
  @Output() viewChange: EventEmitter<any> = new EventEmitter();

  async initialiseData() {
    await this.getAllergyListForPerson();
    await this.getCategoryList();
    await this.getClinicalStatusList();
    await this.getCriticalityList();
    await this.getVerificationStatusList();
    // await this.getReportedByList();
    await this.getSourceList();
  }

  async  getAllergyListForPerson() {
    this.refreshingList = true;
    await this.subscriptions.add(
     this.apiRequest.getRequest(this.getAllergyListForPersonURI)
     .subscribe((response) => {
       this.allergyIntoleranceList = JSON.parse(response);
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

  // async  getReportedByList() {
  //   await this.subscriptions.add(
  //    this.apiRequest.getRequest(this.getReportedByGroupListURI)
  //    .subscribe((response) => {
  //      this.reportedByGroupList = JSON.parse(response);
  //    })
  //  )
  // }

  async  getSourceList() {
    await this.subscriptions.add(
     this.apiRequest.getRequest(this.getSourceListURI)
     .subscribe((response) => {
       this.sourceList = JSON.parse(response);
       this.sourceList = this.sourceList.filter(obj => obj.displayname !== 'GP connect');
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

  async  getCriticalityList(event?: any) {
    await this.subscriptions.add(
     this.apiRequest.getRequest(this.getCriticalityListURI)
     .subscribe((response) => {
       this.criticalityList = JSON.parse(response);
        if (typeof event !== 'undefined') {
          if(event.target.value != 'Sensitivity Intolerance')
          {
            this.allergyIntolerance.criticality = "Life Threatening";
          }
        }
      })
   )
  }

  async  getVerificationStatusList() {
    await this.subscriptions.add(
     this.apiRequest.getRequest(this.getVerificationStatusListURI)
     .subscribe((response) => {
       //this.verificationStatusList = JSON.parse(response);
       let verificationStatuses = JSON.parse(response);
       let result = verificationStatuses.findIndex(x => x.allergyverificationstatus_id == 'Refuted');
      if(result != -1){
        verificationStatuses.splice(result,1);
        this.verificationStatusList = verificationStatuses;
      }
     })
   )
  }

  save() {
    this.viewClosed.emit(true);
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

  constructor(private apiRequest: ApirequestService, 
    public appService: AppService, 
    private subjects: SubjectsService, 
    private spinner: NgxSpinnerService, 
    private toasterService: ToasterService, 
    private modalService: BsModalService, 
    @Inject(LOCALE_ID) private locale: string, 
    private confirmationDialogService: ConfirmationDialogService, 
    private allergyLookupDescriptionsService: AllergyLookupDescriptionsService, 
    private allergyHistoryViewerService: AllergyHistoryViewerService,
    private allergyService: AllergiesService) {
      this.saving = false;

      this.allergyIntolerance = {} as AllergyIntolerance;

      this.allergyIntolerance.allergyintolerance_id = String(Guid.create());
      this.allergyIntolerance.person_id = this.personId;
      this.allergyIntolerance.encounter_id = null;


      this.allergyIntolerance.clinicalstatusvalue = "Active";
      this.allergyIntolerance.clinicalstatusby = this.appService.loggedInUserName;
      this.allergyIntolerance.cliinicialstatusdatetime = this.allergyService.getDateTime();

      this.allergyIntolerance.category = "Allergy";
      this.allergyIntolerance.criticality = "Life Threatening";

      this.allergyIntolerance.onsetdate = this.allergyService.getDate();
      this.allergyIntolerance.enddate = null;
      this.allergyIntolerance.lastoccurencedate = this.allergyService.getDate();

      // this.allergyIntolerance.reportedbygroup = JSON.parse('[ { "allergyreportedbygroup_id": "Patient", "groupname": "Patient" } ]');
      this.allergyIntolerance.reportedbygroup = JSON.parse('[ { "allergysources_id": "60df7d7e-5187-4105-97c0-689c2b8d2fbd", "source": "Patient - verbal" } ]');
      this.allergyIntolerance.reportedbyname = this.appService.currentPersonName;
      this.allergyIntolerance.reportedbydatetime = this.allergyService.getDateTime();

      this.allergyIntolerance.recordedby = this.appService.loggedInUserName;
      this.allergyIntolerance.recordeddatetime = this.allergyService.getDateTime();

      this.allergyIntolerance.verificationstatus = "Confirmed";
      this.allergyIntolerance.assertedby = this.appService.loggedInUserName;
      this.allergyIntolerance.asserteddatetime = this.allergyService.getDateTime();

      this.allergyIntolerance. allergynotes = null;
      this.allergyIntolerance.manifestationnotes = null;

      this.allergyIntolerance.allergyconcept = {} as SNOMED;
      this.allergyIntolerance.reactionconcepts = [] as SNOMED[];

      this.allergyIntolerance.displaywarning = "No errors";

      this.allergyIntolerance.clinicalstatusdt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
      this.allergyIntolerance.reportedbydt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
      this.allergyIntolerance.asserteddt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
      this.allergyIntolerance.recordeddt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
      
  } 

  async cancelAddingAllergy() {
    var displayConfirmation = this.appService.displayWarnings;
    if(displayConfirmation) {
      var response = false;
      await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to cancel adding an allergy and intolerance?')
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {
        return;
      }
    }
    this.allergyService.resetAllergy();
    this.selectedAllergiesView = "list";
    this.viewChange.emit(this.selectedAllergiesView);

  }

  // replaceAll(str, find, replace) {
  //   if(!str) {
  //     return null;
  //   }
  //   return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
  // }

  onCategoryChange(event)
  {
    this.allergyIntolerance.criticality = "";
    if(event.target.value == 'Sensitivity Intolerance')
    {
      let criticality = this.criticalityList;
      let result = criticality.findIndex(x => x.allergycriticality_id == 'Life Threatening');
      if(result != -1){
        criticality.splice(result,1);
        this.criticalityList = criticality;
        this.allergyIntolerance.criticality = "Non-Life Threatening";
      }
    }
    else{
      this.getCriticalityList(event);
    }
  }


  async saveAddAllergy() {

    var displayConfirmation = this.appService.displayWarnings;
    if(displayConfirmation) {
      var response = false;
      await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to add this allergy and intolerance?')
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {
        return;
      }
    }

    let allergyIntolerance = Object.assign({}, this.allergyIntolerance);

    //Supply any prompts to deal with complex logic
    if(allergyIntolerance.verificationstatus === "Entered in error" && allergyIntolerance.clinicalstatusvalue == 'Active') {
      var response = false;
      await this.confirmationDialogService.confirm("Please confirm", "Verification status is 'Entered in error' and status is 'Active'. Do you want to update the status to 'Inactive'?")
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {
        return;
      }
      else {
        allergyIntolerance.clinicalstatusvalue = "Inactive";
      }
    }


    this.showAllergyReactions = false;

    //Update any logic
    if(allergyIntolerance.clinicalstatusvalue === 'Active') {
      allergyIntolerance.enddate = null;
    }

    // this.saving = true;
    if(allergyIntolerance.allergyconcept.fsn)
    {
      var extractTypeOfAllergen = allergyIntolerance.allergyconcept.fsn.slice(allergyIntolerance.allergyconcept.fsn.indexOf("("), allergyIntolerance.allergyconcept.fsn.length); 
      allergyIntolerance.allergentype = extractTypeOfAllergen.replace(/[()]/g, '');
    }
    else{
      allergyIntolerance.allergentype = '';
    }
    
    allergyIntolerance.allergyconcept = JSON.stringify(allergyIntolerance.allergyconcept);
    
    if(allergyIntolerance.reactionconcepts.length == 0){
      allergyIntolerance.reactionconcepts = JSON.stringify([{"term": "Not recorded", "code": "1220561009", "bindingValue": "1220561009 | Not recorded", "fsn": "Not recorded (qualifier value)", "level": 0, "parentCode": null}]);
    }
    else{
      allergyIntolerance.reactionconcepts = JSON.stringify(allergyIntolerance.reactionconcepts);
    }

    
    allergyIntolerance.reportedbygroup = JSON.stringify(allergyIntolerance.reportedbygroup);
    allergyIntolerance.reactiontext = JSON.stringify(allergyIntolerance.reactionconcepts);
    allergyIntolerance.lastupdatedrecorddatetime = this.allergyService.getDateTime();

    allergyIntolerance.lastupdatedrecorddt = this.allergyService.getDateTimeinISOFormat(moment().toDate());

    if(allergyIntolerance.manifestationnotes)
    {
      allergyIntolerance.manifestationnotes = allergyIntolerance.manifestationnotes.trim();
    }
    

    //console.log('verificationstatus: ' + allergyIntolerance.verificationstatus + ' - ' + this.uneditedAllergyIntollerence.verificationstatus);

    //Convert any dates
    allergyIntolerance.onsetdate = allergyIntolerance.onsetdate as Date;
    allergyIntolerance.enddate = allergyIntolerance.enddate as Date;
    allergyIntolerance.lastoccurencedate = allergyIntolerance.lastoccurencedate as Date;
    allergyIntolerance.person_id = this.personId;



    //update the entity record
    await this.subscriptions.add(
      this.apiRequest.postRequest(this.postAllergyURI, allergyIntolerance)
        .subscribe((response) => {

          this.saving = false;

          
          //Update patient banner
          this.subjects.frameworkEvent.next("UPDATE_HEIGHT_WEIGHT");
          // this.toasterService.showToaster("Success","Allergy and Intolerance Saved");
          this.getAllergyListForPerson();

          if(this.appService.appConfig.appsettings.can_send_notification)
            publishSenderNotificationWithParams('ALLERGIES_ADDED', null, null,  AudienceType.ALL_SESSIONS_EXCEPT_CURRENT_SESSION, null, true, false, 'allergies_added_notif_msg');

          if(this.allergyIntolerance.causativeagentcodesystem != "NON-ALLERGY" && this.allergyIntolerance.clinicalstatusvalue === "Active") {
            this.allergyIntoleranceList.forEach( (element) => {

              if(element.causativeagentcodesystem == "NON-ALLERGY" && element.clinicalstatusvalue === "Active" ) {
                //this.markAllergyInactive(element);

                delete element['poaonly'];
                delete element['poaname'];
                element.reportedbygroup = JSON.parse(element.reportedbygroup);
                element.reportedbygroup = JSON.stringify(element.reportedbygroup);
                element.clinicalstatusvalue = 'Inactive';
                element.enddate = this.allergyService.getDate();

                //update the entity record
                this.subscriptions.add(
                  this.apiRequest.postRequest(this.postAllergyURI, element)
                    .subscribe((response) => {
                      //Update patient banner
                      this.subjects.frameworkEvent.next("UPDATE_HEIGHT_WEIGHT");
                      this.getAllergyListForPerson();
                      // this.toasterService.showToaster("Info", element.causativeagentdescription + ' set to inactive');
                    })
                  )

                  this.showAllergyReactions = true;

              }
          });

          }

          this.allergyService.resetAllergy();

          this.selectedAllergiesView = "list";
          setTimeout(() => {
            this.viewChange.emit(this.selectedAllergiesView);
          }, 2000);
          
        })
      )
  }

  // async markAllergyInactive(allergy: AllergyIntolerance) {
  //   allergy.clinicalstatusvalue = 'Inactive';
  //   allergy.enddate = this.getDate();

  //   //update the entity record
  //   await this.subscriptions.add(
  //     this.apiRequest.postRequest(this.postAllergyURI, allergy)
  //       .subscribe((response) => {
  //         this.toasterService.showToaster("Info", allergy.causativeagentdescription + ' set to inactive');
  //       })
  //     )
  // }

  reportedByMe() {
    this.allergyIntolerance.reportedbyname = this.appService.loggedInUserName;
  }

  reportedByPatient() {
    this.allergyIntolerance.reportedbyname = this.appService.currentPersonName;
  }

  endDateToday() {
    this.allergyIntolerance.enddate = new Date (this.allergyService.getDate() as Date);
  }

  async reverifyAllergy() {
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
    this.allergyIntolerance.assertedby = this.appService.loggedInUserName;
    this.allergyIntolerance.asserteddatetime = this.allergyService.getDateTime();
    this.allergyIntolerance.asserteddt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
    this.toasterService.showToaster('info', "Reverified - will be actioned on save");
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

  // Terminology

  results: SNOMED[] = [];
  resultsReactions: SNOMED[] = [];

  otherConcept: TerminologyConcept = {
      concept_id: 9177,
      conceptcode: "74964007",
      conceptname: "Non-coded"
  }

  addNonCodedAllergy: boolean;

  search(event) {
    this.addNonCodedAllergy = false;
    const result = /^(?=.*\S).+$/.test(event.query);
    if(result)
    {
      this.subscriptions.add(
        this.apiRequest.getRequest(this.appService.terminologyURI.replace("VALUE", event.query + "/substance?api-version=1.0"))
            .subscribe((response) => {
                let resultsFromDb: SNOMED[] = [];



                let concept: SNOMED = new SNOMED();
                concept.code = this.otherConcept.conceptcode;
                // concept.term = event.query + ' (Non-coded)';
                concept.term = event.query;

                resultsFromDb.push(concept);

                response.data.forEach((item) => {
                    let snomedData: SNOMED = new SNOMED();
                    snomedData.code = item.code;
                    snomedData.fsn = item.fsn;
                    snomedData.level = item.level;
                    snomedData.parentCode = item.parentCode;
                    snomedData.term = item.term;
                    resultsFromDb.push(snomedData);
                })
                this.results = resultsFromDb;
            })
      );
    }
    
}

selectedValue(diag: SNOMED) {

    // console.log(diag.code);

    // if(!diag) {
    //   console.log('You have selected an invalid allergen');
    // }
    // let selectedAllergy = [];

    // if (diag.code == this.otherConcept.conceptcode) {
    //     selectedAllergy = this.operationDiagnosis.filter(x =>
    //         (x.diagnosistext.toLowerCase().replace(/ /g, '') == diag.term.toLowerCase().replace(/ /g, '')));
    // }
    // else {
    //     selectedAllergy = this.operationDiagnosis.filter(x => x.diagnosiscode == diag.code);
    // }

    // if (addedProcs.length == 0) {
    //     let diagnosis: CoreDiagnosis = new CoreDiagnosis();
    //     diagnosis.diagnosis_id = diag.code + '|' + this.operationId,
    //         diagnosis.operation_id = this.operationId,
    //         diagnosis.statuscode = 'Active',
    //         diagnosis.statustext = 'Active',
    //         diagnosis.diagnosiscode = diag.code,
    //         diagnosis.diagnosistext = diag.term

      //     this.operationDiagnosis.push(diagnosis);
      // }
  }

  get existingAllergies(): AllergyWithMeta[] {
    if(!this.allergyIntoleranceList) {
      //console.log(1);
      return [] as AllergyWithMeta[];
    }
    if(!this.allergyIntolerance.allergyconcept) {
      //console.log(2);
      return [] as AllergyWithMeta[];
    }

    if(this.allergyIntolerance.allergyconcept.code === '74964007') {
      //console.log(2);
      return [] as AllergyWithMeta[];
    }

    //console.log(3);
    //console.log(this.allergyIntolerance.allergyconcept);
    return this.allergyIntoleranceList.filter((a) =>
      a.causativeagentcode == this.allergyIntolerance.allergyconcept.code
    );
  }


  unSelectedValue(event) {
      // this.confirmationService.confirm({
      //     message: 'Are you sure that you want to delete this diagnosis?',
      //     accept: () => {
      //         for (var i = 0; i < this.operationDiagnosis.length; i++) {
      //             if (this.operationDiagnosis[i].diagnosistext === event.term) {
      //                 this.operationDiagnosis.splice(i, 1);
      //                 i--;
      //             }
      //         }
      //     },
      //     reject: () => {
      //         this.ac.selectItem(event);
      //     }
      // });
  }

  clearSelectedAllergy() {
    this.allergyIntolerance.allergyconcept = null;
    this.addNonCodedAllergy = false;
    this.allergyIntolerance.category = "Allergy";
    this.allergyIntolerance.criticality = "Life Threatening";
  }

  addAllergyStep1Next() {
    this.allergyIntolerance.causativeagentcode = this.allergyIntolerance.allergyconcept.code;
    this.allergyIntolerance.causativeagentcodesystem = 'SNOMED CT';
    this.allergyIntolerance.causativeagentdescription = this.allergyIntolerance.allergyconcept.term;
    //this.allergyIntolerance.allergyconcept = this.allergyIntolerance.allergyconcept;
    this.addAllergyStep = 2;
  }

  addAllergyStep2Next() {
    //this.allergyIntolerance.reactionconcepts = this.reactionsToAdd;
    this.addAllergyStep = 3;
  }

  addAllergyStep2Back() {
    this.addAllergyStep = 1;
  }

  addAllergyStep3Back() {
    this.addAllergyStep = 2;
  }

//
searchReactions(event) {
  const result = /^(?=.*\S).+$/.test(event.query);
  if(result)
  {
    this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.terminologyURI.replace("VALUE", event.query + "/disorder?api-version=1.0"))
          .subscribe((response) => {
              let resultsFromDb: SNOMED[] = [];



              let concept: SNOMED = new SNOMED();
              concept.code = this.otherConcept.conceptcode;
              // concept.term = event.query + ' (Non-coded)';
              concept.term = event.query;

              resultsFromDb.push(concept);

              response.data.forEach((item) => {
                  let snomedData: SNOMED = new SNOMED();
                  snomedData.code = item.code;
                  snomedData.fsn = item.fsn;
                  snomedData.level = item.level;
                  snomedData.parentCode = item.parentCode;
                  snomedData.term = item.term;
                  resultsFromDb.push(snomedData);
              })
              this.resultsReactions = resultsFromDb;
          })
    );
  }
  
}

selectReactionValue(diag: SNOMED) {

  // console.log(diag.code);

  // if(!diag) {
  //   console.log('You have selected an invalid allergen');
  // }
  // let selectedAllergy = [];

  // if (diag.code == this.otherConcept.conceptcode) {
  //     selectedAllergy = this.operationDiagnosis.filter(x =>
  //         (x.diagnosistext.toLowerCase().replace(/ /g, '') == diag.term.toLowerCase().replace(/ /g, '')));
  // }
  // else {
  //     selectedAllergy = this.operationDiagnosis.filter(x => x.diagnosiscode == diag.code);
  // }

  // if (addedProcs.length == 0) {
  //     let diagnosis: CoreDiagnosis = new CoreDiagnosis();
  //     diagnosis.diagnosis_id = diag.code + '|' + this.operationId,
  //         diagnosis.operation_id = this.operationId,
  //         diagnosis.statuscode = 'Active',
  //         diagnosis.statustext = 'Active',
  //         diagnosis.diagnosiscode = diag.code,
  //         diagnosis.diagnosistext = diag.term

    //     this.operationDiagnosis.push(diagnosis);
    // }
}


unSelectReactionValue(event) {
    // this.confirmationService.confirm({
    //     message: 'Are you sure that you want to delete this diagnosis?',
    //     accept: () => {
    //         for (var i = 0; i < this.operationDiagnosis.length; i++) {
    //             if (this.operationDiagnosis[i].diagnosistext === event.term) {
    //                 this.operationDiagnosis.splice(i, 1);
    //                 i--;
    //             }
    //         }
    //     },
    //     reject: () => {
    //         this.ac.selectItem(event);
    //     }
    // });
}
//

async viewDescription(option: string) {
      var response = false;
      await this.allergyLookupDescriptionsService.confirm(option, 'Allergy and Intolerance Descriptions')
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
}

async viewHistory() {
    var response = false;
    await this.allergyHistoryViewerService.confirm(this.allergyIntolerance.allergyintolerance_id, 'General History','','Import')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
    else {
    // await this.getSelectedFormWithContext();
    }
  }


async saveAllergy(){

  var displayConfirmation = this.appService.displayWarnings;
    if(displayConfirmation) {
      var response = false;
      await this.confirmationDialogService.confirm('Please confirm', 'Are you sure that you want to add this allergy and intolerance?')
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {
        return;
      }
    }

    let allergyIntolerance = Object.assign({}, this.allergyIntolerance);

    this.showAllergyReactions = false;

    allergyIntolerance.allergyintolerance_id = String(Guid.create());
    allergyIntolerance.person_id = this.personId;
    allergyIntolerance.encounter_id = null;
    allergyIntolerance.clinicalstatusvalue = 'Active'
    allergyIntolerance.clinicalstatusby = this.appService.loggedInUserName;
    allergyIntolerance.cliinicialstatusdatetime = this.allergyService.getDateTime();

    allergyIntolerance.reportedbygroup = '[ { "allergysources_id": "60df7d7e-5187-4105-97c0-689c2b8d2fbd", "source": "Patient - verbal" } ]';
    allergyIntolerance.reportedbyname = this.appService.currentPersonName;
    allergyIntolerance.reportedbydatetime = this.allergyService.getDateTime();

    allergyIntolerance.recordedby = this.appService.loggedInUserName;
    allergyIntolerance.recordeddatetime = this.allergyService.getDateTime();

    allergyIntolerance.verificationstatus = "Confirmed";
    allergyIntolerance.assertedby = this.appService.loggedInUserName;
    allergyIntolerance.asserteddatetime = this.allergyService.getDateTime();

    // this.saving = true;
    if(allergyIntolerance.allergyconcept.fsn)
    {
      var extractTypeOfAllergen = allergyIntolerance.allergyconcept.fsn.slice(allergyIntolerance.allergyconcept.fsn.indexOf("("), allergyIntolerance.allergyconcept.fsn.length); 
      allergyIntolerance.allergentype = extractTypeOfAllergen.replace(/[()]/g, '');
    }
    else{
      allergyIntolerance.allergentype = '';
    }

    allergyIntolerance.causativeagentcode = allergyIntolerance.allergyconcept.code;
    allergyIntolerance.causativeagentcodesystem = 'SNOMED CT';
    allergyIntolerance.causativeagentdescription = allergyIntolerance.allergyconcept.term;
    
    allergyIntolerance.allergyconcept = JSON.stringify(allergyIntolerance.allergyconcept);
    allergyIntolerance.reactionconcepts = JSON.stringify([{"term": "Not recorded", "code": "1220561009", "bindingValue": "1220561009 | Not recorded", "fsn": "Not recorded (qualifier value)", "level": 0, "parentCode": null}]);
    
    allergyIntolerance.reactiontext = JSON.stringify(allergyIntolerance.reactionconcepts);
    allergyIntolerance.lastupdatedrecorddatetime = this.allergyService.getDateTime();

    allergyIntolerance.manifestationnotes = null;

    allergyIntolerance. allergynotes = null;

    allergyIntolerance.onsetdate = this.allergyService.getDate();
    allergyIntolerance.enddate = null;
    allergyIntolerance.lastoccurencedate = this.allergyService.getDate();
    allergyIntolerance.displaywarning = "No errors";

    allergyIntolerance.clinicalstatusdt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
    allergyIntolerance.reportedbydt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
    allergyIntolerance.asserteddt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
    allergyIntolerance.recordeddt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
    allergyIntolerance.lastupdatedrecorddt = this.allergyService.getDateTimeinISOFormat(moment().toDate());

  await this.subscriptions.add(
    this.apiRequest.postRequest(this.postAllergyURI, allergyIntolerance)
      .subscribe((response) => {

        this.saving = false;

        
        //Update patient banner
        this.subjects.frameworkEvent.next("UPDATE_HEIGHT_WEIGHT");
        // this.toasterService.showToaster("Success","Allergy and Intolerance Saved");
        this.getAllergyListForPerson();

        if(this.appService.appConfig.appsettings.can_send_notification)
          publishSenderNotificationWithParams('ALLERGIES_ADDED', null, null,  AudienceType.ALL_SESSIONS_EXCEPT_CURRENT_SESSION, null, true, false, 'allergies_added_notif_msg');

        if(this.allergyIntolerance.causativeagentcodesystem != "NON-ALLERGY" && this.allergyIntolerance.clinicalstatusvalue === "Active") {
          this.allergyIntoleranceList.forEach( (element) => {

            if(element.causativeagentcodesystem == "NON-ALLERGY" && element.clinicalstatusvalue === "Active" ) {
              //this.markAllergyInactive(element);

              delete element['poaonly'];
              delete element['poaname'];
              element.reportedbygroup = JSON.parse(element.reportedbygroup);
              element.reportedbygroup = JSON.stringify(element.reportedbygroup);
              element.clinicalstatusvalue = 'Inactive';
              element.enddate = this.allergyService.getDate();

              //update the entity record
              this.subscriptions.add(
                this.apiRequest.postRequest(this.postAllergyURI, element)
                  .subscribe((response) => {
                    //Update patient banner
                    this.subjects.frameworkEvent.next("UPDATE_HEIGHT_WEIGHT");
                    this.getAllergyListForPerson();
                    // this.toasterService.showToaster("Info", element.causativeagentdescription + ' set to inactive');
                  })
                )

                this.showAllergyReactions = true;

            }
        });

        }

        this.allergyService.resetAllergy();

        this.selectedAllergiesView = "list";
        setTimeout(() => {
          this.viewChange.emit(this.selectedAllergiesView);
        }, 2000);
        
      })
    )
}

}
