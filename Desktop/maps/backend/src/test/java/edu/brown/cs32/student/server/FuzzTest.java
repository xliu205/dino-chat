package edu.brown.cs32.student.server;

import static org.junit.jupiter.api.Assertions.assertTrue;

import edu.brown.cs32.student.server.loadcsv.LoadCSVHandler;
import edu.brown.cs32.student.server.searchcsv.SearchCSVHandler;
import edu.brown.cs32.student.server.viewcsv.ViewCSVHandler;
import edu.brown.cs32.student.server.weather.WeatherHandler;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.testng.annotations.BeforeClass;
import spark.Spark;

public class FuzzTest {
  private final int testTime = 1000;
  private final Random random = new Random();
  List<List<String>> csvData;
  List<String> csvHeader;

  public String generateRandomString(int length) {
    StringBuilder sb = new StringBuilder(length);
    for (int i = 0; i < length; i++) {
      char c = (char) (random.nextInt(95) + 32);
      if (c == ' ') continue;
      if (c == ' ') continue;
      sb.append(c);
    }
    return sb.toString();
  }

  public String generateRandomDouble(int start, int end) {
    double random = new Random().nextDouble();
    double result = start + (random * (end - start));
    return String.valueOf(result);
  }

  @BeforeClass
  public static void setup_before_everything() {
    Spark.port(0);
    Logger.getLogger("").setLevel(Level.WARNING);
  }

  @BeforeEach
  void setUp() {
    csvData = new ArrayList<>();
    csvHeader = new ArrayList<>();
    Spark.get("/weather", new WeatherHandler());
    Spark.get("/loadcsv", new LoadCSVHandler(csvData, csvHeader));
    Spark.get("/viewcsv", new ViewCSVHandler(csvData, csvHeader));
    Spark.get("/searchcsv", new SearchCSVHandler(csvData, csvHeader));
    Spark.init();
    Spark.awaitInitialization(); // don't continue until the server is listening
  }

  @AfterEach
  public void teardown() {
    // Gracefully stop Spark listening on both endpoints
    Spark.unmap("/viewcsv");
    Spark.unmap("/loadcsv");
    Spark.unmap("/search");
    Spark.unmap("/weather");
    Spark.awaitStop(); // don't proceed until the server is stopped
  }

  private static HttpURLConnection tryRequest(String apiCall) throws IOException {
    URL requestURL = new URL("http://localhost:" + Spark.port() + "/" + apiCall);
    HttpURLConnection clientConnection = (HttpURLConnection) requestURL.openConnection();
    clientConnection.connect();
    return clientConnection;
  }

  @Test
  public void PathTest() throws IOException {
    for (int i = 0; i < testTime; i++) {
      String path = generateRandomString(10);
      HttpURLConnection clientConnection = tryRequest(path);
      int code = clientConnection.getResponseCode();
      if (code != 404 && code != 400) {
        assertTrue(false);
      }
      clientConnection.disconnect();
    }
  }

  @Test
  public void ParamTest1() throws IOException {
    for (int i = 0; i < testTime; i++) {
      String path = generateRandomString(10);
      HttpURLConnection clientConnection = tryRequest("loadcsv?" + path);
      int code = clientConnection.getResponseCode();
      if (code != 200 && code != 400 && code != 500) {
        assertTrue(false);
      }
      clientConnection.disconnect();
    }
  }

  @Test
  public void ParamTest2() throws IOException {
    for (int i = 0; i < testTime; i++) {
      String path = generateRandomString(10);
      HttpURLConnection clientConnection = tryRequest("viewcsv?" + path);
      int code = clientConnection.getResponseCode();
      //      System.out.println(code);
      //      System.out.println(path);
      if (code != 200 && code != 400 && code != 500) {
        assertTrue(false);
      }

      clientConnection.disconnect();
    }
  }

  @Test
  public void ParamTest3() throws IOException {
    for (int i = 0; i < testTime; i++) {
      String path = generateRandomString(10);
      HttpURLConnection clientConnection = tryRequest("searchcsv?" + path);
      int code = clientConnection.getResponseCode();
      if (code != 200 && code != 400 && code != 500) {
        assertTrue(false);
      }
      clientConnection.disconnect();
    }
  }

  @Test
  public void weatherFuzzFailureTest() throws IOException {
    for (int i = 0; i < testTime; i++) {
      String path = generateRandomString(10);
      HttpURLConnection clientConnection = tryRequest("weather?" + path);
      int code = clientConnection.getResponseCode();
      // Will lead to 500 error when path contains %
      assertTrue(200 == code || 500 == code);
      clientConnection.disconnect();
    }
  }

  @Test
  public void weatherFuzzSuccessTest() throws IOException {
    for (int i = 0; i < 10; i++) {
      String query =
          "lat=" + generateRandomDouble(-180, 180) + "&lon=" + generateRandomDouble(-180, 180);
      HttpURLConnection clientConnection = tryRequest("weather?" + query);

      int code = clientConnection.getResponseCode();
      assertTrue(code == 200);
      clientConnection.disconnect();
    }
  }
}

// useless comment for testing continuous integration
