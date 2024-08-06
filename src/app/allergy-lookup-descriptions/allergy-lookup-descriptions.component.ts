import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { AllergyCategory } from '../models/entities/allergy-category';
import { AllergyClinicalStatus } from '../models/entities/allergy-clinical-status';
import { AllergyCriticality } from '../models/entities/allergy-criticality';
import { AllergyReportedByGroup } from '../models/entities/allergy-reported-by-group';
import { AllergyVerificationStatus } from '../models/entities/allergy-verification-status';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';

@Component({
  selector: 'app-allergy-lookup-descriptions',
  templateUrl: './allergy-lookup-descriptions.component.html',
  styleUrls: ['./allergy-lookup-descriptions.component.css']
})
export class AllergyLookupDescriptionsComponent implements OnInit {

  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;

  subscriptions: Subscription = new Subscription();

  categoryList: AllergyCategory[];
  clinicalStatusList: AllergyClinicalStatus[];
  criticalityList: AllergyCriticality[];
  verificationStatusList: AllergyVerificationStatus[];
  reportedByGroupList: AllergyReportedByGroup[];

  constructor(private activeModal: NgbActiveModal, private apiRequest: ApirequestService, public appService: AppService, private subjects: SubjectsService, private spinner: NgxSpinnerService, ) { }

  getCategoryListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergycategory&orderby=displayorder ASC";
  getClinicalStatusListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergyclinicalstatus&orderby=displayorder ASC";
  getCriticalityListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergycriticality&orderby=displayorder ASC";
  getVerificationStatusListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergyverificationstatus&orderby=displayorder ASC";
  getReportedByGroupListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergyreportedbygroup&orderby=displayorder ASC";

  ngOnInit() {
    console.log('title:' + this.title);
    console.log('message:' + this.message);
    this.initialiseData();
  }

  async initialiseData() {

    await this.getCategoryList();
    await this.getClinicalStatusList();
    await this.getCriticalityList();
    await this.getVerificationStatusList();
    await this.getReportedByList();
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

}
