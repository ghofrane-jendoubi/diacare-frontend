import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'activeCount'
})
export class ActiveCountPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
