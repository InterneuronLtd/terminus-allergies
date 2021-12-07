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
import { BrowserModule } from "@angular/platform-browser";
import {
  DoBootstrap,
  Injector,
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
} from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppComponent } from "./app.component";

import { createCustomElement } from "@angular/elements";
import { ViewerComponent } from "./viewer/viewer.component";

import { ModalModule, BsModalRef, BsModalService } from "ngx-bootstrap/modal";

import { HttpClientModule } from "@angular/common/http";
import { FakeDataContractComponent } from "./fake-data-contract/fake-data-contract.component";

import { DataTablesModule } from "angular-datatables";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgxSpinnerModule } from "ngx-spinner";
import { AngularFontAwesomeModule } from "angular-font-awesome";
import { ToastrModule } from "ngx-toastr";
import { environment } from "src/environments/environment";
import { FormioAppConfig, FormioModule } from "angular-formio";
import { IdentifierTransformPipe } from "./pipes/identifier-transform";
import { LinebreaksPipe } from "./pipes/line-breaks";
import { AppConfig } from "./formio.config";
import { AllergiesComponent } from "./allergies/allergies.component";
import { ModuleLoaderDirective } from "./directives/module-loader.directive";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import {
  BsDatepickerConfig,
  BsDatepickerModule,
} from "ngx-bootstrap/datepicker";
import { PopoverModule } from "ngx-bootstrap/popover";
import { enableProdMode } from "@angular/core";
import { ConfirmationDialogComponent } from "./confirmation-dialog/confirmation-dialog.component";
import { ConfirmationDialogService } from "./confirmation-dialog/confirmation-dialog.service";
import { AutoCompleteModule } from "primeng/autocomplete";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { AllergyLookupDescriptionsComponent } from "./allergy-lookup-descriptions/allergy-lookup-descriptions.component";
import { AllergyLookupDescriptionsService } from "./allergy-lookup-descriptions/allergy-lookup-descriptions.service";
import { AllergyHistoryViewerComponent } from "./allergy-history-viewer/allergy-history-viewer.component";
import { AllergyHistoryViewerService } from "./allergy-history-viewer/allergy-history-viewer.service";
import { AddAllergyComponent } from './add-allergy/add-allergy.component';
import { ListAllergyComponent } from './list-allergy/list-allergy.component';
import { EditAllergyComponent } from './edit-allergy/edit-allergy.component';
//import { AutoCompleteValidationDirective } from "./utilities/auto-complete-validation";

@NgModule({
  declarations: [
    AppComponent,
    ViewerComponent,
    FakeDataContractComponent,
    IdentifierTransformPipe,
    AllergiesComponent,
    ModuleLoaderDirective,
    LinebreaksPipe,
    ConfirmationDialogComponent,
    AllergyLookupDescriptionsComponent,
    AllergyHistoryViewerComponent,
    AddAllergyComponent,
    ListAllergyComponent,
    EditAllergyComponent,
  ],
  imports: [
    FormioModule,
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: "toast-bottom-right",
      preventDuplicates: true,
    }),
    AngularFontAwesomeModule,
    BrowserAnimationsModule,
    NgxSpinnerModule,
    DataTablesModule,
    BrowserModule,
    ModalModule.forRoot(),
    HttpClientModule,
    FormsModule,
    NgbModule,
    BsDatepickerModule.forRoot(),
    PopoverModule.forRoot(),
    AutoCompleteModule,
    NgMultiSelectDropDownModule.forRoot(),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    BsModalRef,
    BsModalService,
    { provide: FormioAppConfig, useValue: AppConfig },
    BsDatepickerConfig,
    ConfirmationDialogService,
    AllergyLookupDescriptionsService,
    AllergyHistoryViewerService
  ],
  // bootstrap: [AppComponent],  //Comment out when running build command for packaging
  bootstrap: [], //Keep for prod build

  entryComponents: [
    AppComponent,
    ConfirmationDialogComponent,
    AllergyLookupDescriptionsComponent,
    AllergyHistoryViewerComponent
  ],
})
export class AppModule implements DoBootstrap {
  constructor(private injector: Injector) { }

  ngDoBootstrap() {
    const el = createCustomElement(AppComponent, { injector: this.injector });
    customElements.define("app-terminus-allergies", el); //Must Be unique - Gets passed to Sudio
  }
}
