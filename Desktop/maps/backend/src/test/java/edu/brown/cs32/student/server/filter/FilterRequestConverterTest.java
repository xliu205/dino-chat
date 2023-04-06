package edu.brown.cs32.student.server.filter;

import edu.brown.cs32.student.server.utils.Data;
import edu.brown.cs32.student.server.utils.JsonReader;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class FilterRequestConverterTest {
    public static Data.GeoData map;
    public static FilterRequestConverter converter;
    @BeforeAll
    public static void setup_before_everything() throws Exception{
        map = JsonReader.readFromFileToGeo("data/fullDownload.json");
        converter = new FilterRequestConverter(map);
    }

    @Test
    void convertFilterRequest() throws Exception{
        Data.FilterRequest request = new Data.FilterRequest(40.0, 42.0, -72.0, -70.0);
        Data.GeoData filteredData = converter.convertFilterRequest(request);
        List<Data.GeoFeature> featureList = filteredData.features();
        assertEquals(44, featureList.size());
    }
}