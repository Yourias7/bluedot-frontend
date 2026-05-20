// Reusable PrimeNG paginator wrapper; totalRecords is hardcoded — replace with a dynamic value
import { Component } from '@angular/core';
import { Paginator, PaginatorModule, PaginatorState } from 'primeng/paginator';

@Component({
    template: `
        <div class="card flex justify-center">
            <p-paginator (onPageChange)="onPageChange($event)" [first]="first" [rows]="rows" [totalRecords]="120" [rowsPerPageOptions]="[10, 20, 30]" />
        </div>
    `,
    standalone: true,
    imports: [PaginatorModule]
})
export class PaginatorBasicDemo {
    first: number = 0; // byte offset of the first record on the current page
    rows: number = 10; // number of records per page

    onPageChange(event: PaginatorState) {
        this.first = event.first ?? 0;
        this.rows = event.rows ?? 10;
    }
}