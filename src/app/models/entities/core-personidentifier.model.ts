import { EntityBase } from './entity-base.model';

export class PersonIdentifier extends EntityBase {
    person_id: string;
    idtypetext: string;
    idnumber: string;
    assigningauthoritytext: string;
}