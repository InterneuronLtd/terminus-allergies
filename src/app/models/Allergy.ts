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
export class CodeableConcept
{
    code: string; 
    text: string;
    system: string;
}

export class Reaction
{
    severity: string;
    description: string;
    exposureRoute: CodeableConcept[];
    manifestations: CodeableConcept[];
}

export class Allergy
{
    startDate: Date;
    endDate?: Date;
    clinicalStatus: string;
    reactions: Reaction[];
    allergyText: string;
    categories: string[];
    verificationStatus: string;
    lastOccurrence?: Date;
    criticality: string;
    allergyType: string;
    allergyCodes: CodeableConcept[];
}

