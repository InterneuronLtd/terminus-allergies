import { EntityBase } from "./entity-base.model";

export interface AllergyVerificationStatus{
  allergyverificationstatus_id: string;
	verificationstatus: string;
	description: string;
	displayorder: Number;
  poaonly: boolean;
  poaname: string;
}
