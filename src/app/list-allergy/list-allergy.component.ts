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
// import { escapeRegExp } from '@angular/compiler/src/util';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { ToasterService } from '../services/toaster-service.service';
import { SubjectsService } from '../services/subjects.service';
import { AllergiesService } from '../services/allergies.service';
import * as moment from 'moment';
import { Allergy } from '../models/Allergy';

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

    // this.allergyIntolerance.reportedbygroup = '[ { "allergyreportedbygroup_id": "Patient", "groupname": "Patient" } ]';
    this.allergyIntolerance.reportedbygroup = '[ { "allergysources_id": "60df7d7e-5187-4105-97c0-689c2b8d2fbd", "source": "Patient - verbal" } ]';
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

    this.allergyIntolerance.clinicalstatusdt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
    this.allergyIntolerance.reportedbydt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
    this.allergyIntolerance.asserteddt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
    this.allergyIntolerance.recordeddt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
    this.allergyIntolerance.lastupdatedrecorddt = this.allergyService.getDateTimeinISOFormat(moment().toDate());

    this.subscriptions.add(
      this.apiRequest.postRequest(this.postAllergyURI, this.allergyIntolerance)
        .subscribe((response) => {

          //Update patient banner
          this.subjects.frameworkEvent.next("UPDATE_HEIGHT_WEIGHT");
          // this.toasterService.showToaster("Success","Not possible to ascertain recorded");
          this.allergyService.resetAllergy();
          this.getAllergyListForPerson();

          if(this.allergyIntolerance.causativeagentcodesystem == "NON-ALLERGY" && this.allergyIntolerance.clinicalstatusvalue === "Active") {
            this.allergyIntoleranceList.forEach( (element) => {
  
              if(element.causativeagentcodesystem == "NON-ALLERGY" && element.clinicalstatusvalue === "Active" ) {
                //this.markAllergyInactive(element);
                delete element['poaonly'];
                delete element['poaname'];
                element.reactionconcepts = JSON.stringify(element.reactionconcepts);
                // element.reportedbygroup = JSON.stringify(element.reportedbygroup);
  
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
  
              }
            });
  
          }

        })
      )

  }

  async initialiseData() {
    if(this.appService.enableGPConnect){
      this.getAllergiesDataFromGPConnect();
    }
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
        if(typeof element.reactionconcepts != 'string'){
          element.reactionconcepts = JSON.stringify(element.reactionconcepts);
        }
        element.reactionconcepts = JSON.parse(element.reactionconcepts);
        //this.allergyIntoleranceList[index].asserteddatetime = new Date(element.asserteddatetime).toISOString();
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

    // this.allergyIntolerance.reportedbygroup = '[ { "allergyreportedbygroup_id": "Patient", "groupname": "Patient" } ]';
    this.allergyIntolerance.reportedbygroup = '[ { "allergysources_id": "60df7d7e-5187-4105-97c0-689c2b8d2fbd", "source": "Patient - verbal" } ]';
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

    this.allergyIntolerance.clinicalstatusdt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
    this.allergyIntolerance.reportedbydt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
    this.allergyIntolerance.asserteddt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
    this.allergyIntolerance.recordeddt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
    this.allergyIntolerance.lastupdatedrecorddt = this.allergyService.getDateTimeinISOFormat(moment().toDate());

    this.subscriptions.add(
      this.apiRequest.postRequest(this.postAllergyURI, this.allergyIntolerance)
        .subscribe((response) => {

         //Update patient banner
         this.subjects.frameworkEvent.next("UPDATE_HEIGHT_WEIGHT");
        //  this.toasterService.showToaster("Success","No Allergies and Intolerances for patient recorded");
         this.allergyService.resetAllergy();
         this.getAllergyListForPerson();

         
         if(this.allergyIntolerance.causativeagentcodesystem == "NON-ALLERGY" && this.allergyIntolerance.clinicalstatusvalue === "Active") {
          this.allergyIntoleranceList.forEach( (element) => {

            if(element.causativeagentcodesystem == "NON-ALLERGY" && element.clinicalstatusvalue === "Active" ) {
              //this.markAllergyInactive(element);
              delete element['poaonly'];
              delete element['poaname'];
              element.reactionconcepts = JSON.stringify(element.reactionconcepts);
              // element.reportedbygroup = JSON.stringify(element.reportedbygroup);

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

            }
          });

        }

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
    data.asserteddt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
    
    delete data.poaname;
    delete data.poaonly;

    // this.allergyIntolerance = data;
    let updatedData = Object.assign({}, data);

    updatedData.allergyconcept = JSON.stringify(updatedData.allergyconcept);
    updatedData.reportedbygroup = JSON.stringify(updatedData.reportedbygroup);
    updatedData.reactionconcepts = JSON.stringify(updatedData.reactionconcepts);
    updatedData.lastupdatedrecorddatetime = this.allergyService.getDateTime();
    updatedData.lastupdatedrecorddt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
    updatedData.reactiontext = updatedData.reactionconcepts;

    //update the entity record
    await this.subscriptions.add(
      this.apiRequest.postRequest(this.postAllergyURI, updatedData)
        .subscribe((response) => {

          this.saving = false;

          //Update patient banner
          this.subjects.frameworkEvent.next("UPDATE_HEIGHT_WEIGHT");

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
      element.asserteddt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
      element.allergyconcept = JSON.stringify(element.allergyconcept);
      element.reportedbygroup = JSON.stringify(element.reportedbygroup);
      element.reactionconcepts = JSON.stringify(element.reactionconcepts);
      element.lastupdatedrecorddatetime = this.allergyService.getDateTime();
      element.lastupdatedrecorddt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
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

          //Update patient banner
          this.subjects.frameworkEvent.next("UPDATE_HEIGHT_WEIGHT");
          this.getAllergyListForPerson();

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
                      // this.toasterService.showToaster("Info", element.causativeagentdescription + ' set to inactive');
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
    return str.replace(new RegExp(this.escapeRegex(find), 'g'), replace);
  }

  escapeRegex(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  getAllergiesDataFromGPConnect() {
    this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.baseURI + "/GetListByAttribute?synapsenamespace=core&synapseentityname=personidentifier&synapseattributename=person_id&attributevalue=" + this.appService.personId)
        .subscribe((response) => {
          let nhsNumber = JSON.parse(response).filter(x => x.idtypecode == 'NHS');

          if (nhsNumber != null && nhsNumber.length > 0) {
            this.apiRequest.getRequest(this.appService.nhsDigitalURI + "/GPConnect/StructuredRecordByNHSNumber?nhsNumber=" + nhsNumber[0].idnumber)
              .subscribe((response) => {
                if (response && response.data && response.data.allergies) {

                  let allergy: Allergy[] = response.data.allergies;

                  if (allergy != null && allergy.length > 0) {
                    for (let index = 0; index < allergy.length; index++) {
                      const alrgy = allergy[index];

                      let allergyIntolerance = Object.assign({}, this.allergyIntolerance);

                      allergyIntolerance.allergyintolerance_id = String(Guid.create());
                      allergyIntolerance.person_id = this.appService.personId;
                      allergyIntolerance.encounter_id = null;
                      allergyIntolerance.clinicalstatusvalue = alrgy.clinicalStatus;
                      allergyIntolerance.clinicalstatusby = this.appService.loggedInUserName;
                      allergyIntolerance.cliinicialstatusdatetime = this.allergyService.getDateTime();
                      allergyIntolerance.reportedbygroup = '[{"allergysources_id": "9852bbb4-ed8e-4ac5-9c15-b18a1fb970f2", "source": "GP connect"}]';
                      allergyIntolerance.reportedbyname = this.appService.currentPersonName;
                      allergyIntolerance.reportedbydatetime = this.allergyService.getDateTime();
                      allergyIntolerance.recordedby = this.appService.loggedInUserName;
                      allergyIntolerance.recordeddatetime = this.allergyService.getDateTime();
                      allergyIntolerance.verificationstatus = "Confirmed";
                      allergyIntolerance.assertedby = this.appService.loggedInUserName;
                      allergyIntolerance.asserteddatetime = this.allergyService.getDateTime();
                      allergyIntolerance.lastupdatedrecorddatetime = this.allergyService.getDateTime();
                      allergyIntolerance.allergynotes = null;
                      allergyIntolerance.onsetdate = alrgy.startDate;
                      allergyIntolerance.enddate = alrgy.endDate != null ? alrgy.endDate : null;
                      allergyIntolerance.lastoccurencedate = alrgy.lastOccurrence;
                      allergyIntolerance.displaywarning = "No errors";
                      allergyIntolerance.clinicalstatusdt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
                      allergyIntolerance.reportedbydt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
                      allergyIntolerance.asserteddt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
                      allergyIntolerance.recordeddt = this.allergyService.getDateTimeinISOFormat(moment().toDate());
                      allergyIntolerance.lastupdatedrecorddt = this.allergyService.getDateTimeinISOFormat(moment().toDate());

                      if (alrgy.allergyType == null || (alrgy.allergyType != null && alrgy.allergyType.toLowerCase() == "allergy")) {
                        allergyIntolerance.category = "Allergy";
                      }

                      if (alrgy.allergyType != null && alrgy.allergyType.toLowerCase() == "intolerance") {
                        allergyIntolerance.category = "Sensitivity Intolerance";
                      }

                      if (alrgy.allergyCodes != null && alrgy.allergyCodes.length > 0) {
                        for (let i = 0; i < alrgy.allergyCodes.length; i++) {
                          const allergyCode = alrgy.allergyCodes[i];

                          allergyIntolerance.causativeagentcodesystem = allergyCode.code == '716186003' ? 'NON-ALLERGY' : 'SNOMED CT';
                          allergyIntolerance.causativeagentcode = allergyCode.system.indexOf("snomed") > -1 ? allergyCode.code == '716186003' ? 'No known allergies and intolerances' : allergyCode.code : '74964007';
                          allergyIntolerance.causativeagentdescription = allergyCode.text == 'No known allergy' ? 'No known allergies and intolerances' : allergyCode.text;

                          allergyIntolerance.category = allergyCode.code == '716186003' ? 'Flag' : allergyIntolerance.category;

                          const startIndex = allergyCode.text.indexOf("(");
                          const endIndex = allergyCode.text.indexOf(")");

                          if (startIndex !== -1 && endIndex !== -1) {
                            allergyIntolerance.allergentype = allergyCode.text.slice(startIndex + 1, endIndex);
                          } else {
                            allergyIntolerance.allergentype = '';
                          }

                          allergyIntolerance.allergyconcept = allergyCode.code == '716186003' ? null : '{"_term": "' + allergyCode.text + '", "_code": "' + allergyCode.code + '", "bindingValue": "' + allergyCode.code + ' | ' + allergyCode.text + '", "fsn": "' + allergyCode.text + '", "level": 0, "parentCode": null}';
                        }
                      }

                      if (alrgy.reactions != null && alrgy.reactions.length > 0) {
                        for (let j = 0; j < alrgy.reactions.length; j++) {
                          const reaction = alrgy.reactions[j];

                          for (let k = 0; k < reaction.manifestations.length; k++) {
                            const manifestation = reaction.manifestations[k];
                            const manifestationCode = manifestation.system.indexOf("snomed") > -1 ? manifestation.code : '74964007';
                            allergyIntolerance.reactionconcepts = '[{"_term": "' + manifestation.text + '", "_code": "' + manifestationCode + '", "bindingValue": "' + manifestationCode + ' | ' + manifestation.text + '", "fsn": "' + manifestation.text + '", "level": 0, "parentCode": null}]';
                            allergyIntolerance.reactiontext = JSON.stringify(allergyIntolerance.reactionconcepts);
                          }

                          if (alrgy.criticality == null && reaction.severity != null && reaction.severity.toLowerCase() == "severe") {
                            allergyIntolerance.criticality = "Life Threatening";
                          }

                          if (alrgy.criticality == null && reaction.severity != null && (reaction.severity.toLowerCase() == "mild" || reaction.severity.toLowerCase() == "moderate")) {
                            allergyIntolerance.criticality = "Unable to Assess";
                          }

                          if (alrgy.criticality != null && alrgy.criticality.toLowerCase() == "high") {
                            allergyIntolerance.criticality = "Life Threatening";
                          }

                          if (alrgy.criticality != null && alrgy.criticality.toLowerCase() == "low") {
                            allergyIntolerance.criticality = "Non-Life Threatening";
                          }

                          if (alrgy.criticality == null && reaction.severity == null) {
                            allergyIntolerance.criticality = "Unable to Assess";
                          }

                          allergyIntolerance.manifestationnotes = reaction.description;
                        }
                      }
                      else {
                        if (alrgy.criticality == null) {
                          allergyIntolerance.criticality = "Unable to Assess";
                        }
                        if (alrgy.allergyCodes[0].code == '716186003') {
                          allergyIntolerance.reactionconcepts = '{"_term":"flag","_code":"flag","bindingValue":"flag | flag","fsn":"flag","level":0,"parentCode":null}';
                        }
                      }

                      this.subscriptions.add(
                        this.apiRequest.getRequest(this.appService.baseURI + "/GetBaseViewListByAttribute/terminus_personallergylist?synapseattributename=person_id&attributevalue=" + this.appService.personId)
                          .subscribe((response) => {
                            let allergies = JSON.parse(response);

                            const exists = allergies.some((element) => {
                              return element.causativeagentcode === allergyIntolerance.causativeagentcode;
                            });

                            if ((allergyIntolerance.causativeagentcode == '716186003' && allergies != null && allergies.length == 0)) {
                              this.subscriptions.add(
                                this.apiRequest.postRequest(this.appService.baseURI + "/PostObject?synapsenamespace=core&synapseentityname=allergyintolerance", allergyIntolerance)
                                  .subscribe((response) => {
                                    this.subjects.frameworkEvent.next("UPDATE_HEIGHT_WEIGHT");
                                    this.getAllergyListForPerson();
                                  })
                              );
                            }
                            else if (!exists) {
                              this.subscriptions.add(
                                this.apiRequest.postRequest(this.appService.baseURI + "/PostObject?synapsenamespace=core&synapseentityname=allergyintolerance", allergyIntolerance)
                                  .subscribe((response) => {

                                    const nonAllergyRecordExists = allergies.some((rec) => {
                                      return rec.causativeagentcodesystem == "NON-ALLERGY" && rec.clinicalstatusvalue == "Active";
                                    });

                                    if(nonAllergyRecordExists){
                                      allergies.forEach((element) => {
                                        if (element.causativeagentcodesystem == "NON-ALLERGY" && element.clinicalstatusvalue == "Active") {
                                          delete element['poaonly'];
                                          delete element['poaname'];
                                          element.reportedbygroup = JSON.parse(element.reportedbygroup);
                                          element.reportedbygroup = JSON.stringify(element.reportedbygroup);
                                          element.clinicalstatusvalue = 'Inactive';
                                          element.enddate = this.allergyService.getDate();
  
                                          //update the entity record
                                          this.subscriptions.add(
                                            this.apiRequest.postRequest(this.appService.baseURI + "/PostObject?synapsenamespace=core&synapseentityname=allergyintolerance", element)
                                              .subscribe((response) => {
                                                this.subjects.frameworkEvent.next("UPDATE_HEIGHT_WEIGHT");
                                                this.getAllergyListForPerson();
                                              })
                                          );
                                        }
                                      });
                                    }
                                    else{
                                      this.subjects.frameworkEvent.next("UPDATE_HEIGHT_WEIGHT");
                                      this.getAllergyListForPerson();
                                    }
                                  })
                              );
                            }
                          })
                      );
                    }
                  }
                }
              })
          }
        })
    );
  }

}
