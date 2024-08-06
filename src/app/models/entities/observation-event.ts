import { EntityBase } from "./entity-base.model";

export interface  ObservationEvent extends EntityBase {
  observationevent_id: string;
	person_id: string;
	datestarted: any;
	datefinished: any;
	addedby: string;
	encounter_id: string;
	isamended: Boolean;
	observationfrequency: Number;
	observationscaletype_id: string;
	escalationofcare: Boolean;
	reasonforamend: string;
	reasonfordelete: string;
	reasonforincompleteobservations: string;
	eventcorrelationid: string;
	incomplete: Boolean;
}

