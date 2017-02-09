import { until, By } from 'selenium-webdriver';
import expect from 'expect';
import path from 'path';
import chunk from 'lodash.chunk';

import driver from '../../common/tests/chromeDriver';
import { clear } from '../../common/tests/fixtures';
import { elementIsClickable, elementValueIs } from '../../common/tests/conditions';

describe('Admin page', function homeTests() {
    this.timeout(10000);
    const DEFAULT_WAIT_TIMEOUT = 9000; // A bit less than mocha's timeout to get explicit errors from selenium

    before(async () => {
        await clear();
    });

    describe('Uploading', () => {
        it('should redirect to the login page if not authenticated', async () => {
            await driver.get('http://localhost:3010/#/admin');
            await driver.wait(until.elementLocated(By.css('#login_form')), DEFAULT_WAIT_TIMEOUT);
        });

        it('should redirect to the admin after successfull login', async () => {
            const username = await driver.findElement(By.css('input[name=username]'));
            const password = await driver.findElement(By.css('input[name=password]'));
            const form = await driver.findElement(By.css('#login_form'));
            await username.clear();
            await username.sendKeys('user');
            await password.clear();
            await password.sendKeys('secret');
            await form.submit();
            await driver.wait(until.elementLocated(By.css('.admin')), DEFAULT_WAIT_TIMEOUT);
        });

        it('should display the upload component if no dataset has been loaded yet', async () => {
            await driver.wait(until.elementLocated(By.css('.upload')), DEFAULT_WAIT_TIMEOUT);
        });

        it('should display the parsing result after uploading a csv', async () => {
            const csvPath = path.resolve(__dirname, './linked_sample_csv.csv');
            const input = await driver.findElement(By.css('input[name=file]'));
            await input.sendKeys(csvPath);
            await driver.wait(until.elementLocated(By.css('.parsingResult')), DEFAULT_WAIT_TIMEOUT);
        });
    });

    describe('configuring uri column', async () => {
        it('should display publication_preview', async () => {
            await driver.wait(until.elementLocated(By.css('.publication-preview')), DEFAULT_WAIT_TIMEOUT);
        });

        it('should display only uri empty column', async () => {
            const th = await driver.findElement(By.css('.publication-preview th'));
            const text = await th.getText();
            expect(text).toBe('uri');

            const tds = await driver.findElements(By.css('.publication-preview tr td:first-child'));
            expect(tds.length).toBe(3);
            await Promise.all(tds.map(td =>
                driver.wait(until.elementTextIs(td, ''), DEFAULT_WAIT_TIMEOUT)),
            );
        });

        it('should display form for uri column when clicking on uri column', async () => {
            await driver.findElement(By.css('.publication-preview th')).click();
            await driver.wait(until.elementLocated(By.css('#field_form')), DEFAULT_WAIT_TIMEOUT);
            const name = await driver.findElement(By.css('#field_form input[name=name]'));
            const label = await driver.findElement(By.css('#field_form input[name=label]'));
            await driver.wait(elementValueIs(name, 'uri'), DEFAULT_WAIT_TIMEOUT);
            await driver.wait(elementValueIs(label, 'uri'), DEFAULT_WAIT_TIMEOUT);
        });

        it('should allow to add a transformer AUTOGENERATE_URI', async () => {
            await driver.findElement(By.css('#field_form .add-transformer')).click();

            await driver.findElement(By.css('.operation')).click();
            await driver.wait(until.elementLocated(By.css('.AUTOGENERATE_URI')));
            await driver.findElement(By.css('.AUTOGENERATE_URI')).click();
        });

        it('should have completed uri column with generated uri', async () => {
            const tds = await driver.findElements(By.css('.publication-preview tr td:first-child'));
            expect(tds.length).toBe(3);
            await Promise.all(tds.map(td =>
                driver.wait(until.elementTextMatches(td, /[A-Z0-9]{8}/), DEFAULT_WAIT_TIMEOUT)),
            );
        });
    });

    describe('adding LINK column', () => {
        it('should display form for newField2 column when clicking on add-column', async () => {
            await driver.executeScript('document.getElementsByClassName("add-column")[0].scrollIntoView(true);');
            await driver.sleep(1000);
            await driver.findElement(By.css('.add-column')).click();
            await driver.wait(until.elementLocated(By.css('#field_form')), DEFAULT_WAIT_TIMEOUT);
            const name = await driver.findElement(By.css('#field_form input[name=name]'));
            const label = await driver.findElement(By.css('#field_form input[name=label]'));

            await driver.wait(elementValueIs(name, 'newField2'), DEFAULT_WAIT_TIMEOUT);
            await driver.wait(elementValueIs(label, 'newField 2'), DEFAULT_WAIT_TIMEOUT);
        });

        it('should change column name', async () => {
            const name = await driver.findElement(By.css('#field_form input[name=name]'));
            const label = await driver.findElement(By.css('#field_form input[name=label]'));
            await name.clear();
            await name.sendKeys('stronger');
            await label.clear();
            await label.sendKeys('Stronger than');
            const th = await driver.findElement(By.css('.publication-preview th:nth-child(2)'));
            await driver.wait(until.elementTextIs(th, 'Stronger than'), DEFAULT_WAIT_TIMEOUT);
        });

        it('should add a transformer LINK', async () => {
            await driver.executeScript('document.getElementsByClassName("add-transformer")[0].scrollIntoView(true);');
            await driver.findElement(By.css('#field_form .add-transformer')).click();
            await driver.executeScript('document.getElementsByClassName("operation")[0].scrollIntoView(true);');
            await driver.findElement(By.css('.operation')).click();
            await driver.wait(until.elementLocated(By.css('.LINK')), DEFAULT_WAIT_TIMEOUT);
            await driver.executeScript('document.getElementsByClassName("LINK")[0].scrollIntoView(true);');
            await driver.findElement(By.css('.LINK')).click();
            const reference = await driver.findElement(By.css('#field_form .reference input'));
            await driver.wait(elementIsClickable(reference), DEFAULT_WAIT_TIMEOUT);
        });

        it('should configure transformer Link', async () => {
            const reference = await driver.findElement(By.css('#field_form .reference input'));
            reference.sendKeys('stronger_than');
            const identifier = await driver.findElement(By.css('#field_form .identifier input'));
            identifier.sendKeys('id');
        });

        it('should have added stronger column with link', async () => {
            await driver.wait(
                until.elementLocated(By.css('.publication-preview tr td:nth-child(2)')),
                DEFAULT_WAIT_TIMEOUT,
            );
            const tds = await driver.findElements(By.css('.publication-preview tr td:nth-child(2)'));
            expect(tds.length).toBe(3);
            const expectedTexts = [
                'uri to id: 3',
                'uri to id: 1',
                'uri to id: 2',
            ];
            await Promise.all(tds.map((td, index) =>
                driver.wait(until.elementTextIs(td, expectedTexts[index]), DEFAULT_WAIT_TIMEOUT)),
            );
        });
    });

    describe('Publishing', () => {
        it('should display the "data published" message after publication', async () => {
            const buttonPublish = await driver.findElement(By.css('.btn-publish'));
            await driver.wait(elementIsClickable(buttonPublish), DEFAULT_WAIT_TIMEOUT);
            await buttonPublish.click();
            await driver.wait(until.elementLocated(By.css('.data-published')), DEFAULT_WAIT_TIMEOUT);
        });

        it('should not display the parsing result after publication', async () => {
            const parsingResult = await driver.findElements(By.css('.parsingResult'));
            expect(parsingResult.length).toEqual(0);
        });

        it('should not display the upload after publication', async () => {
            const upload = await driver.findElements(By.css('.upload'));
            expect(upload.length).toEqual(0);
        });

        it('should display the published data on the home page', async () => {
            await driver.get('http://localhost:3010/');
            await driver.wait(until.elementLocated(By.css('.dataset')), DEFAULT_WAIT_TIMEOUT);
            const headers = await driver.findElements(By.css('.dataset table th'));
            const headersText = await Promise.all(headers.map(h => h.getText()));
            expect(headersText).toEqual(['uri', 'stronger']);

            const tds = await driver.findElements(By.css('.dataset table tbody td'));
            const tdsText = await Promise.all(tds.map(td => td.getText()));
            const tdsTextByRow = chunk(tdsText, 2);

            expect(tdsTextByRow[0][0]).toEqual(tdsTextByRow[1][1]);
            expect(tdsTextByRow[1][0]).toEqual(tdsTextByRow[2][1]);
            expect(tdsTextByRow[2][0]).toEqual(tdsTextByRow[0][1]);
        });
    });

    after(async () => {
        await clear();
        await driver.executeScript('localStorage.clear();');
    });
});
