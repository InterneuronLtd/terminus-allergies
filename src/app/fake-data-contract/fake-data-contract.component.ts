import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  isDevMode,
  OnDestroy,
} from "@angular/core";
import {
  FormControl,
  SelectMultipleControlValueAccessor,
} from "@angular/forms";
import { AppService } from "../services/app.service";
import { SubjectsService } from "../services/subjects.service";
import { ApirequestService } from "../services/apirequest.service";
import { BsModalService } from "ngx-bootstrap/modal";
import { Subject, Subscription } from "rxjs";
import { action, DataContract } from "../models/filter.model";
import { KeyValuePair } from "../models/keyvaluepair";
import { environment } from "src/environments/environment";
import { Person } from "../models/entities/core-person.model";
import { HttpClient } from "@angular/common/http";
import { NgxSpinnerService } from "ngx-spinner";
import { ConfigService } from "../services/config.service";

@Component({
  selector: "app-fake-data-contract",
  templateUrl: "./fake-data-contract.component.html",
  styleUrls: ["./fake-data-contract.component.css"],
})
export class FakeDataContractComponent implements OnInit, OnDestroy {
  appContexts: string;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  showManualContext: boolean = false;

  personId: string;
  encounterId: string;
  persons: Person[];

  subscriptions: Subscription = new Subscription();

  constructor(
    private subjects: SubjectsService,
    public appService: AppService,
    private apiRequest: ApirequestService,
    private modalService: BsModalService,
    private httpClient: HttpClient,
    private spinner: NgxSpinnerService,
    private configService: ConfigService
  ) {}

  async ngOnInit() {
    //Only init if not Prod
    if (isDevMode) {
      let value: any = {};
      value.authService = {};
      value.authService.user = {};
      let auth = this.apiRequest.authService;

      await auth.getToken().then((token) => {
        value.authService.user.access_token = token;

        let decodedToken: any;
        decodedToken = this.appService.decodeAccessToken(token);

        this.subscriptions.add(
          this.apiRequest
            .getRequest(
              "./assets/config/terminus-allergies-config.json?V" + Math.random()
            )
            .subscribe(async (response) => {
              this.appService.appConfig = response;
              this.appService.baseURI = this.appService.appConfig.uris.baseuri;
              //console.log(this.appService.appConfig.uris.baseuri);
              this.appService.enableLogging =
                this.appService.appConfig.enablelogging;

              this.dtOptions = {
                pagingType: "simple",
                pageLength: 25,
                dom: "-f -t -p",
              };

              this.personId = this.appService.personId;
              this.encounterId = this.appService.encounterId;

              this.spinner.show("spinner2");

              this.subscriptions.add(
                this.apiRequest
                  .getRequest(
                    this.appService.baseURI +
                      "/GetList?synapsenamespace=core&synapseentityname=person&orderby=fullname ASC&limit=600"
                  )
                  .subscribe((response) => {
                    var data = JSON.parse(response);
                    //console.log(data);
                    this.persons = data;
                    this.dtTrigger.next();
                    this.spinner.hide("spinner2");
                  })
              );
            })
        );
      });
    }
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
    this.subscriptions.unsubscribe();
  }

  selectPerson(personId: string) {
    this.personId = personId;

    this.appContexts =
      '{"encounter_id": "19bed96b-d4e6-4f63-b7d6-e92ce0a8b1a7", "person_id":"' +
      this.personId +
      '"}';

    this.updateContextObject();
  }

  updateContextObject() {
    this.appService.contexts = JSON.parse(this.appContexts);

    this.appService.personId = this.personId;
    //this.appService.encounterId = this.encounterId;
    this.subjects.apiServiceReferenceChange.next();
    this.subjects.personIdChange.next();
  }

  toggleContextView() {
    this.showManualContext = !this.showManualContext;
  }
}
