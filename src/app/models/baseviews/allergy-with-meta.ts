import { SNOMED } from "../snomed-model";
import { EntityBase } from "../entities/entity-base.model";

export interface AllergyWithMeta{
  allergyintolerance_id: string;
	person_id: string;
	encounter_id: string;
	causativeagentcodesystem: string;
	causativeagentcode: string;
	causativeagentdescription: string;
	clinicalstatusvalue: string;
	clinicalstatusby: string;
	cliinicialstatusdatetime: any;
	category: string;
	criticality: string;
	onsetdate: Date;
	enddate: Date;
	lastoccurencedate: Date;
	reportedbygroup: string;
	reportedbyname: string;
	reportedbydatetime: any;
	verificationstatus: string;
	assertedby: string;
	asserteddatetime: any;
	allergynotes: string;
	manifestationnotes: string;
  recordeddatetime: any;
  recordedby: string;
  displaywarning: string;
  allergyconcept: any;
  reactionconcepts: any;
  poaonly: boolean;
  poaname: string;
  clinicalstatusdt: any;
  reportedbydt: any;
  asserteddt: any;
  recordeddt: any;
  lastupdatedrecorddt: any;
}
