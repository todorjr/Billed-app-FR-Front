/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import { JSDOM } from "jsdom";
import Bills from "../containers/Bills.js";
import { formatDate, formatStatus } from "../app/format.js";

jest.mock("../app/format.js", () => ({
  formatDate: jest.fn((date) => `formatted_date_${date}`),
  formatStatus: jest.fn((status) => `formatted_status_${status}`),
}));

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBeTruthy()

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test('Then it should call handleClickIconEye when iconEye is clicked', () => {
      // creating dom element
      const domElement = new JSDOM(`<!DOCTYPE html><div data-testid="icon-eye"></div>`);
      const { document } = domElement.window;
  
      // Mock onNavigate function, store and localStorage for Bills constructor
      const onNavigate = jest.fn();
      const store = { bills: () => ({ list: () => Promise.resolve([]) }) };
      const localStorage = window.localStorage;
  
      // Create instance of Bills
      const billsInstance = new Bills({
        document,
        onNavigate,
        store,
        localStorage
      });
      // we are watching handleClickIconEye function
      const handleClickIconEyeSpy = jest.spyOn(billsInstance, 'handleClickIconEye');

      // simulate click event on the iconEye
      const iconEye = document.querySelector('div[data-testid="icon-eye"]');
      fireEvent.click(iconEye);

      // sssert that handleClickIconEye was called
      expect(handleClickIconEyeSpy).toHaveBeenCalled();
    });
    test('Then it should navigate to new bill page when new bill button is clicked', () => {
      // Setup a simple DOM
      const dom = new JSDOM(`<!DOCTYPE html><button data-testid="btn-new-bill"></button>`);
      const { document } = dom.window;
  
      // Mock onNavigate function, store and localStorage for Bills constructor
      const onNavigate = jest.fn();
      const store = { bills: () => ({ list: () => Promise.resolve([]) }) };
      const localStorage = window.localStorage;
  
      // Create instance of Bills
      const billsInstance = new Bills({
        document,
        onNavigate,
        store,
        localStorage
      });

      // Simulate click event on the new bill button
      const newBillButton = document.querySelector('button[data-testid="btn-new-bill"]');
      newBillButton.click(); // Here we use the built-in click method

      // Assert that onNavigate was called with the right path
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill']);
    });
  });
})
