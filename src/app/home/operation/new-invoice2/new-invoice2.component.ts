import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BlService } from 'src/app/services/bl.service';
import { Bl } from 'src/app/models/bl';
import { CommonService } from 'src/app/services/common.service';
import { Router } from '@angular/router';
import pdfFonts from 'pdfmake/build/vfs_fonts';

const pdfMake = require('pdfmake/build/pdfmake.js');
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-new-invoice2',
  templateUrl: './new-invoice2.component.html',
  styleUrls: ['./new-invoice2.component.scss'],
})
export class NewInvoice2Component implements OnInit {
  invoiceList: any[] = [];
  invoiceDetails: any;
  invoice: Bl = new Bl();
  isLoading: boolean = false;
  isLoading1: boolean = false;
  invoiceForm1: FormGroup;
  invoiceForm: FormGroup;
  submitted: boolean = false;

  constructor(
    private _formBuilder: FormBuilder,
    private _blService: BlService,
    private _commonService: CommonService,
    private router: Router
  ) {}

  @ViewChild('closeBtn') closeBtn: ElementRef;

  ngOnInit(): void {
    this.invoiceForm = this._formBuilder.group({
      radio: ['', Validators.required],
      BL_NO: ['', Validators.required],
    });

    this.invoiceForm1 = this._formBuilder.group({
      FROM_DATE: [''],
      TO_DATE: [''],
    });

    this.getInvoiceList();
  }

  getInvoiceList() {
    this._commonService.destroyDT();
    this.invoiceList = [];
    this.invoice.ORG_CODE = this._commonService.getUserOrgCode();
    this.invoice.PORT = this._commonService.getUserPort();
    this._blService.getInvoiceListNew(this.invoice).subscribe((res: any) => {
      this.isLoading = false;
      this.isLoading1 = false;
      if (res.ResponseCode == 200) {
        this.invoiceList = res.Data;
      }

      this._commonService.getDT();
    });
  }

  Submit() {
    this.submitted = true;
    if (this.invoiceForm.invalid) {
      return;
    }
    this.closeBtn.nativeElement.click();
    localStorage.setItem('value', this.invoiceForm.get('radio').value);
    this.router.navigateByUrl(
      '/home/operations/invoice-list/' + this.invoiceForm.get('BL_NO').value
    );
  }

  getInvoiceDetails(invoiceNo: string) {
    this._blService
      .getInvoiceDetailsNew(
        invoiceNo,
        this._commonService.getUserPort(),
        this._commonService.getUserOrgCode()
      )
      .subscribe((res: any) => {
        if (res.ResponseCode == 200) {
          this.invoiceDetails = res.Data;
          this.generatePDF();
        }
      });
  }

