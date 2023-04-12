import io.qameta.allure.Step;
import org.apache.commons.lang3.RandomStringUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

import java.time.LocalDateTime;

public class Task {
    WebDriver driver;

    LocalDateTime date;
    boolean isEmpty;
    String name;
    int estimation;

    public Task(WebDriver driver, int offset, boolean isEmpty) {
        this.driver = driver;
        this.name = "Task_" + RandomStringUtils.randomAlphanumeric(10);
        this.estimation = 11;
        this.isEmpty = isEmpty;

        if (!this.isEmpty) {
            this.date = LocalDateTime.now().plusDays(offset);
        }
    }

    public String forPicker() {
        if (this.date == null) return "";
        return String.format("%s.%s.%s",
                date.getDayOfMonth() < 10 ? "0" + date.getDayOfMonth() : date.getDayOfMonth(),
                date.getMonth().ordinal() < 9 ? "0" + (date.getMonth().ordinal() + 1) : (date.getMonth().ordinal() + 1),
                date.getYear()
        );
    }

    public String forCard() {
        if (date == null) return "";
        return String.format("%s-%s-%s",
                date.getYear(),
                date.getMonth().ordinal() < 9 ? "0" + (date.getMonth().ordinal() + 1) : (date.getMonth().ordinal() + 1),
                date.getDayOfMonth() < 10 ? "0" + date.getDayOfMonth() : date.getDayOfMonth()
        );
    }

    @Step("Creating a task")
    public void create() {
        this.driver.findElement(By.id("taskName")).sendKeys(name);
        this.driver.findElement(By.id("plannedDate")).sendKeys(forPicker());
        this.driver.findElement(By.id("estimation")).sendKeys(String.valueOf(estimation));
        this.driver.findElement(By.xpath("//button[text()='Create Task']")).click();
    }

    @Step("Deleting a task")
    public void delete() {
        String xpath = String.format(
                "//div[contains(text(),'%s')]//..//button[@class='btn btn-danger']",
                name
        );
        this.driver.findElement(By.xpath(xpath)).click();
    }
}
