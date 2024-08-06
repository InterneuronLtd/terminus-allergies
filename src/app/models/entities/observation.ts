import { EntityBase } from "./entity-base.model";

export interface  Observation extends EntityBase {
  observation_id: string;
	units: string;
	symbol: string;
	timerecorded: any;
  observationevent_id: string;
	observationtype_id: string;
	observationtypemeasurement_id: string;
	value: string;
	hasbeenammended: Boolean;
	eventcorrelationid: string;
	route: string;
	note: string;
	device: string;
}
