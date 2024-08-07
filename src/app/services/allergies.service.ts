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
import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { AllergyWithMeta } from '../models/baseviews/allergy-with-meta';
import { AllergyCategory } from '../models/entities/allergy-category';
import { AllergyClinicalStatus } from '../models/entities/allergy-clinical-status';
import { AllergyCriticality } from '../models/entities/allergy-criticality';
import { AllergyIntolerance } from '../models/entities/allergy-intolerance';
import { AllergyReportedByGroup } from '../models/entities/allergy-reported-by-group';
import { AllergyVerificationStatus } from '../models/entities/allergy-verification-status';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root'
})
export class AllergiesService {

  subscriptions: Subscription = new Subscription();

  allergyIntolerance: AllergyIntolerance;
  // allergyIntoleranceList: AllergyWithMeta[];
  // categoryList: AllergyCategory[];
  // clinicalStatusList: AllergyClinicalStatus[];
  // criticalityList: AllergyCriticality[];
  // verificationStatusList: AllergyVerificationStatus[];
  // reportedByGroupList: AllergyReportedByGroup[];

  // refreshingList: boolean;

  // getAllergyListForPersonURI: string;
  // getCategoryListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergycategory&orderby=displayorder ASC";
  // getReportedByGroupListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergyreportedbygroup&orderby=displayorder ASC";
  // getClinicalStatusListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergyclinicalstatus&orderby=displayorder ASC";
  // getCriticalityListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergycriticality&orderby=displayorder ASC";
  // getVerificationStatusListURI: string = this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=allergyverificationstatus&orderby=displayorder ASC";

  constructor(private apiRequest: ApirequestService,
    public appService: AppService,) { }

  getDateTime(): string {
    var date = new Date();
    let year = date.getFullYear();
    let month = (date.getMonth() + 1);
    let day = date.getDate();
    let hrs = date.getHours();
    let mins = date.getMinutes();
    let secs = date.getSeconds();
    let msecs = date.getMilliseconds();

    let returndate = (year + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day) +
      "T" + (hrs < 10 ? "0" + hrs : hrs) + ":" + (mins < 10 ? "0" + mins : mins) + ":" + (secs < 10 ? "0" + secs : secs) + "." + (msecs < 10 ? "00" + msecs : (msecs < 100 ? "0" + msecs : msecs)));

    return returndate;
  }

  public getDateTimeinISOFormat(date: Date): string {

    var time = date;
    var hours = time.getHours();
    var s = time.getSeconds();
    var m = time.getMilliseconds()
    var minutes = time.getMinutes();
    date.setHours(hours);
    date.setMinutes(minutes);
    //date.setSeconds(s);
    //date.setMilliseconds(m);
    //this.appService.logToConsole(date);
    let year = date.getFullYear();
    let month = (date.getMonth() + 1);
    let dt = date.getDate();
    let hrs = date.getHours();
    let mins = date.getMinutes();
    let secs = date.getSeconds();
    let msecs = date.getMilliseconds();
    let returndate = (year + "-" + (month < 10 ? "0" + month : month) + "-" + (dt < 10 ? "0" + dt : dt) + "T" + (hrs < 10 ? "0" + hrs : hrs) + ":" + (mins < 10 ? "0" + mins : mins) + ":" + (secs < 10 ? "0" + secs : secs) + "." + (msecs < 10 ? "00" + msecs : (msecs < 100 ? "0" + msecs : msecs)));
    //this.appService.logToConsole(returndate);
    return returndate;
  }

  getDate(): Date {
    var date = new Date();
    return date;
  }

  resetAllergy() {
    //this.inactiveErrorCheck = 'No error';
    //this.inactiveErrorMessage = '';

    this.allergyIntolerance = {} as AllergyIntolerance;
  }

  // async  getAllergyListForPerson() {
  //   this.refreshingList = true;
  //   await this.subscriptions.add(
  //    this.apiRequest.getRequest(this.getAllergyListForPersonURI)
  //    .subscribe((response) => {
  //      this.allergyIntoleranceList = JSON.parse(response);
  //      this.refreshingList = false;
  //    })
  //  )
  // }

  // async  getCategoryList() {
  //   await this.subscriptions.add(
  //    this.apiRequest.getRequest(this.getCategoryListURI)
  //    .subscribe((response) => {
  //      this.categoryList = JSON.parse(response);
  //    })
  //  )
  // }

  // async  getReportedByList() {
  //   await this.subscriptions.add(
  //    this.apiRequest.getRequest(this.getReportedByGroupListURI)
  //    .subscribe((response) => {
  //      this.reportedByGroupList = JSON.parse(response);
  //    })
  //  )
  // }


  // async  getClinicalStatusList() {
  //   await this.subscriptions.add(
  //    this.apiRequest.getRequest(this.getClinicalStatusListURI)
  //    .subscribe((response) => {
  //      this.clinicalStatusList = JSON.parse(response);
  //    })
  //  )
  // }

  // async  getCriticalityList() {
  //   await this.subscriptions.add(
  //    this.apiRequest.getRequest(this.getCriticalityListURI)
  //    .subscribe((response) => {
  //      this.criticalityList = JSON.parse(response);
  //    })
  //  )
  // }

  // async  getVerificationStatusList() {
  //   await this.subscriptions.add(
  //    this.apiRequest.getRequest(this.getVerificationStatusListURI)
  //    .subscribe((response) => {
  //      this.verificationStatusList = JSON.parse(response);
  //    })
  //  )
  // }
}