  async generatePDF() {
    let docDefinition = {
      content: [
        {
          layout: {
            hLineWidth: function (i: any, node: any) {
              if (
                i === 0 ||
                i === node.table.body.length ||
                i === 2 ||
                i === 3 ||
                i === 7 ||
                i === 14
              ) {
                return 1;
              }
              return 0;
            },
            vLineWidth: function (i: any) {
              return i === 1;
            },
            hLineColor: function (i: any) {
              return 'black';
            },
            paddingTop: function (i: any) {
              return 2;
            },
            paddingBottom: function (i: any, node: any) {
              return 2;
            },
            paddingLeft: function (i: any) {
              return 7;
            },
            paddingRight: function (i: any, node: any) {
              return 7;
            },
          },
          table: {
            headerRows: 1,
            widths: [250, 250],
            body: [
              [
                {
                  text: this.invoiceDetails?.ORG_NAME,
                  bold: true,
                  fontSize: 14,
                  alignment: 'center',
                  colSpan: 2,
                },
                {},
              ],
              [
                {
                  text: this.invoiceDetails?.ORG_ADDRESS1,
                  bold: false,
                  fontSize: 10,
                  alignment: 'center',
                  colSpan: 2,
                  margin: [0, 0, 0, 70],
                },
                {},
              ],
              [
                {
                  text: 'TAX INVOICE',
                  bold: true,
                  fontSize: 12,
                  alignment: 'center',
                  colSpan: 2,
                },
                {},
              ],
              [
                {
                  text: this.invoiceDetails?.SHIPPER_NAME.toUpperCase(),
                  bold: true,
                  fontSize: 8,
                },
                {
                  columns: [
                    {
                      text: 'Invoice No',
                      bold: true,
                      fontSize: 8,
                      width: 80,
                    },
                    {
                      text: ':',
                      bold: true,
                      fontSize: 8,
                      width: 10,
                    },
                    {
                      text: this.invoiceDetails?.INVOICE_NO.toUpperCase(),
                      bold: true,
                      fontSize: 8,
                      width: 200,
                    },
                  ],
                },
              ],
              [
                {
                  text: this.invoiceDetails?.ADDRESS.toUpperCase(),
                  bold: false,
                  fontSize: 7,
                },
                {
                  columns: [
                    {
                      text: 'Invoice Date',
                      bold: true,
                      fontSize: 8,
                      width: 80,
                    },
                    {
                      text: ':',
                      bold: true,
                      fontSize: 8,
                      width: 10,
                    },
                    {
                      text: this._commonService.getIndianDate(
                        new Date(this.invoiceDetails?.INVOICE_DATE)
                      ),
                      bold: true,
                      fontSize: 8,
                      width: 200,
                    },
                  ],
                },
              ],
              [
                {
                  text: 'GSTN NO : ' + this.invoiceDetails?.TAX_NO,
                  bold: true,
                  fontSize: 7,
                },
                {},
              ],
              [
                {
                  text: 'PAN NO : ' + this.invoiceDetails?.PAN,
                  bold: true,
                  fontSize: 7,
                },
                {},
              ],
              [
                {
                  columns: [
                    {
                      text: 'Booking Party',
                      bold: true,
                      fontSize: 9,
                      width: 80,
                    },
                    {
                      text: ':',
                      bold: true,
                      fontSize: 9,
                      width: 10,
                    },
                    {
                      text: this.invoiceDetails?.SHIPPER_NAME,
                      bold: false,
                      fontSize: 8,
                      width: 200,
                    },
                  ],
                },
                {
                  columns: [
                    {
                      text: 'Place of Receipt',
                      bold: true,
                      fontSize: 9,
                      width: 80,
                    },
                    {
                      text: ':',
                      bold: true,
                      fontSize: 9,
                      width: 10,
                    },
                    {
                      text: this.invoiceDetails?.PLACE_OF_RECEIPT,
                      bold: false,
                      fontSize: 8,
                      width: 200,
                    },
                  ],
                },
              ],
              [
                {
                  columns: [
                    {
                      text: 'Shipper Name',
                      bold: true,
                      fontSize: 9,
                      width: 80,
                    },
                    {
                      text: ':',
                      bold: true,
                      fontSize: 9,
                      width: 10,
                    },
                    {
                      text: this.invoiceDetails?.SHIPPER_NAME,
                      bold: false,
                      fontSize: 8,
                      width: 200,
                    },
                  ],
                },
                {
                  columns: [
                    {
                      text: 'Port of Loading',
                      bold: true,
                      fontSize: 9,
                      width: 80,
                    },
                    {
                      text: ':',
                      bold: true,
                      fontSize: 9,
                      width: 10,
                    },
                    {
                      text: this.invoiceDetails?.PORT_OF_LOADING,
                      bold: false,
                      fontSize: 8,
                      width: 200,
                    },
                  ],
                },
              ],
              [
                {
                  columns: [
                    {
                      text: 'Vessel/Voyage',
                      bold: true,
                      fontSize: 9,
                      width: 80,
                    },
                    {
                      text: ':',
                      bold: true,
                      fontSize: 9,
                      width: 10,
                    },
                    {
                      text:
                        this.invoiceDetails?.VESSEL_NAME +
                        '/' +
                        this.invoiceDetails?.VOYAGE_NO,
                      bold: false,
                      fontSize: 8,
                      width: 200,
                    },
                  ],
                },
                {
                  columns: [
                    {
                      text: 'Port of Discharge',
                      bold: true,
                      fontSize: 9,
                      width: 80,
                    },
                    {
                      text: ':',
                      bold: true,
                      fontSize: 9,
                      width: 10,
                    },
                    {
                      text: this.invoiceDetails?.PORT_OF_DISCHARGE,
                      bold: false,
                      fontSize: 8,
                      width: 200,
                    },
                  ],
                },
              ],
              [
                {
                  columns: [
                    {
                      text: 'Freight Status',
                      bold: true,
                      fontSize: 9,
                      width: 80,
                    },
                    {
                      text: ':',
                      bold: true,
                      fontSize: 9,
                      width: 10,
                    },
                    {
                      text: '',
                      bold: false,
                      fontSize: 8,
                      width: 200,
                    },
                  ],
                },
                {
                  columns: [
                    {
                      text: 'Place of Delivery',
                      bold: true,
                      fontSize: 9,
                      width: 80,
                    },
                    {
                      text: ':',
                      bold: true,
                      fontSize: 9,
                      width: 10,
                    },
                    {
                      text: this.invoiceDetails?.PLACE_OF_DELIVERY,
                      bold: false,
                      fontSize: 8,
                      width: 200,
                    },
                  ],
                },
              ],
              [
                {
                  columns: [
                    {
                      text: 'B/L No',
                      bold: true,
                      fontSize: 9,
                      width: 80,
                    },
                    {
                      text: ':',
                      bold: true,
                      fontSize: 9,
                      width: 10,
                    },
                    {
                      text: this.invoiceDetails?.BL_NO,
                      bold: false,
                      fontSize: 8,
                      width: 200,
                    },
                  ],
                },
                {
                  columns: [
                    {
                      text: 'Shipper Ref No',
                      bold: true,
                      fontSize: 9,
                      width: 80,
                    },
                    {
                      text: ':',
                      bold: true,
                      fontSize: 9,
                      width: 10,
                    },
                    {
                      text: this.invoiceDetails?.SHIPPER_REF,
                      bold: false,
                      fontSize: 8,
                      width: 200,
                    },
                  ],
                },
              ],
              [
                {
                  columns: [
                    {
                      text: 'Date of Supply',
                      bold: true,
                      fontSize: 9,
                      width: 80,
                    },
                    {
                      text: ':',
                      bold: true,
                      fontSize: 9,
                      width: 10,
                    },
                    {
                      text: '',
                      bold: false,
                      fontSize: 8,
                      width: 200,
                    },
                  ],
                },
                {
                  columns: [
                    {
                      text: 'Place of Supply',
                      bold: true,
                      fontSize: 9,
                      width: 80,
                    },
                    {
                      text: ':',
                      bold: true,
                      fontSize: 9,
                      width: 10,
                    },
                    {
                      text: '',
                      bold: false,
                      fontSize: 8,
                      width: 200,
                    },
                  ],
                },
              ],
              [
                {
                  columns: [
                    {
                      text: 'Final Destination',
                      bold: true,
                      fontSize: 9,
                      width: 80,
                    },
                    {
                      text: ':',
                      bold: true,
                      fontSize: 9,
                      width: 10,
                    },
                    {
                      text: this.invoiceDetails?.FINAL_DESTINATION,
                      bold: false,
                      fontSize: 8,
                      width: 200,
                    },
                  ],
                },
                {},
              ],
              [
                {
                  colSpan: 2,
                  columns: [
                    {
                      text: 'Remarks',
                      bold: true,
                      fontSize: 9,
                      width: 80,
                    },
                    {
                      text: ':',
                      bold: true,
                      fontSize: 9,
                      width: 10,
                    },
                    {
                      text: '',
                      bold: false,
                      fontSize: 8,
                      width: 200,
                    },
                  ],
                },
                {},
              ],
              [
                {
                  colSpan: 2,
                  columns: [
                    {
                      text: 'No. Of Containers',
                      bold: true,
                      fontSize: 9,
                      width: 80,
                    },
                    {
                      text: ':',
                      bold: true,
                      fontSize: 9,
                      width: 10,
                    },
                    {
                      text:
                        '20GP X ' +
                        (+this.invoiceDetails?.CONTAINERS.split(',').length -
                          1),
                      bold: false,
                      fontSize: 8,
                      width: 200,
                    },
                  ],
                },
                {},
              ],
              [
                {
                  colSpan: 2,
                  columns: [
                    {
                      text: "Container No's",
                      bold: true,
                      fontSize: 9,
                      width: 80,
                    },
                    {
                      text: ':',
                      bold: true,
                      fontSize: 9,
                      width: 10,
                    },
                    {
                      text: this.invoiceDetails?.CONTAINERS,
                      bold: false,
                      fontSize: 8,
                      width: 200,
                    },
                  ],
                },
                {},
              ],
            ],
          },
        },
        {
          text: '',
          margin: [0, 10, 0, 10],
        },
        {
          layout: {
            hLineWidth: function (i: any, node: any) {
              if (i === 0 || i === node.table.body.length) {
                return 1;
              }
              return i === node.table.headerRows
                ? 1
                : i === node.table.body.length - 1
                ? 1
                : 0;
            },
            vLineWidth: function () {
              return 1;
            },
            paddingTop: function (i: any) {
              return i === 1 ? 50 : 7;
            },
            paddingBottom: function (i: any, node: any) {
              return i === node.table.body.length - 2 ? 50 : 7;
            },
            paddingLeft: function () {
              return 7;
            },
            paddingRight: function () {
              return 7;
            },
          },

          table: {
            widths: [55, 15, 40, 20, 25, 25, 30, 20, 30, 20, 30, 35],
            headerRows: 1,
            body: [
              [
                {
                  text: 'Charges',
                  fontSize: 9,
                  bold: true,
                },

                {
                  text: 'Qty',
                  fontSize: 9,
                  bold: true,
                },
                {
                  text: 'HSN',
                  fontSize: 9,
                  bold: true,
                },

                {
                  text: 'Curr',
                  fontSize: 9,
                  bold: true,
                },
                {
                  text: 'Chrg Amount',
                  fontSize: 9,
                  bold: true,
                },
                {
                  text: 'Amount',
                  fontSize: 9,
                  bold: true,
                },

                {
                  text: 'Tax Amount',
                  fontSize: 9,
                  bold: true,
                },
                {
                  text: 'Rate %',
                  fontSize: 9,
                  bold: true,
                },
                {
                  text: 'SGST',
                  fontSize: 9,
                  bold: true,
                },
                {
                  text: 'Rate %',
                  fontSize: 9,
                  bold: true,
                },
                {
                  text: 'CGST',
                  fontSize: 9,
                  bold: true,
                },
                {
                  text: 'Amount in INR',
                  fontSize: 9,
                  bold: true,
                },
              ],
              ...this.invoiceDetails.BL_LIST.map((p: any) => [
                {
                  text: p.CHARGE_NAME,
                  fontSize: 8,
                },

                {
                  text: p.QUANTITY,
                  fontSize: 8,
                },

                {
                  text: p.HSN_CODE,
                  fontSize: 8,
                },

                {
                  text: p.CURRENCY,
                  fontSize: 8,
                },
                {
                  text: p.AMOUNT,
                  fontSize: 8,
                },
                {
                  text: p.AMOUNT,
                  fontSize: 8,
                },

                {
                  text: p.AMOUNT,
                  fontSize: 8,
                },
                {
                  text: p.RATE,
                  fontSize: 8,
                },
                {
                  text: p.SGST,
                  fontSize: 8,
                },
                {
                  text: p.RATE,
                  fontSize: 8,
                },
                {
                  text: p.CGST,
                  fontSize: 8,
                },
                {
                  text: '',
                  fontSize: 8,
                },
              ]),
              [
                {
                  colSpan: 5,
                  text: 'Total : ',
                  fontSize: 8,
                },

                {
                  text: '',
                },
                {
                  text: '',
                },
                {
                  text: '',
                },
                {
                  text: '',
                },
                {
                  text: '',
                },
                {
                  text: '',
                  fontSize: 9,
                },
                {
                  text: '',
                },
                {
                  text: '',
                  fontSize: 9,
                },
                {
                  text: '',
                },
                {
                  text: '',
                  fontSize: 9,
                },
                {
                  text: '',
                  fontSize: 9,
                },
              ],
            ],
          },
        },
        {
          layout: {
            hLineWidth: function (i: any, node: any) {
              return i === node.table.body.length ? 1 : 0;
            },
            vLineWidth: function (i: any) {
              return i === 1 ? 0 : 1;
            },
          },
          table: {
            headerRows: 1,
            widths: [150, 358],
            body: [
              [
                {
                  text: 'PAN No : ',
                  fontSize: 7,
                  margin: [0, 5, 0, 0],
                },
                {
                  text:
                    'In case of any discrepancy on above invoice amount, please notify ' +
                    'within 5 \ndays. If not this invoice will be presumed to be in order.',
                  fontSize: 7,
                },
              ],
              [
                {
                  text: 'For ' + this.invoiceDetails.ORG_NAME,
                  fontSize: 8,
                  bold: true,
                },
                {
                  text:
                    'Please make NEFT/RTGS transfer in favour of ' +
                    this.invoiceDetails.ORG_NAME,
                  fontSize: 7,
                  bold: true,
                  italics: true,
                },
              ],
              [
                {},
                {
                  text:
                    'Account Holder Name: PRIME MARITIME\n' +
                    'Payment in Favour: \n' +
                    'Bank Name: \n' +
                    'Account Number:\n' +
                    'IFSC Code:\n' +
                    'Bank Address:',
                  fontSize: 8,
                },
              ],
              [
                {
                  text: 'As Agents, \n Prime Maritime DWC LLC',
                  bold: true,
                  fontSize: 8,
                },
                {},
              ],
            ],
          },
        },
      ],
      styles: {
        sectionHeader: {
          bold: true,
          fontSize: 14,
          margin: [0, 15, 0, 15],
        },
      },
    };

    pdfMake.createPdf(docDefinition).open();
  }

  Search() {
    var FROM_DATE = this.invoiceForm1.value.FROM_DATE;
    var TO_DATE = this.invoiceForm1.value.TO_DATE;

    if (FROM_DATE == '' && TO_DATE == '') {
      alert('Please enter atleast one filter to search !');
      return;
    }

    this.invoice.FROM_DATE = FROM_DATE;
    this.invoice.TO_DATE = TO_DATE;

    this.isLoading = true;
    this.getInvoiceList();
  }

  Clear() {
    this.invoiceForm1.get('FROM_DATE')?.setValue('');
    this.invoiceForm1.get('TO_DATE')?.setValue('');

    this.invoice.FROM_DATE = '';
    this.invoice.TO_DATE = '';

    this.isLoading1 = true;
    this.getInvoiceList();
  }

  get f() {
    return this.invoiceForm.controls;
  }
}
