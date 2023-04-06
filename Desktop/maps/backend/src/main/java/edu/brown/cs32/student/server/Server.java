package edu.brown.cs32.student.server;

import static spark.Spark.after;

import edu.brown.cs32.student.server.filter.FilterHandler;
import edu.brown.cs32.student.server.loadcsv.LoadCSVHandler;
import edu.brown.cs32.student.server.note.NoteHandler;
import edu.brown.cs32.student.server.searchcsv.SearchCSVHandler;
import edu.brown.cs32.student.server.viewcsv.ViewCSVHandler;
import edu.brown.cs32.student.server.weather.WeatherHandler;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import spark.Spark;

/**
 * Top-level class for this demo. Contains the main() method which starts Spark and runs the various
 * handlers.
 *
 * <p>We have two endpoints in this demo. They need to share state (a menu). This is a great chance
 * to use dependency injection, as we do here with the menu set. If we needed more endpoints, more
 * functionality classes, etc. we could make sure they all had the same shared state.
 */
public class Server {
  public static void main(String[] args) {
    List<List<String>> csvData = new ArrayList<>();
    List<String> csvHeader = new ArrayList<>();
    Map<String, Object> geoData = new HashMap<>();

    Spark.port(3232);
    after(
        (request, response) -> {
          response.header("Access-Control-Allow-Origin", "*");
          response.header("Access-Control-Allow-Methods", "*");
        });

    // Setting up the handler for the GET /order endpoint
    Spark.get("loadcsv", new LoadCSVHandler(csvData, csvHeader));
    Spark.get("viewcsv", new ViewCSVHandler(csvData, csvHeader));
    Spark.get("searchcsv", new SearchCSVHandler(csvData, csvHeader));
    Spark.get("weather", new WeatherHandler());
    Spark.get("filter", new FilterHandler());
    Spark.get("note", new NoteHandler());
    Spark.init();
    Spark.awaitInitialization();
    System.out.println("Server started on localhost:3232.");
  }
}
