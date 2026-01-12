import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'money',
    standalone: true
})
export class MoneyPipe implements PipeTransform {
    transform(value: any): string {
        const num = Number(value || 0);
        return num.toLocaleString('en-IN', {
            minimumFractionDigits: 2, maximumFractionDigits: 2
        });
    }
}
