import { HttpClient } from '@angular/common/http';
// import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
// import { escapeRegExp } from '@angular/compiler/src/util';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormioForm, FormioOptions } from 'angular-formio';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { AllergyLookupDescriptionsService } from '../allergy-lookup-descriptions/allergy-lookup-descriptions.service';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { LinkedEncounter } from '../models/baseviews/linked-encounter';
import { AllergyCategory } from '../models/entities/allergy-category';
import { AllergyClinicalStatus } from '../models/entities/allergy-clinical-status';
import { AllergyCriticality } from '../models/entities/allergy-criticality';
import { AllergyIntolerance } from '../models/entities/allergy-intolerance';
import { AllergyReportedByGroup } from '../models/entities/allergy-reported-by-group';
import { AllergySources } from '../models/entities/allergy-source';
import { AllergyVerificationStatus } from '../models/entities/allergy-verification-status';
import { SNOMED } from '../models/snomed-model';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { ConfigService } from '../services/config.service';
import { SubjectsService } from '../services/subjects.service';
import { ToasterService } from '../services/toaster-service.service';

@Component({
  selector: 'app-allergy-history-viewer',
  templateUrl: './allergy-history-viewer.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./allergy-history-viewer.component.css'],
})
export class AllergyHistoryViewerComponent implements OnInit {



  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() allergyId: string;


  historyView: string;

  getAllergyHistoryListURI: string;
  allergyHistoryList: AllergyIntolerance[];

  allergyIntolerance: AllergyIntolerance;

  allergyIntoleranceList: AllergyIntolerance[];
  categoryList: AllergyCategory[];
  clinicalStatusList: AllergyClinicalStatus[];
  criticalityList: AllergyCriticality[];
  verificationStatusList: AllergyVerificationStatus[];
  reportedByGroupList: AllergyReportedByGroup[];
  allergenName: string;
  sourceList: AllergySources[];

  getCategoryListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergycategory&orderby=displayorder ASC";
  getClinicalStatusListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergyclinicalstatus&orderby=displayorder ASC";
  getCriticalityListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergycriticality&orderby=displayorder ASC";
  getVerificationStatusListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergyverificationstatus&orderby=displayorder ASC";
  getReportedByGroupListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergyreportedbygroup&orderby=displayorder ASC";
  getSourceListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergysources&orderby=displayname ASC";

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


  public formioOptions: FormioOptions = {
    'disableAlerts': true
  };

  //public options: FormioOptions;
  options: Object = {
    submitMessage: "",
    disableAlerts: true,
    noAlerts: true,
    readOnly: true
  }

  submission: any;

    //API Variables
    globalURL: string = this.appService.baseURI;
    careRecordURL: string = this.appService.carerecordURI;
    terminologyURL: string = this.appService.terminologyURI;
    autonomicURL: string = this.appService.autonomicURI;
    imageServerURL: string = this.appService.imageserverURI;
    bearerAuthToken: string;

  subscriptions: Subscription = new Subscription();

  constructor(private activeModal: NgbActiveModal, private subjects: SubjectsService, public appService: AppService, private apiRequest: ApirequestService, private modalService: BsModalService, private httpClient: HttpClient , private spinner: NgxSpinnerService, private configService: ConfigService, private toasterService: ToasterService, private confirmationDialogService: ConfirmationDialogService, private allergyLookupDescriptionsService: AllergyLookupDescriptionsService) { }

  bsConfig: any;

  ngOnInit() {

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'allergysources_id',
      textField: 'source',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 10,
      allowSearchFilter: true
    };

    this.bsConfig = {  dateInputFormat: 'DD/MM/YYYY', containerClass: 'theme-default', adaptivePosition: true };
    this.historyView = 'list';
    this.bearerAuthToken = 'bearer '+ this.appService.apiService.authService.user.access_token;
    this.getAllergyHistoryListURI = this.appService.baseURI + '/GetObjectHistory?synapsenamespace=core&synapseentityname=allergyintolerance&id=' + this.allergyId;
    this.GetAllergyHistory();

