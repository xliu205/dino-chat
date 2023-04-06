package edu.brown.cs32.student.server.utils;

import com.squareup.moshi.Moshi;
import com.squareup.moshi.Types;

import java.io.IOException;
import java.lang.reflect.Type;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Map;

/** Read arbitrary json strings */
public class JsonReader {
  /**
   * Read in a json string and output a map
   *
   * @param jsonString
   * @return
   * @throws IOException
   */
  public static Map<String, Object> readFromString(String jsonString) throws IOException {
    Moshi moshi = new Moshi.Builder().build();
    Type type = Types.newParameterizedType(Map.class, String.class, Object.class);
    Map<String, Object> ret = (Map<String, Object>) moshi.adapter(type).fromJson(jsonString);
    return ret;
  }

  public static Map<String, Object> readFromFile(String path) throws IOException {
    String jsonString = new String(Files.readAllBytes(Paths.get(path)));
    return readFromString(jsonString);
  }

  public static Data.GeoData readFromFileToGeo(String path) throws IOException {
    String jsonString = new String(Files.readAllBytes(Paths.get(path)));
    Moshi moshi = new Moshi.Builder().build();
    Data.GeoData data = moshi.adapter(Data.GeoData.class).fromJson(jsonString);
    return data;
  }

  public static Data.Note readNoteFromString(String jsonString) throws IOException {
    Moshi moshi = new Moshi.Builder().build();
    Data.Note data = moshi.adapter(Data.Note.class).fromJson(jsonString);
    return data;
  }

  public static Data.FilterRequest readFilterFromString(String jsonString) throws Throwable {
    Moshi moshi = new Moshi.Builder().build();
    try {
      return moshi.adapter(Data.FilterRequest.class).fromJson(jsonString);
    } catch (AssertionError ae) {
      throw ae.getCause();
    }
  }
}
