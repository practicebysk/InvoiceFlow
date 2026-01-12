import { Component, Input } from "@angular/core";
import { AbstractControl } from "@angular/forms";

@Component({
  selector: 'app-form-error',
  templateUrl: './form-error.html',
  styleUrl: './form-error.scss',
})

export class FormError {
  @Input() control!: AbstractControl | null;
}