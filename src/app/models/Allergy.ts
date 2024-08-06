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

