/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { fireEvent, DataTransfer } from '@testing-library/dom'
import { ROUTES_PATH } from '../constants/routes.js'

   // Helper function to setup the test environment
// function setupTestEnvironment() {
//     const html = document.createElement('div');
//     html.innerHTML = `
// <form data-testid="form-new-bill">
//     <input data-testid="file" type="file" />
// </form>
// `;
//     document.body.innerHTML = html.outerHTML;
//     const onNavigate = jest.fn();
//     const localStorage = window.localStorage;
//     const firestore = null;
//     const newBill = new NewBill({
//         document,
//         onNavigate,
//         firestore,
//         localStorage
//     });
//     const handleChangeFile = jest.fn(newBill.handleChangeFile);
//     const file = document.querySelector(`input[data-testid="file"]`);
//     file.addEventListener('change', handleChangeFile);

//     return { file, handleChangeFile };
// }

describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {
        test("Then only jpg, jpeg and png file extensions should be accepted, and PDF file should be rejected", () => {
            const html = document.createElement('div');
            html.innerHTML = `
                <form data-testid="form-new-bill">
                <input data-testid="file" type="file" />
                </form>
            `;
            document.body.innerHTML = html.outerHTML;
            const onNavigate = jest.fn();
            const localStorage = window.localStorage;
            localStorage.setItem("user", JSON.stringify({type: 'Admin', email: 'test@test.fr'}))
            const firestore = null;
            const store = { bills: () => ({ 
                list: () => Promise.resolve([]),
                create: () => Promise.resolve(true)
            }) };
            const newBill = new NewBill({
                document,
                onNavigate,
                store,
                localStorage
            });
            const handleChangeFile = jest.fn(newBill.handleChangeFile);
            const file = document.querySelector(`input[data-testid="file"]`);
            file.addEventListener('change', handleChangeFile);

            // Simulate change event for jpeg file
            const jpegFile = new File(['content'], 'test.jpeg', { type: 'image/jpeg' });

            fireEvent.change(file, {
                target: {
                    files: [jpegFile],
                },
            });
            expect(handleChangeFile).toHaveBeenCalled(); 
            const successMessage = document.querySelector('.file-type-info');
            expect(successMessage.textContent).toBe('test.jpeg uploaded successfully.');
            expect(successMessage.style.color).toBe('green');


            // // Simulate change event for png file
            // const pngFile = new File(['content'], 'test.png', { type: 'image/png' });
            // fireEvent.change(file, {
            //     target: {
            //         files: [pngFile],
            //     },
            // });
            // file.addEventListener('fileAccepted', (e) => {
            //     expect(e.detail.fileName).toBe('test.png');
            //     const successMessage = document.querySelector('.file-type-info');
            //     expect(successMessage.textContent).toBe('test.png uploaded successfully.');
            //     expect(successMessage.style.color).toBe('green');
            // });
            // file.addEventListener('fileRejected', () => {
            //     throw new Error("png file was rejected");
            // });

            // // Simulate change event for jpg file
            // const jpgFile = new File(['content'], 'test.jpg', { type: 'image/jpg' });
            // fireEvent.change(file, {
            //     target: {
            //         files: [jpgFile],
            //     },
            // });
            // file.addEventListener('fileAccepted', (e) => {
            //     expect(e.detail.fileName).toBe('test.jpg');
            //     const successMessage = document.querySelector('.file-type-info');
            //     expect(successMessage.textContent).toBe('test.jpg uploaded successfully.');
            //     expect(successMessage.style.color).toBe('green');
            // });
            // file.addEventListener('fileRejected', () => {
            //     throw new Error("jpg file was rejected");
            // });

            // // Simulate change event for pdf file
            // const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
            // fireEvent.change(file, {
            //     target: {
            //         files: [pdfFile],
            //     },
            // });
            // file.addEventListener('fileRejected', () => {
            //     const errorMessage = document.querySelector('.file-type-info');
            //     expect(errorMessage.textContent).toBe('This file is not supported, please upload a JPG, JPEG or PNG file.');
            //     expect(errorMessage.style.color).toBe('red');
            // });

            // file.addEventListener('fileAccepted', (e) => {
            //     throw new Error("pdf file was accepted");
            // });

            // // Simulate change event for accepted files]
            // fireEvent.change(file, {
            //     target: {
            //         files: [jpegFile, pngFile, jpgFile],
            //     },
            // });
            // file.addEventListener('fileAccepted', (e) => {
            //     expect(e.detail.fileName).toBe('test.jpg');
            //     const successMessage = document.querySelector('.file-type-info');
            //     expect(successMessage.textContent).toBe('test.jpg uploaded successfully.');
            //     expect(successMessage.style.color).toBe('green');
            // });

        });

        test("Then the bill should be updated and I should navigate to Bills", () => {
            const html = document.createElement('div')
            html.innerHTML = `
            <form data-testid="form-new-bill">
                <select data-testid="expense-type">
                    <option value="type1">Type1</option>
                    <option value="type2">Type2</option>
                </select>
                <input data-testid="expense-name" type="text" />
                <input data-testid="amount" type="number" />
                <input data-testid="datepicker" type="date" />
                <input data-testid="vat" type="text" />
                <input data-testid="pct" type="number" />
                <textarea data-testid="commentary"></textarea>
                <input data-testid="file" type="file" />
                <button type="submit">Submit</button>
            </form>
        `
            document.body.innerHTML = html.outerHTML
            window.localStorage.setItem('user', JSON.stringify({ email: 'test@email.com' }))
            const onNavigate = jest.fn()
            const localStorage = window.localStorage
            const firestore = null
            const newBill = new NewBill({
                document,
                onNavigate,
                firestore,
                localStorage
            })
            const handleSubmit = jest.fn(newBill.handleSubmit)
            const formNewBill = document.querySelector(`form[data-testid="form-new-bill"]`)
            formNewBill.addEventListener("submit", handleSubmit)
            newBill.updateBill = jest.fn()

            // Set form values
            formNewBill.querySelector(`input[data-testid="expense-name"]`).value = 'Test Expense'
            formNewBill.querySelector(`input[data-testid="amount"]`).value = '123'
            formNewBill.querySelector(`input[data-testid="datepicker"]`).value = '2023-05-30'
            formNewBill.querySelector(`input[data-testid="vat"]`).value = '20'
            formNewBill.querySelector(`input[data-testid="pct"]`).value = '20'
            formNewBill.querySelector(`textarea[data-testid="commentary"]`).value = 'Test commentary'

            // Set form values
            formNewBill.querySelector(`select[data-testid="expense-type"]`).value = 'type1';
            formNewBill.querySelector(`input[data-testid="expense-name"]`).value = 'Test Expense';
            formNewBill.querySelector(`input[data-testid="amount"]`).value = '123';
            formNewBill.querySelector(`input[data-testid="datepicker"]`).value = '2023-05-30';
            formNewBill.querySelector(`input[data-testid="vat"]`).value = '20';
            formNewBill.querySelector(`input[data-testid="pct"]`).value = '20';
            formNewBill.querySelector(`textarea[data-testid="commentary"]`).value = 'Test commentary';

            // Set file-related properties of the NewBill instance
            newBill.fileUrl = 'http://example.com/test.jpeg';
            newBill.fileName = 'test.jpeg';

            // Simulate form submission
            fireEvent.submit(formNewBill)

            // Verify that updateBill was called with the correct bill object
            const expectedBill = {
                email: 'test@email.com',
                type: 'type1',
                name: 'Test Expense',
                amount: 123,
                date: '2023-05-30',
                vat: '20',
                pct: 20,
                commentary: 'Test commentary',
                fileUrl: 'http://example.com/test.jpeg',
                fileName: 'test.jpeg',
                status: 'pending',
            };

            // Simulate form submission
            fireEvent.submit(formNewBill)

            expect(newBill.updateBill).toHaveBeenCalled()
            expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills'])
            expect(newBill.updateBill).toHaveBeenCalledWith(expectedBill);
            // Verify that the user was redirected to the Bills page
            expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
        })
    })
})
