//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2024  Interneuron Holdings Ltd

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
// import { escapeRegExp } from '@angular/compiler/src/util';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Subscription } from 'rxjs';
import { AllergyWithMeta } from '../models/baseviews/allergy-with-meta';
import { AllergyCategory } from '../models/entities/allergy-category';
import { AllergyClinicalStatus } from '../models/entities/allergy-clinical-status';
import { AllergyCriticality } from '../models/entities/allergy-criticality';
import { AllergyIntolerance } from '../models/entities/allergy-intolerance';
import { AllergyReportedByGroup } from '../models/entities/allergy-reported-by-group';
import { AllergyVerificationStatus } from '../models/entities/allergy-verification-status';
import { Person } from '../models/entities/core-person.model';
import { SNOMED } from '../models/snomed-model';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { AllergyHistoryViewerService } from '../allergy-history-viewer/allergy-history-viewer.service';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { ToasterService } from '../services/toaster-service.service';
import { SubjectsService } from '../services/subjects.service';
import { TerminologyConcept } from '../models/terminology-concept';
import { AllergyLookupDescriptionsService } from '../allergy-lookup-descriptions/allergy-lookup-descriptions.service';
import { AllergiesService } from '../services/allergies.service';
import { AllergySources } from '../models/entities/allergy-source';
import { AudienceType, NotificationClientContext, publishSenderNotificationWithParams } from '../notification/lib/notification.observable.util';
import * as moment from 'moment';
@Component({
  selector: 'app-edit-allergy',
  templateUrl: './edit-allergy.component.html',
  styleUrls: ['./edit-allergy.component.css']
})
export class EditAllergyComponent {

  subscriptions: Subscription = new Subscription();

  personId: string;

  allergyIntolerance: AllergyIntolerance;

  allergyIntoleranceList: AllergyWithMeta[];
  categoryList: AllergyCategory[];
  clinicalStatusList: AllergyClinicalStatus[];
  criticalityList: AllergyCriticality[];
  verificationStatusList: AllergyVerificationStatus[];
  reportedByGroupList: AllergyReportedByGroup[];
  sourceList: AllergySources[];

  showAllergyReactions: boolean;

  maxDateValue: Date = new Date();

  minDateValue: Date;

  saving: boolean = false;

  refreshingList: boolean;

  bsConfig: any;

  addAllergyStep: Number = 1;

  oldVerificationStatus: string;
  oldreportedbyname: string;
  oldreportedbygroup: string;

  displayWarningMessage: String;

  allergyintolerance_id: string;

  reverifyFlag: boolean = false;

  cloneAllergyData:any;

  disableDropdown: boolean = false;

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
  getCategoryListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergycategory&orderby=displayorder ASC";
  getClinicalStatusListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergyclinicalstatus&orderby=displayorder ASC";
  getCriticalityListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergycriticality&orderby=displayorder ASC";
  getVerificationStatusListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergyverificationstatus&orderby=displayorder ASC";
  getReportedByGroupListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergyreportedbygroup&orderby=displayorder ASC";
  getAllergyURI: string = this.appService.baseURI + "/GetObject?synapsenamespace=core&synapseentityname=allergyintolerance&id=";
  postAllergyURI: string = this.appService.baseURI + "/PostObject?synapsenamespace=core&synapseentityname=allergyintolerance";
  getSourceListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergysources&orderby=displayname ASC";

  @Output() viewChange: EventEmitter<any> = new EventEmitter();

  @Input("notifyAddAllergy") selectedAllergiesView: string;
  @Input("allergy") set allergy(value: AllergyIntolerance) {
    this.allergyintolerance_id = value.allergyintolerance_id;
    this.initialiseData();
  }

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

