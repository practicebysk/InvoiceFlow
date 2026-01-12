import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { Api } from '../../services/api';
import { FormsModule, } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ProductList } from '../product-list/product-list';
import { CreateInvoice } from '../create-invoice/create-invoice';

@Component({
  selector: 'app-invoice',
  imports: [FormsModule, CommonModule],
  templateUrl: './invoice.html',
  styleUrl: './invoice.scss'
})
export class Invoice implements OnInit, OnDestroy {

  invoices = signal<any>([]);
  page = signal(1);
  totalPages = signal(0);
  status = signal('');
  name = signal('');
  sortBy = signal('');
  sortOrder = signal('');

  search$ = new Subject<void>();
  destroy$ = new Subject<void>();
  size = 10;

  readonly columns = ['invoiceNo', 'customer.name', 'total', 'customer.name', 'customer.due_date'];

  constructor(private api: Api, private dialog: MatDialog) { }

  ngOnInit() {
    this.loadInvoices();
    this.search$.next();
  }

  loadInvoices() {
    this.search$.pipe(debounceTime(300)).pipe(takeUntil(this.destroy$)).subscribe(() => {
      const param = {
        page: this.page(),
        size: this.size,
        name: this.name(),
        status: this.status(),
        sortBy: this.sortBy(),
        sortOrder: this.sortOrder()
      }
      this.api.getInvoices(param).subscribe({
        next: (res: any) => {
          this.invoices.set(res.data.rows);
          this.totalPages.set(res.data.pagination.total_pages);
        }
      })
    });
  }

  pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  changePage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.search$.next();
  }

  onSearchCustomer(event: Event) {
    this.name.set((event.target as HTMLInputElement).value);
    this.search$.next();
  }

  onStatusChange(event: Event) {
    this.status.set((event.target as HTMLSelectElement).value);
    this.search$.next();
  }

  changeSort(field: string) {
    if (this.sortBy() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('asc');
    }
    this.search$.next();
  }

  readonly sortIcons = computed(() => {
    const icons: Record<string, string> = {};
    for (const col of this.columns) {
      icons[col] = 'bi bi-arrow-down-up';
    }
    const active = this.sortBy();
    icons[active] = this.sortOrder() === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down';
    return icons;
  });

  viewProductList(invoice: any) {
    this.dialog.open(ProductList, {
      maxWidth: '80vw',
      width: '100vw',
      disableClose: false,
      data: invoice
    });
  }

  openCreateInvoice() {
    this.dialog.open(CreateInvoice, {
      maxWidth: '80vw',
      width: '100vw',
      disableClose: false,
    }).afterClosed().subscribe((result) => {
      if (result && result['isSuccess'] === true) {
        this.search$.next();
      }
    });
  }

  downloadPdf(id: string) {
    this.api.downloadInvoicePdf(id).subscribe((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  // shareWhatsapp(id: string) {
  //   this.api.shareInvoicePdf(id).subscribe((blob: Blob) => {
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = 'invoice.pdf';
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //     const phone = "911234567890"; 
  //     const message = encodeURIComponent("Here is your invoice, please check the attached PDF.");
  //     window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  //   });
  // }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
