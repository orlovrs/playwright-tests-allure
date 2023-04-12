import io.github.bonigarcia.wdm.WebDriverManager;
import io.qameta.allure.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@Epic("Tasks")
@Feature("Apperance")
@Story("User sees 2 sections on the page")
public class ApperanceTest {
    private WebDriver driver;
    private Site site;

    @BeforeEach
    void setup() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        options.addArguments("--headless");
        driver = new ChromeDriver(options);
        site = new Site(driver);
        site.open();
    }

    @AfterEach
    void teardown() {
        driver.quit();
    }

    @Test
    @DisplayName("There are two headers on the page")
    void headersTest() {
        headerContainsText(0, "Task planner");
        headerContainsText(1, "Your Tasks");
    }

    @Step("Verify there is '{text}' header")
    private void headerContainsText(int index, String text) {
        List<WebElement> headers = driver.findElements(By.tagName("h1"));
        assertEquals(text, headers.get(index).getText());
    }
}