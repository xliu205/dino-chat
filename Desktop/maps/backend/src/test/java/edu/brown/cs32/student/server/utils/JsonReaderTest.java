package edu.brown.cs32.student.server.utils;

import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayList;
import java.util.Map;
import org.junit.jupiter.api.Test;

class JsonReaderTest {
  String jsonString1 =
      "{\"name\":\"John Doe\",\"age\":30,\"address\":{\"city\":\"New York\",\"state\":\"NY\"}}";
  String jsonString2 = "{\"name\":\"John Doe\",\"age\":30}";
  /**
   * Test fields after a reading a nested json string
   *
   * @throws Exception
   */
  @Test
  void testReadNested() throws Exception {
    Map<String, Object> map = JsonReader.readFromString(jsonString1);

    assertEquals("John Doe", map.get("name"));
    assertEquals(30.0, map.get("age"));

    Map<String, Object> addressMap = (Map<String, Object>) map.get("address");
    assertEquals("New York", addressMap.get("city"));
    assertEquals("NY", addressMap.get("state"));
  }

  /**
   * Test reading non-exist field of the map
   *
   * @throws Exception
   */
  @Test
  void testReadNonExist() throws Exception {
    Map<String, Object> map = JsonReader.readFromString(jsonString2);
    Map<String, Object> addressMap = (Map<String, Object>) map.get("address");
    assertEquals(null, addressMap);
  }

  /**
   * Test reading from file
   *
   * @throws Exception
   */
  @Test
  void testReadFromFile() throws Exception {
    Map<String, Object> map = JsonReader.readFromFile("data/fullDownload.json");
    ArrayList<Map<String, Object>> featureList = (ArrayList<Map<String, Object>>) map.get("features");
    assertEquals(8878, featureList.size());
  }
}
