import webdriver from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

const chromePath = `${__dirname}/../../../${process.env.SELENIUM_BROWSER_BINARY_PATH}`;
const service = new chrome.ServiceBuilder(chromePath).build();

chrome.setDefaultService(service);

const chromeCapabilities = webdriver.Capabilities.chrome();

const chromeOptions = {
    args: ['--test-type', '--start-maximized', '--incognito'],
};

chromeCapabilities.set('chromeOptions', chromeOptions);

const driver = new webdriver.Builder()
    .forBrowser('chrome')
    .withCapabilities(chromeCapabilities)
    .build();

export default driver;