    this.getCategoryList();
    this.getClinicalStatusList();
    this.getCriticalityList();
    this.getVerificationStatusList();
    this.getReportedByList();
    this.getSourceList();
  }

  async GetAllergyHistory() {
    this.spinner.show("form-history-spinner");
      await this.subscriptions.add(
       this.apiRequest.getRequest(this.getAllergyHistoryListURI)
       .subscribe((response) => {
        var resp = JSON.parse(response);
         this.allergyHistoryList = resp.reverse();
         this.allergenName = this.allergyHistoryList[0].causativeagentdescription.replace('(Non-coded)','').trim();
         if(this.allergyHistoryList[0].causativeagentcode == '74964007'){
          this.allergenName = this.allergenName + ' - (Not a codified value)';
         }
         this.spinner.hide("form-history-spinner");
       })
     )
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
       this.getReportedByList = JSON.parse(response);
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

  async  getSourceList() {
    await this.subscriptions.add(
     this.apiRequest.getRequest(this.getSourceListURI)
     .subscribe((response) => {
       this.sourceList = JSON.parse(response);
     })
   )
  }


  public decline() {
    this.activeModal.close(false);
  }

  public accept() {
    this.activeModal.close(true);
  }

  public dismiss() {
    this.activeModal.dismiss();
  }

   viewHistoryForm(obj: any) {

    this.allergyIntolerance = obj;

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

  if(this.allergyIntolerance.reportedbygroup != '' && !Array.isArray(this.allergyIntolerance.reportedbygroup)) {
    this.allergyIntolerance.reportedbygroup = JSON.parse(this.allergyIntolerance.reportedbygroup);
  } 
  else if(this.allergyIntolerance.reportedbygroup != '' && Array.isArray(this.allergyIntolerance.reportedbygroup)) {
    let arr = [];
    this.allergyIntolerance.reportedbygroup.forEach(element => {
      arr.push(element);
    });

    this.allergyIntolerance.reportedbygroup = JSON.parse(JSON.stringify(arr));
  }
  else if (this.allergyIntolerance.reportedbygroup == ''){
    this.allergyIntolerance.reportedbygroup = JSON.parse('[]');
  }

  if(Array.isArray(this.allergyIntolerance.reportedbygroup)){
    this.allergyIntolerance.reportedbygroup = JSON.parse(JSON.stringify(this.allergyIntolerance.reportedbygroup));
  }

  //Cast concept strings to concepts
  if(this.allergyIntolerance.category == "Flag") {
    this.allergyIntolerance.reactionconcepts = '[{"_term":"flag","_code":"flag","bindingValue":"flag | flag","fsn":"flag","level":0,"parentCode":null}]';
  }

  if(this.allergyIntolerance.category == "Flag") {
    this.allergyIntolerance.allergyconcept = '{"_term":"flag","_code":"flag","bindingValue":"flag | flag","fsn":"flag","level":0,"parentCode":null}';
  }

  //this.allergyIntolerance.asserteddatetime =  new Date(this.allergyIntolerance.asserteddatetime).toISOString(); 
  //this.allergyIntolerance.recordeddatetime =  new Date(this.allergyIntolerance.recordeddatetime).toISOString(); 

  if(typeof this.allergyIntolerance.allergyconcept != 'string')
  {
    this.allergyIntolerance.allergyconcept = JSON.parse(JSON.stringify(this.allergyIntolerance.allergyconcept)) as SNOMED;
  }
  else
  {
    this.allergyIntolerance.allergyconcept = JSON.parse(this.allergyIntolerance.allergyconcept) as SNOMED;
  }
  
  if(this.allergyIntolerance.reactionconcepts != '' && !Array.isArray(this.allergyIntolerance.reactionconcepts)){
    this.allergyIntolerance.reactionconcepts = this.replaceAll(this.allergyIntolerance.reactionconcepts, '_term', 'term');
    this.allergyIntolerance.reactionconcepts = this.replaceAll(this.allergyIntolerance.reactionconcepts, '_code', 'code');
  }
  
  //this.allergyIntolerance.reactionconcepts = JSON.parse(this.allergyIntolerance.reactionconcepts) as SNOMED[];

  if(this.allergyIntolerance.reactionconcepts != '' && !Array.isArray(this.allergyIntolerance.reactionconcepts)) {
    this.allergyIntolerance.reactionconcepts = JSON.parse(this.allergyIntolerance.reactionconcepts) as SNOMED[];
  } 
  else if(this.allergyIntolerance.reactionconcepts != '' && Array.isArray(this.allergyIntolerance.reactionconcepts)) {
    let arr = [];
    this.allergyIntolerance.reactionconcepts.forEach(element => {
      arr.push(element);
    });

    this.allergyIntolerance.reactionconcepts = JSON.parse(JSON.stringify(arr));
  }
  else if (this.allergyIntolerance.reactionconcepts == ''){
    this.allergyIntolerance.reactionconcepts = JSON.parse('[]');
  }

    this.historyView = 'form';
  }

  dataObjectString: any;
  initialdataObjectString: string;
  dataObject: any;



  onRender() {
    //console.log('onRender');
  }

  onChange(value: any) {
    //console.log('onChange');
    //console.log(value);
  }

  backToList() {
    //this.historyForm = null;
    this.submission = null;
    this.historyView = 'list';
  }

  replaceAll(str, find, replace) {
    if(!str) {
      return null;
    }
    return str.replace(new RegExp(this.escapeRegex(find), 'g'), replace);
  }


  async viewDescription(option: string) {
    var response = false;
    console.log(option);
    await this.allergyLookupDescriptionsService.confirm(option, 'Allergy Descriptions')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
  }

  escapeRegex(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }


}
