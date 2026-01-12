import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Api } from '../../services/api';
import { Common } from '../../services/common';
import { MatDialogModule, MatDialogRef, } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormError } from '../formError/form-error';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-create-invoice',
  imports: [CommonModule, ReactiveFormsModule, FormError, MatDialogModule],
  templateUrl: './create-invoice.html',
  styleUrl: './create-invoice.scss'
})
export class CreateInvoice {
  invoiceForm: FormGroup;
  destroy$ = new Subject<void>();

  constructor(private api: Api, private common: Common, private fb: FormBuilder, private dialogRef: MatDialogRef<CreateInvoice>) {
    this.invoiceForm = this.fb.group({
      customerName: ['', [Validators.required]],
      due_date: ['', Validators.required],
      items: this.fb.array([this.createItem()]),
      commonDiscount: [0, [Validators.min(0)]],
      gstType: ['CGST_SGST'],
      gstRate: [18],
      advancePaid: [0],
      extraCharge: this.fb.group({
        label: [''],
        amount: [0]
      }),
      status: 'Pending'
    });
  }

  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  createItem(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      qty: [1, Validators.required],
      price: [0, Validators.required],
      discount: [0, [Validators.min(0)]]
    });
  }

  addItem() {
    this.items.push(this.createItem());
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  itemTotal(item: any): number {
    const qty = item.get('qty')?.value || 0;
    const price = item.get('price')?.value || 0;
    const productDiscount = item.get('discount')?.value || 0;
    const commonDiscount = this.invoiceForm.get('commonDiscount')?.value || 0;
    let total = qty * price;
    if (productDiscount > 0) { total -= (total * productDiscount) / 100; }
    if (commonDiscount > 0) { total -= (total * commonDiscount) / 100; }
    return total;
  }

  calculateInvoice() {
    const items = this.items.controls;
    let totalItemDiscount = 0;
    let totalBeforeDiscount = 0;

    items.forEach(item => {
      const price = item.get('price')?.value || 0;
      const qty = item.get('qty')?.value || 0;
      const discount = item.get('discount')?.value || 0;
      const itemTotal = price * qty;
      totalBeforeDiscount += itemTotal;
      totalItemDiscount += (price * qty * (discount / 100));
    });
    const commonDiscount = this.invoiceForm.get('commonDiscount')?.value || 0;
    const subTotalBeforeCommonDiscount = totalBeforeDiscount - totalItemDiscount;
    const commonDiscountAmount = subTotalBeforeCommonDiscount * (commonDiscount / 100);
    const subTotal = subTotalBeforeCommonDiscount - commonDiscountAmount;
    const totalDiscount = totalItemDiscount + commonDiscountAmount;
    const extraCharge = this.invoiceForm.get('extraCharge.amount')?.value || 0;
    const taxableAmount = subTotal + extraCharge;
    const gstRate = this.invoiceForm.get('gstRate')?.value || 0;
    const gstAmount = (taxableAmount * gstRate) / 100;
    const grandTotal = taxableAmount + gstAmount;
    const advancePaid = this.invoiceForm.get('advancePaid')?.value || 0;
    const balanceDue = grandTotal - advancePaid;
    return {
      totalBeforeDiscount, subTotal, totalDiscount, extraCharge, taxableAmount, gstAmount, grandTotal, advancePaid, balanceDue: Math.max(balanceDue, 0)
    };
  }

  resetInvoice() {
    this.items.clear();
    this.items.push(this.createItem());
    this.invoiceForm.reset({
      gstType: 'CGST_SGST', gstRate: 18, commonDiscount: 0, advancePaid: 0, status: 'Pending', extraCharge: { label: '', amount: 0 }
    });
  }

  saveInvoice() {
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      return;
    }
    const formValue = this.invoiceForm.value;

    const payload =
    {
      customer: { name: formValue.customerName, due_date: formValue.due_date, status: formValue.status },
      items: formValue.items.map((item: any) => ({
        product: item.name,
        qty: this.common.round2(item.qty),
        price: this.common.round2(item.price),
        discount: this.common.round2(item.discount) || 0,
      })),
      commonDiscount: this.common.round2(formValue.commonDiscount) || 0,
      gstType: formValue.gstType || "CGST_SGST",
      gstRate: this.common.round2(formValue.gstRate) || 18,
      advancePaid: this.common.round2(formValue.advancePaid) || 0,
      extraCharge: formValue.extraCharge?.amount > 0 ? {
        label: formValue.extraCharge.label, amount: this.common.round2(formValue.extraCharge.amount)
      } : {}
    }
    this.api.createInvoice(payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.common.snackBar(res['message'], res['success']);
        this.dialogRef.close({ isSuccess: true });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
