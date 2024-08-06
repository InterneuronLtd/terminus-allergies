import { stringify } from '@angular/compiler/src/util';
import { Pipe, PipeTransform } from '@angular/core';
/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 | exponentialStrength:10 }}
 *   formats to: 1024
*/
@Pipe({name: 'identifierTransform'})
export class IdentifierTransformPipe implements PipeTransform {
  transform(value: string): string {

    var result = value.replace("_id","");
    return result[0].toUpperCase() + result.slice(1).toLowerCase();
  }

  

}