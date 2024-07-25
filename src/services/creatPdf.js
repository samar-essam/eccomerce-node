const { log } = require("console");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const paymentModel = require("../../db/models/payment.model");

function createInvoice(path, paymentData) {
  // console.log('adasdasasd' , paymentData);
  let doc = new PDFDocument({ size: "A4", margin: 50 });

  generateHeader(doc);
  generateCustomerInformation(doc, paymentData);
  generateInvoiceTable(doc, paymentData);

  doc.end();
  doc.pipe(fs.createWriteStream(path));
}

function generateHeader(doc) {
  doc
    .image("logo.jpg", 50, 45, { width: 50 })
    .fillColor("#444444")
    .fontSize(20)
    .text("Company Name", 110, 57)
    .fontSize(10)
    .text("Company rqwrqwrqwrqwr", 200, 50, { align: "right" })
    .text("Company address", 200, 65, { align: "right" })
    .text("Company address in details", 200, 80, { align: "right" })
    .moveDown();
}

function generateCustomerInformation(doc, paymentData) {
  doc.fillColor("#444444").fontSize(20).text("Invoice", 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;
  console.log(paymentData);
  doc
    .fontSize(10)
    .text("Invoice Number:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(
      new Date(paymentData.createdAt).getTime(),
      150,
      customerInformationTop
    )
    .font("Helvetica")
    .text("Invoice Date:", 50, customerInformationTop + 15)
    .text(
      new Date(paymentData.createdAt).toLocaleString(),
      150,
      customerInformationTop + 15
    )
    .text("Paid :", 50, customerInformationTop + 30)
    .text(
      paymentData.totalPaid + " " + "EGP",
      150,
      customerInformationTop + 30
    )
    .text("Customer:", 300, customerInformationTop)
    .font("Helvetica-Bold")
    .text(paymentData.customer, 350, customerInformationTop)
    .font("Helvetica")
    .text("Employee:", 300, customerInformationTop + 15)
    .font("Helvetica-Bold")
    .text(paymentData.employee, 363, customerInformationTop + 15);

  generateHr(doc, 252);
}

async function generateInvoiceTable(doc, paymentData) {
  console.log(paymentData);
  let i = 0;
  const invoiceTableTop = 330;

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Payment Method",
    "No. of years",
    "Total Invoices",
    "No. of paid invoices",
    "Invoice value"
  );
  generateHr(doc, invoiceTableTop + 25);
  doc.font("Helvetica");

  const position = invoiceTableTop + (i + 3) * 12;
  generateTableRow(
    doc,
    position,
    paymentData.paymentMethod,
    paymentData.noOfYears,
    paymentData.totalInvoices,
    paymentData.noOfPaidInvoices,
    paymentData.invoiceValue + " " + "EGP"
  );

  generateHr(doc, position + 20);
}

function generateTableRow(
  doc,
  y,
  paymentMethod,
  noOfYears,
  totalInvoices,
  noOfPaidInvoices,
  invoiceValue
) {
  doc
    .fontSize(10)
    .text(paymentMethod, 50, y)
    .text(noOfYears, 150, y)
    .text(totalInvoices, 240, y)
    .text(noOfPaidInvoices, 335, y)
    .text(invoiceValue, 450, y, { width: 150 });
}

function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

module.exports = {
  createInvoice,
};
