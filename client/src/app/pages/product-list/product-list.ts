import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MoneyPipe } from '../../pipe/money.pipe';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, MatDialogModule, MoneyPipe],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductList implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  totalPrice: any = {};

  ngOnInit(): void {
    this.prepareInvoice(this.data);
  }

  prepareInvoice(invoice: any) {
    let totalItemDiscount = 0;
    let totalBeforeDiscount = 0;

    invoice.items = invoice.items.map((item: any) => {
      const itemTotal = item.price * item.qty;
      const discountAmount = (itemTotal * item.discount) / 100;
      let total = itemTotal;
      if (item.discount > 0) { total = (itemTotal - discountAmount) }
      if (invoice.commonDiscount > 0) { total -= (total * invoice.commonDiscount) / 100; }
      totalBeforeDiscount += itemTotal;
      totalItemDiscount += discountAmount;
      return {
        ...item, total
      };
    });

    const commonDiscount = invoice.commonDiscount || 0;
    const subTotalBeforeCommonDiscount = totalBeforeDiscount - totalItemDiscount;
    const commonDiscountAmount = subTotalBeforeCommonDiscount * (commonDiscount / 100);
    const subTotal = subTotalBeforeCommonDiscount - commonDiscountAmount;
    const totalDiscount = totalItemDiscount + commonDiscountAmount;
    const extraCharge = (invoice.extraCharge?.amount || 0);
    const extraChargeLabel = (invoice.extraCharge?.label || 0);
    const taxableAmount = subTotal + (extraCharge || 0);
    const gstRate = invoice.gstRate
    const gstAmount = (taxableAmount * gstRate) / 100;
    const grandTotal = taxableAmount + gstAmount;
    const advancePaid = invoice.advancePaid;
    const balanceDue = grandTotal - invoice.advancePaid;

    this.totalPrice = {
      totalBeforeDiscount, subTotal, commonDiscount, totalDiscount, extraChargeLabel, extraCharge, taxableAmount, gstRate, gstAmount, grandTotal, advancePaid, balanceDue: Math.max(balanceDue, 0),
    };
  }
}
