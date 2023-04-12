import { expect, Page, test } from '@playwright/test';
import { allure } from 'allure-playwright';
import {v4 as uuidv4} from 'uuid';

export default class Task {
    day: string;
    month: string;
    year: string;
    isEmpty = true;
    page: Page;
    name: string;
    estimation: number;

    constructor(page: Page, offset: number = 0, isEmpty: boolean = false) {
        this.page = page;
        this.name = "Task_" + uuidv4();
        this.estimation = 11;
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

    async create() {
        await this.page.locator('#taskName').type(this.name);
        await this.page.locator('#plannedDate').type(this.forPicker());
        await this.page.locator('#estimation').type(this.estimation.toString());
        await this.page.getByRole('button', {name: 'Create Task'}).click();
    }

    async delete() {
        await this.page.locator(`//div[contains(text(),'${this.name}')]//..//button[@class='btn btn-danger']`).click();
    }
}

test.beforeEach(() => {
    allure.epic("Tasks");
    allure.feature("Deleting task");
    allure.story("User can delete task from any place of the list");
});

test(`The only task can be deleted`, async ({ page }) => {
    const task = new Task(page, 0, false);

    await page.goto('/time-tracker');
    await task.create();
    await task.delete();

    await expect(page.locator("div.card")).toHaveCount(0);
});

test(`First task can be deleted`, async ({ page }) => {
    const task1 = new Task(page, 0, false);
    const task2 = new Task(page, 0, false);

    await page.goto('/time-tracker');
    await task1.create();
    await task2.create();
    await task1.delete();

    await expect(page.locator("div.card-header")).toContainText(task2.name);
});

test(`Last task can be deleted`, async ({ page }) => {
    const task1 = new Task(page, 0, false);
    const task2 = new Task(page, 0, false);

    await page.goto('/time-tracker');
    await task1.create();
    await task2.create();
    await task2.delete();

    await expect(page.locator("div.card-header")).toContainText(task1.name);
});

test(`Task from the middle can be deleted`, async ({ page }) => {
    const task1 = new Task(page, 0, false);
    const task2 = new Task(page, 0, false);
    const task3 = new Task(page, 0, false);

    await page.goto('/time-tracker');
    await task1.create();
    await task2.create();
    await task3.create();
    await task2.delete();

    await expect(page.locator("div.card-header")).toHaveCount(2);
    await expect(page.locator("div.card-header").nth(0)).toContainText(task1.name);
    await expect(page.locator("div.card-header").nth(1)).toContainText(task3.name);
});