    this.initialiseFunctions();

  };
  get person(): Person { return this._person; }

  constructor(private apiRequest: ApirequestService, 
    public appService: AppService, 
    private allergyHistoryViewerService: AllergyHistoryViewerService, 
    private confirmationDialogService: ConfirmationDialogService,
    private toasterService: ToasterService, 
    private subjects: SubjectsService,
    private allergyLookupDescriptionsService: AllergyLookupDescriptionsService,
    private allergyService: AllergiesService) { 
    

  }

  async initialiseFunctions() {
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
    if(this.allergyIntoleranceList != undefined)
    {
      return this.allergyIntoleranceList.filter((a) =>
        a.clinicalstatusvalue == 'Active' && a.causativeagentcodesystem != "NON-ALLERGY"
      );
    }
  }

  get activeAllergiesAndFlags(): AllergyWithMeta[] {
    
    if(this.allergyIntoleranceList != undefined)
    {
      return this.allergyIntoleranceList.filter((a) =>
        a.clinicalstatusvalue == 'Active' && a.causativeagentcode != this.allergyIntolerance.causativeagentcode
      );
    }
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

       this.sourceList.forEach((element) => {
        if(element.displayname == 'GP connect'){
          element.isDisabled = true;
        }
        else{
          element.isDisabled = false;
        }
       })
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

  initialiseData()
  {
    this.saving = false;

    this.showAllergyReactions = false;

    var getAllergyAddress = this.getAllergyURI + this.allergyintolerance_id;
    //this.getAllergyURI = this.getAllergyURI + allergy.allergyintolerance_id;

    this.subscriptions.add(
      this.apiRequest.getRequest(getAllergyAddress)
      .subscribe((response) => {
        this.allergyIntolerance = JSON.parse(response);

        // this.getCriticalityList();

        if(this.allergyIntolerance.reportedbygroup != '') {
          if(this.allergyIntolerance.reportedbygroup.includes("GP connect")){
            this.disableDropdown = true;
          }
          else{
            this.disableDropdown = false;
          }
          this.ParseJSONStringToObject(this.allergyIntolerance.reportedbygroup);
          
          
        } else {
          this.allergyIntolerance.reportedbygroup = JSON.parse('[]');
        }

        // try {
        //   this.allergyIntolerance.reportedbygroup = JSON.parse(this.allergyIntolerance.reportedbygroup);
        //   console.log('true json parse',this.allergyIntolerance.reportedbygroup)
        // }
        // catch(ex) {
        //   this.allergyIntolerance.reportedbygroup = JSON.parse('[]');
        //   console.log('false json parse',this.allergyIntolerance.reportedbygroup)
        // }

        this.oldVerificationStatus = this.allergyIntolerance.verificationstatus;
        this.oldreportedbyname = this.allergyIntolerance.reportedbyname;
        this.oldreportedbygroup = this.allergyIntolerance.reportedbygroup;
        this.checkActiveEnteredInError();

        //Convert any dates
      if(!this.allergyIntolerance.onsetdate)
      {
        this.allergyIntolerance.onsetdate = null;
      }
      else
      {
        this.allergyIntolerance.onsetdate = new Date (this.allergyIntolerance.onsetdate as Date);
      }

      if(!this.allergyIntolerance.enddate)
      {
        this.allergyIntolerance.enddate = null;
      }
      else
      {
        this.allergyIntolerance.enddate = new Date (this.allergyIntolerance.enddate as Date);
      }

      if(!this.allergyIntolerance.lastoccurencedate)
      {
        this.allergyIntolerance.lastoccurencedate = null;
      }
      else
      {
        this.allergyIntolerance.lastoccurencedate = new Date (this.allergyIntolerance.lastoccurencedate as Date);
      }

      //Cast concept strings to concepts
      if(this.allergyIntolerance.category == "Flag") {
        this.allergyIntolerance.reactionconcepts = '[{"_term":"flag","_code":"flag","bindingValue":"flag | flag","fsn":"flag","level":0,"parentCode":null}]';
      }

      if(this.allergyIntolerance.category == "Flag") {
        this.allergyIntolerance.allergyconcept = '{"_term":"flag","_code":"flag","bindingValue":"flag | flag","fsn":"flag","level":0,"parentCode":null}';
      }

      this.allergyIntolerance.allergyconcept = JSON.parse(this.allergyIntolerance.allergyconcept) as SNOMED;

      this.allergyIntolerance.reactionconcepts = this.replaceAll(this.allergyIntolerance.reactionconcepts, '_term', 'term');
      this.allergyIntolerance.reactionconcepts = this.replaceAll(this.allergyIntolerance.reactionconcepts, '_code', 'code');
      this.allergyIntolerance.reactionconcepts = JSON.parse(this.allergyIntolerance.reactionconcepts) as SNOMED[];

      this.allergyIntolerance.criticality = this.allergyIntolerance.criticality;

      //this.allergyIntolerance.asserteddatetime =  new Date(this.allergyIntolerance.asserteddatetime).toISOString(); 
      //this.allergyIntolerance.recordeddatetime =  new Date(this.allergyIntolerance.recordeddatetime).toISOString(); 

      this.selectedAllergiesView = "edit";

      this.showAllergyReactions = true;

        setTimeout(() => {
          if(this.allergyIntolerance.category == 'Sensitivity Intolerance')
          {
            let criticality = this.criticalityList;
            let result = criticality.findIndex(x => x.allergycriticality_id == 'Life Threatening');
            if(result != -1){
              criticality.splice(result,1);
              this.criticalityList = criticality;
            }
          }
        }, 1000);

        this.minDateValue = new Date(this.allergyIntolerance.recordeddt);

        this.cloneAllergyData = Object.assign({}, this.allergyIntolerance);
       
      })
    )
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
    return str.replace(new RegExp(this.escapeRegex(find), 'g'), replace);
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

  async cancelEditingAllergy() {
    if(JSON.stringify(this.cloneAllergyData) != JSON.stringify(this.allergyIntolerance))
    {
      var displayConfirmation = this.appService.displayWarnings;
      if(displayConfirmation) {
        var response = false;
        await this.confirmationDialogService.confirm('Please confirm', 'You have unsaved data. Do you want to save before leaving?')
        .then((confirmed) => response = confirmed)
        .catch(() => response = false);
        if(!response) {
          this.selectedAllergiesView = "list";
          this.viewChange.emit(this.selectedAllergiesView);
        }
        else{
          this.saveEditAllergy();
        }
      }
    }
    else{
      this.allergyService.resetAllergy();
      this.selectedAllergiesView = "list";
      this.viewChange.emit(this.selectedAllergiesView);
    }
    
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
    this.reverifyFlag = true;
    this.toasterService.showToaster('info', "Reverified - will be actioned on save");
  }

  async viewDescription(option: string) {
    var response = false;
    // console.log(option);
    await this.allergyLookupDescriptionsService.confirm(option, 'Allergy Descriptions')
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

  onCategoryChange(event)
  {
    this.allergyIntolerance.criticality = '';
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

  async saveEditAllergy() {

    let updatedData = Object.assign({}, this.allergyIntolerance);

    //Supply any prompts to deal with complex logic
    if(updatedData.verificationstatus === "Entered in error" && updatedData.clinicalstatusvalue == 'Active') {
      var response = false;
      await this.confirmationDialogService.confirm("Please confirm", "Verification status is 'Entered in error' and status is 'Active'. Do you want to update the status to 'Inactive'?")
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {

      }
      else {
        updatedData.clinicalstatusvalue = "Inactive";
      }
    }

    //Update any logic
    if(updatedData.clinicalstatusvalue === 'Active') {
      updatedData.enddate = null;
    }

    //console.log('verificationstatus: ' + updatedData.verificationstatus + ' - ' + this.uneditedAllergyIntollerence.verificationstatus);

    // if(updatedData.verificationstatus != this.oldVerificationStatus) {
      updatedData.assertedby = this.appService.loggedInUserName;
      updatedData.asserteddatetime = this.allergyService.getDateTime();
      updatedData.asserteddt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
    // }

    if(updatedData.reportedbyname != this.oldreportedbyname) {
      updatedData.reportedbydatetime = this.allergyService.getDateTime();
      updatedData.reportedbydt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
    }

    if(updatedData.reportedbygroup != this.oldreportedbygroup) {
      updatedData.reportedbydatetime = this.allergyService.getDateTime();
      updatedData.reportedbydt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
    }

    if(!this.reverifyFlag)
    {
      updatedData.recordeddatetime = this.allergyService.getDateTime();
      updatedData.recordeddt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
    }
    

    this.showAllergyReactions = false;
    //Convert any dates
    updatedData.onsetdate = updatedData.onsetdate as Date;
    if(updatedData.enddate)
    { 
      updatedData.enddate = this.allergyService.getDateTimeinISOFormat(updatedData.enddate);
    }
    
    updatedData.lastoccurencedate = updatedData.lastoccurencedate as Date;

    //Convert concepts to strings
    // this.saving = true;

    updatedData.allergyconcept = JSON.stringify(updatedData.allergyconcept);
  
    if(updatedData.reactionconcepts.length == 0){
      updatedData.reactionconcepts = '[{"term": "Not recorded", "code": "1220561009", "bindingValue": "1220561009 | Not recorded", "fsn": "Not recorded (qualifier value)", "level": 0, "parentCode": null}]';
    }
    else{
      updatedData.reactionconcepts = JSON.stringify(updatedData.reactionconcepts);
    }
    
    updatedData.reportedbygroup = JSON.stringify(updatedData.reportedbygroup);
    updatedData.reactiontext = JSON.stringify(updatedData.reactionconcepts);
    updatedData.lastupdatedrecorddatetime = this.allergyService.getDateTime();
    updatedData.lastupdatedrecorddt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
    if(updatedData.manifestationnotes)
    {
      updatedData.manifestationnotes = updatedData.manifestationnotes.trim();
    }

    //update the entity record
    await this.subscriptions.add(
      this.apiRequest.postRequest(this.postAllergyURI, updatedData)
        .subscribe((response) => {

          this.saving = false;

          //Update patient banner
          this.subjects.frameworkEvent.next("UPDATE_HEIGHT_WEIGHT");
          // this.toasterService.showToaster("Success","Allergy Saved");   
          this.getAllergyListForPerson();

          if(this.appService.appConfig.appsettings.can_send_notification) {
            publishSenderNotificationWithParams('ALLERGIES_EDITED', null, null, AudienceType.ALL_SESSIONS_EXCEPT_CURRENT_SESSION, null, true, null, 'allergies_edited_notif_msg');
          }

          if(updatedData.causativeagentcodesystem != "NON-ALLERGY" && updatedData.clinicalstatusvalue === "Active") {
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
                      // this.toasterService.showToaster("Info", element.causativeagentdescription + ' set to inactive');
                      this.getAllergyListForPerson();
                      
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

// Terminology

results: SNOMED[] = [];
resultsReactions: SNOMED[] = [];

otherConcept: TerminologyConcept = {
  concept_id: 9177,
  conceptcode: "74964007",
  conceptname: "Non-coded"
}

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

  reportedByMe() {
    this.allergyIntolerance.reportedbyname = this.appService.loggedInUserName;
  }

  reportedByPatient() {
    this.allergyIntolerance.reportedbyname = this.appService.currentPersonName;
  }

  endDateToday() {
    this.allergyIntolerance.enddate = new Date(this.allergyService.getDate() as Date);
  }

  escapeRegex(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  ParseJSONStringToObject(reportedbygroup){
    if(typeof reportedbygroup == 'string'){
      this.allergyIntolerance.reportedbygroup = JSON.parse(this.allergyIntolerance.reportedbygroup);
      this.ParseJSONStringToObject(this.allergyIntolerance.reportedbygroup);
    }
  }

}
