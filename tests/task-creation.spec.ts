import { expect, test } from '@playwright/test';
import { allure } from 'allure-playwright';
import {v4 as uuidv4} from 'uuid';

export default class DateForPicker {
    day: string;
    month: string;
    year: string;
    isEmpty = true;

    constructor(offset: number = 0, isEmpty: boolean = false) {
        var date = new Date(new Date().getTime() + (offset * 24 * 60 * 60 * 1000));
        this.isEmpty = isEmpty;
        this.day = date.getUTCDate() < 10 ? '0' + date.getUTCDate() : date.getUTCDate().toString();
        this.month = date.getUTCMonth() < 9 ? '0' + (date.getUTCMonth() + 1) : (date.getUTCMonth() + 1).toString();
        this.year = date.getUTCFullYear().toString();
    }

    forPicker() {
        if (this.isEmpty) return this.empty();
        return `${this.day}.${this.month}.${this.year}`;
    }
    
    forTask() {
        if (this.isEmpty) return this.empty();
        return process.env.CI ?
            `${this.year}-${this.day}-${this.month}` :
            `${this.year}-${this.month}-${this.day}`;
    }

    empty() {
        return '';
    }
}

async function addNewTask(page, name) {
    const plannedDate = new DateForPicker();
    const estimation = "15";

    await page.locator('#taskName').type(name);
    await page.locator('#plannedDate').type(plannedDate.forPicker());
    await page.locator('#estimation').type(estimation);
    await page.getByRole('button', {name: 'Create Task'}).click();
}

const taskName = ['', 'Test name', '!@#$%^&*()_-+='];
const dates = [new DateForPicker(0, true), new DateForPicker(-1), new DateForPicker(0), new DateForPicker(1)];
const estimations = ['', -1, 0, 1];

test.beforeEach(() => {
    allure.epic("Tasks");
    allure.feature("Creating task");
});

taskName.forEach(name => {
    test(`No limitations for task with name "${name}"`, async ({ page }) => {
        allure.story("Task fields limitation");

        await page.goto('/time-tracker');
        await page.locator('#taskName').type(name);
        await page.getByRole('button', {name: 'Create Task'}).click();

        await expect(page.locator("div.card .card-header")).toHaveText(name);
    });
});

dates.forEach(date => {
    test(`No limitations for date provided ("${date.forPicker()}")`, async ({ page }) => {
        allure.story("Task fields limitation");
        await page.goto('/time-tracker');
        await page.locator('#plannedDate').type(date.forPicker() || '');
        await page.getByRole('button', {name: 'Create Task'}).click();

        await expect(page.locator("div.card .card-body")).toContainText(`Planned Date: ${date.forTask()}`);
    });
});

estimations.forEach(e => {
    test(`No limitations for estimation ("${e}")`, async ({ page }) => {
        allure.story("Task fields limitation");

        await page.goto('/time-tracker');
        await page.locator('#estimation').type(e.toString());
        await page.getByRole('button', {name: 'Create Task'}).click();

        await expect(page.locator("div.card .card-body")).toContainText(`Estimation, minutes: ${e}`);
    });
});

test(`New task is in the end`, async ({ page }) => {
    allure.story("User can see new task in the end of a list");

    const taskName = `Task_${uuidv4()}`;

    await page.goto('/time-tracker');
    await addNewTask(page, "static task");
    await addNewTask(page, taskName);

    await expect(page.locator("div.card").last().locator("div.card-header")).toContainText(taskName);
});

test(`New task is in waiting status`, async ({ page }) => {
    allure.story("User can see new task in the end of a list");
    
    const taskName = `Task_${uuidv4()}`;

    await page.goto('/time-tracker');
    await addNewTask(page, taskName);

    await expect(page.locator("div.card h5.card-title")).toContainText('waiting');
});