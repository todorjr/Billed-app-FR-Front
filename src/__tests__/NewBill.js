/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { fireEvent, DataTransfer } from '@testing-library/dom'
import { ROUTES_PATH } from '../constants/routes.js'


describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {
        //Through this test, I'm validating that my application correctly handles the file upload process, accepting only the desired file formats and providing user feedback accordingly. This helps ensure a positive and intuitive user experience while avoiding potential issues with unsupported file types.
        test("Then only jpg, jpeg and png file extensions should be accepted, and PDF file should be rejected", () => {
            //set up a mock HTML structure that replicates the NewBill form that an employee would interact with, including an input field for a file.
            const html = document.createElement('div');
            html.innerHTML = `
                <form data-testid="form-new-bill">
                <input data-testid="file" type="file" />
                </form>
            `;
            document.body.innerHTML = html.outerHTML;

            //initial conditions and variables, including a mock user in localStorage, a null Firestore database, and a mock store that returns a resolved promise.
            const onNavigate = jest.fn();
            const localStorage = window.localStorage;
            localStorage.setItem("user", JSON.stringify({type: 'Admin', email: 'test@test.fr'}))
            const firestore = null;
            const store = { bills: () => ({ 
                list: () => Promise.resolve([]),
                create: () => Promise.resolve(true)
            }) };

            const newBill = new NewBill({ //new instance of the NewBill class and pass it your mocked values, including the document with your mock HTML.
                document,
                onNavigate,
                store,
                localStorage
            });

            //mock function for handleChangeFile and attach it to the 'change' event listener on the file input field.
            const handleChangeFile = jest.fn(newBill.handleChangeFile);
            const file = document.querySelector(`input[data-testid="file"]`);
            file.addEventListener('change', handleChangeFile);

            // Simulate change event for jpg file and testing for jpg file extension acceptance: I simulate a 'change' event on the file input field with a jpg file, then check if the handleChangeFile function was called. I also ensure that the displayed message and color are correct for a successful jpg file upload.
            const jpgFile = new File(['content'], 'test.jpg', { type: 'image/jpg' });

            fireEvent.change(file, {
                target: {
                    files: [jpgFile],
                },
            });
            expect(handleChangeFile).toHaveBeenCalled(); 
            const successMessage = document.querySelector('.file-type-info');
            expect(successMessage.textContent).toBe('test.jpg uploaded successfully.');
            expect(successMessage.style.color).toBe('green');

             // Simulate change event for jpg file
                const jpegFile = new File(['content'], 'test.jpeg', { type: 'image/jpeg' });

                fireEvent.change(file, {
                    target: {
                        files: [jpegFile],
                    },
                });
                const succesJpegMessage = document.querySelector('.file-type-info');
                expect(succesJpegMessage.textContent).toBe('test.jpeg uploaded successfully.');
                expect(succesJpegMessage.style.color).toBe('green');

            // Simulate change event for pdf file
            const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
            fireEvent.change(file, {
                target: {
                    files: [pdfFile],
                },
            });
                const errorMessage = document.querySelector('.file-type-info');
                expect(errorMessage.textContent).toBe('This file is not supported, please upload a JPG, JPEG or PNG file.');
                expect(errorMessage.style.color).toBe('red');
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
