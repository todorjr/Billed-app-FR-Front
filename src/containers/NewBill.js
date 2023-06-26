import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile = e => {
    e.preventDefault()
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    const filePath = e.target.value.split(/\\/g)
    const fileName = filePath[filePath.length-1]
    const fileExtension = fileName.split('.').pop().toLowerCase();

    const parentElement = e.target.parentNode;
    // Remove existing validation message, if any
    const existingMessage = parentElement.querySelector('.file-type-info');
    if (existingMessage) {
        parentElement.removeChild(existingMessage);
    }

    if (!['jpg', 'jpeg', 'png'].includes(fileExtension)) {
        let textElement = document.createElement('p');
        if (fileExtension === 'pdf') {
          let textElement = document.createElement('p');
          textElement.textContent = 'This file is not supported, please upload a JPG, JPEG or PNG file.';
          textElement.style.color = 'red';
          textElement.classList.add('file-type-info');
          parentElement.appendChild(textElement);
           // Emit custom event for rejected file
          const fileRejectedEvent = new CustomEvent('fileRejected');
          parentElement.dispatchEvent(fileRejectedEvent);
          return;
      }
        textElement.classList.add('file-type-info');
        parentElement.appendChild(textElement);
         // Emit custom event for rejected file
          const fileRejectedEvent = new CustomEvent('fileRejected');
          parentElement.dispatchEvent(fileRejectedEvent);
        return;
    } else {
        // Show the successful message if the file type is jpg, jpeg, or png
        const successElement = document.createElement('p');
        successElement.textContent = `${fileName} uploaded successfully.`;
        successElement.style.color = 'green';
        successElement.classList.add('file-type-info');
        parentElement.appendChild(successElement);
          // Emit custom event for accepted file
    const fileAcceptedEvent = new CustomEvent('fileAccepted', { detail: { fileName } });
    parentElement.dispatchEvent(fileAcceptedEvent);
    }

    const formData = new FormData()
    const email = JSON.parse(localStorage.getItem("user")).email
    formData.append('file', file)
    formData.append('email', email)

    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({fileUrl, key}) => {
        console.log(fileUrl)
        this.billId = key
        this.fileUrl = fileUrl
        this.fileName = fileName
      }).catch(error => console.error(error))
  }

  handleSubmit = e => {
    e.preventDefault()
    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}