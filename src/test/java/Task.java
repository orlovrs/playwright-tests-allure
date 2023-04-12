import io.qameta.allure.Step;
import org.apache.commons.lang3.RandomStringUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

import java.text.Format;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.Date;

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
            Date dt = new Date();
            this.date = LocalDateTime.from(dt.toInstant()).plusDays(offset);
        }
    }

    public String forPicker() {
        if (this.date == null) return "";

        Format formatter = new SimpleDateFormat("dd.MM.yyyy");
        return formatter.format(this.date);
    }

    public String forCard() {
        if (this.date == null) return "";

        Format formatter = new SimpleDateFormat("yyyy-MM-dd");
        return formatter.format(this.date);
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
