import io.qameta.allure.Step;
import org.openqa.selenium.WebDriver;

public class Site {
    private final WebDriver driver;
    private final String url = "https://orlovrs.github.io/time-tracker";

    public Site(WebDriver driver) {
        this.driver = driver;
    }

    @Step("Visit the site")
    public void open() {
        driver.get(url);
    }
}
