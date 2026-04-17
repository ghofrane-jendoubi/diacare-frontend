import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'riskLevelClass'
})
export class RiskLevelPipe implements PipeTransform {
  transform(value: string): string {
    const classes: { [key: string]: string } = {
      'très faible': 'risk-low',
      'modéré': 'risk-medium',
      'modéré-élevé': 'risk-moderate',
      'élevé': 'risk-high'
    };
    return classes[value] || '';
  }
}