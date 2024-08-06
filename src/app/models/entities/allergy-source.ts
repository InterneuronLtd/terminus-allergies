import { EntityBase } from "./entity-base.model";

export interface AllergySources{
  allergysources_id: string;
	source: string;
	description: string;
	displayname: string;
	isDisabled?: boolean;
}