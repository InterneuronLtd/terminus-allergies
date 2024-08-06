import { stringify } from '@angular/compiler/src/util';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'linebreaks'})
export class LinebreaksPipe implements PipeTransform {
  transform(value: string): string {
    if(!value) {
      return '';
    }
    else {
      return value.replace(/\\n/g, '<br />');
    }
  }
}
