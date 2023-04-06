package edu.brown.cs32.student.server.filter;

import edu.brown.cs32.student.server.GeneralResponse;
import edu.brown.cs32.student.server.MissingArgException;
import edu.brown.cs32.student.server.utils.Data;
import edu.brown.cs32.student.server.utils.Data.FilterRequest;
import edu.brown.cs32.student.server.utils.JsonReader;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;
import spark.utils.StringUtils;

/**
 * Handler class for the filtering redlining map data.
 *
 * <p>This endpoint is similar to the endpoint(s) you'll need to create for Sprint 2. It takes a
 * basic GET request with no Json body, and returns a Json object in reply. The responses are more
 * complex, but this should serve as a reference.
 */
public class FilterHandler implements Route {
    private Data.GeoData geoData;

    private final String PATH = "data/fullDownload.json";
    private GeoFilter converter;

    public FilterHandler() {
        try {
            this.geoData = JsonReader.readFromFileToGeo(PATH);
            this.converter = new CachedFilterRequestConverter(new FilterRequestConverter(geoData), 10, 60);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * filter
     *
     * @param request the request to handle
     * @param response use to modify properties of the response
     * @return response content
     * @throws Exception This is part of the interface; we don't have to throw anything.
     */
    @Override
    public Object handle(Request request, Response response) throws Exception {
//        String minLatStr = request.queryParams("minLat");
//        String maxLatStr = request.queryParams("maxLat");
//        String minLonStr = request.queryParams("minLon");
//        String maxLonStr = request.queryParams("maxLon");
        String filter = request.queryParams("filter");
        Map<String, Object> result = new HashMap<>();
        try {

            // check if params are given
            if (StringUtils.isBlank(filter)) throw new MissingArgException(List.of("filter"));
            FilterRequest filterRequest = JsonReader.readFilterFromString(filter);
//            List<String> missingArgs = new ArrayList<>();
//            if (StringUtils.isBlank(minLatStr)) missingArgs.add("minLat");
//            if (StringUtils.isBlank(maxLatStr)) missingArgs.add("maxLat");
//            if (StringUtils.isBlank(minLonStr)) missingArgs.add("minLon");
//            if (StringUtils.isBlank(maxLonStr)) missingArgs.add("maxLon");
//            if (!missingArgs.isEmpty()) throw new MissingArgException(missingArgs);
//
//            // convert points to double
//            double minLat = Double.parseDouble(minLatStr);
//            double maxLat = Double.parseDouble(maxLatStr);
//            double minLon = Double.parseDouble(minLonStr);
//            double maxLon = Double.parseDouble(maxLonStr);
//
//            // check -90 to 90 for latitude and -180 to 180 for longitude
//            if (minLat < -90 || minLat > 90) {
//                result.put("result", "error_bad_request");
//                result.put("data", "get minLat=" + minLatStr + ", but minLat should fall in range [-90, 90]");
//                return new GeneralResponse(result).serialize();
//            }
//            if (maxLat < -90 || maxLat > 90) {
//                result.put("result", "error_bad_request");
//                result.put("data", "get maxLat=" + maxLatStr + ", but maxLat should fall in range [-90, 90]");
//                return new GeneralResponse(result).serialize();
//            }
//            if (minLon < -180 || minLon > 180) {
//                result.put("result", "error_bad_request");
//                result.put("data", "get minLon=" + minLonStr + ", but minLon should fall in range [-180, 180]");
//                return new GeneralResponse(result).serialize();
//            }
//            if (maxLon < -180 || maxLon > 180) {
//                result.put("result", "error_bad_request");
//                result.put("data", "get maxLon=" + minLatStr + ", but maxLon should fall in range [-180, 180]");
//                return new GeneralResponse(result).serialize();
//            }
//
//            // check minLat <= maxLat and minLon <= maxLon
//            if (minLat > maxLat) {
//                result.put("result", "error_bad_request");
//                result.put("data", "get minLat=" + minLatStr + ", maxLat=" + maxLatStr + ", but minLat should <= maxLat");
//                return new GeneralResponse(result).serialize();
//            }
//            if (minLon > maxLon) {
//                result.put("result", "error_bad_request");
//                result.put("data", "get minLon=" + minLonStr + ", maxLon=" + maxLonStr + ", but minLon should <= maxLon");
//                return new GeneralResponse(result).serialize();
//            }

            Data.GeoData filteredResult = converter.convertFilterRequest(filterRequest);
            result.put("result", "success");
            result.put("data", filteredResult);
            return new GeneralResponse(result).serialize();
        } catch (MissingArgException e) {
            result.put("result", "error_bad_request");
            result.put("data", e.getMessage());
//        } catch (NumberFormatException e) {
//            result.put("result", "error_bad_request");
//            result.put("data", "minLat=" + minLatStr + ", maxLat=" + maxLatStr + ", minLon=" + minLonStr + ", maxLon=" + maxLonStr  + " cannot be converted to numbers");
        } catch (IllegalArgumentException e) {
            result.put("result", "error_bad_request");
            result.put("data", e.getMessage());
        } catch (Throwable e) {
            result.put("result", "error_bad_request");
            result.put("data", e.getMessage());
        }
        return new GeneralResponse(result).serialize();
    }
}
