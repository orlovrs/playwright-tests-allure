import { expect, Page, test } from '@playwright/test';
import { allure } from 'allure-playwright';

export default class DateForPicker {
    day: string;
    month: string;
    year: string;
    isEmpty = true;

    constructor(offset: number = 0, isEmpty: boolean = false) {
        var date = new Date();
        date.setDate(date.getDate() + offset);
        this.isEmpty = isEmpty;
        this.day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate().toString();
        this.month = date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1).toString();
        this.year = date.getFullYear().toString();
    }

    forPicker() {
        if (this.isEmpty) return this.empty();
        return `${this.day}.${this.month}.${this.year}`;
    }
    
    forTask() {
        if (this.isEmpty) return this.empty();
        return `${this.year}-${this.month}-${this.day}`;
    }

    empty() {
        return '';
    }
}

test.beforeEach(async ({ page }) => {
    allure.epic("Tasks");
    allure.feature("Statuses transitions");
    page.setDefaultTimeout(5000);
});

async function addNewTask(page, name, status) {
    const plannedDate = new DateForPicker();
    const estimation = "15";

    await page.locator('#taskName').type(name);
    await page.locator('#plannedDate').type(plannedDate.forPicker());
    await page.locator('#estimation').type(estimation);
    await page.getByRole('button', {name: 'Create Task'}).click();

    switch (status) {
        case 'waiting': return;
        case 'in progress':
            await clickStart(page)
            return;
        case 'done':
            await clickStart(page);
            await clickDone(page);
            return;
        case 'deleted':
            await clickDelete(page);
            return;
    }
}

async function clickStart(page: Page) {
    await page.locator('div.card button.btn-success').click();
}

async function isStartDisabled(page) {
    return await page.locator('div.card button.btn-success').isDisabled();
}

async function clickPause(page) {
    await page.locator('div.card button.btn-warning').click();
}

async function isPauseDisabled(page) {
    return await page.locator('div.card button.btn-warning').isDisabled();
}

async function clickDone(page) {
    await page.locator('div.card button.btn-primary').click();
}

async function isDoneDisabled(page) {
    return await page.locator('div.card button.btn-primary').isDisabled();
}

async function clickDelete(page) {
    await page.locator('div.card button.btn-danger').click();
}

async function isDeleteDisabled(page) {
    return await page.locator('div.card .btn-danger').isDisabled();
}

const testCases = [
    { initialState: 'waiting', endState: 'waiting', available: false },
    { initialState: 'waiting', endState: 'in progress', available: true },
    { initialState: 'waiting', endState: 'deleted', available: true },
    { initialState: 'waiting', endState: 'done', available: false },
    { initialState: 'in progress', endState: 'waiting', available: true },
    { initialState: 'in progress', endState: 'in progress', available: false },
    { initialState: 'in progress', endState: 'deleted', available: true },
    { initialState: 'in progress', endState: 'done', available: true },
    { initialState: 'done', endState: 'waiting', available: false },
    { initialState: 'done', endState: 'in progress', available: false },
    { initialState: 'done', endState: 'deleted', available: false },
    { initialState: 'done', endState: 'done', available: false },
];

testCases.forEach(async function(testCase) {
    test(`${testCase.initialState} -> ${testCase.endState}: ${testCase.available}`, async ({ page }) => {
        allure.story("User can switch beetwen various statuses");
        const taskName = `JustTask`;
    
        await page.goto('/time-tracker');
        await addNewTask(page, taskName, testCase.initialState);

        switch (testCase.endState) {
            case 'waiting':
                if (testCase.available) {
                    await clickPause(page);
                    await expect(await page.locator('h5.card-title')).toContainText('waiting');
                } else {
                    await expect(await isPauseDisabled(page)).toBe(true)
                }
                break;
            case 'in progress':
                if (testCase.available) {
                    await clickStart(page);
                    await expect(page.locator('h5.card-title')).toContainText('in progress');
                } else {
                    await expect(await isStartDisabled(page)).toBe(true)
                }
                break;
            case 'done':
                if (testCase.available) {
                    await clickDone(page);
                    await expect(await page.locator('h5.card-title')).toContainText('done');
                } else {
                    await expect(await isDoneDisabled(page)).toBe(true)
                }
                break;
            case 'deleted':
                if (testCase.available) {
                    await clickDelete(page);
                    await expect(await page.locator('div.card').count()).toEqual(0);
                } else {
                    await expect(await isDeleteDisabled(page)).toBe(true)
                }
                break;
        }
    });
});

test(`Timer starts when pass status to in progress`, async ({ page }) => {
    allure.story("User sees UI changes when task started");
    const taskName = `JustTask`;

    await page.goto('/time-tracker');
    await addNewTask(page, taskName, 'waiting');
    await clickStart(page);
    await expect(page.locator('p.card-text').nth(1)).toContainText('00:05', { timeout: 6000 });
});

test(`Timer stops when pause button clicked`, async ({ page }) => {
    allure.story("User sees UI changes when task paused");
    const taskName = `JustTask`;

    await page.goto('/time-tracker');
    await addNewTask(page, taskName, 'waiting');
    await clickStart(page);
    await expect(page.locator('p.card-text').nth(1)).toContainText('00:02', { timeout: 6000 });
    await clickPause(page);
    await page.waitForTimeout(3000);
    await expect(page.locator('p.card-text').nth(1)).toContainText('00:02');
});

test(`Timer is shown in button text`, async ({ page }) => {
    allure.story("User sees UI changes when task started");
    const taskName = `JustTask`;

    await page.goto('/time-tracker');
    await addNewTask(page, taskName, 'waiting');
    await clickStart(page);
    await expect(page.locator('button.btn-success')).toContainText('00:05', { timeout: 6000 });
});

test(`Button label back to Start after task is paused`, async ({ page }) => {
    allure.story("User sees UI changes when task paused");
    const taskName = `JustTask`;

    await page.goto('/time-tracker');
    await addNewTask(page, taskName, 'waiting');
    await clickStart(page);
    await expect(page.locator('button.btn-success')).toContainText('00:02', { timeout: 6000 });
    await clickPause(page);
    await expect(page.locator('button.btn-success')).toContainText('Start');
});