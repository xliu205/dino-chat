package edu.brown.cs32.student.server.filter;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;

import edu.brown.cs32.student.server.utils.Data;
import java.util.concurrent.TimeUnit;


public class CachedFilterRequestConverter implements GeoFilter{
    private final FilterRequestConverter wrappedConverter;

    private final LoadingCache<Data.FilterRequest, Data.GeoData> cache;

    /**
     * Cache getter
     *
     * @return local cache
     */
    public LoadingCache<Data.FilterRequest, Data.GeoData> getCache() {
        return cache;
    }
    /**
     * Constructor
     *
     * @param wrappedConverter
     * @param cacheSize
     * @param cacheTime
     */
    public CachedFilterRequestConverter(
            FilterRequestConverter wrappedConverter, int cacheSize, int cacheTime) {
        this.wrappedConverter = wrappedConverter;
        this.cache =
                CacheBuilder.newBuilder()
                        // How many entries maximum in the cache?
                        .maximumSize(cacheSize)
                        // How long should entries remain in the cache?
                        .expireAfterWrite(cacheTime, TimeUnit.MINUTES)
                        // Keep statistical info around for profiling purposes
                        .recordStats()
                        .build(
                                new CacheLoader<Data.FilterRequest, Data.GeoData>() {
                                    @Override
                                    public Data.GeoData load(Data.FilterRequest key) {
                                        // If this isn't yet present in the cache, load it:
                                        return wrappedConverter.convertFilterRequest(key);
                                    }
                                });
    }

    /**
     * Find box in the cache and get the geoData, if not found, load into the cache
     *
     * @param request
     * @return geoData
     * @throws Exception
     */
    @Override
    public Data.GeoData convertFilterRequest(Data.FilterRequest request){
//        Data.GeoData result = null;
//        boolean hit = false;
//        Double minLat = request.minLat(), maxLat = request.maxLat(), minLon = request.minLon(), maxLon = request.maxLon();
//        for (Data.FilterRequest key : cache.asMap().keySet()) {
//            Double cachedMinLat = key.minLat(), cachedMaxLat = key.maxLat(), cachedMinLon = key.minLon(), cachedMaxLon = key.maxLon();
//            if (0 <= cachedMinLat - minLat && cachedMinLat - minLat <= 0.01
//                    && 0 <= maxLat - cachedMaxLat && maxLat - cachedMaxLat <= 0.01
//                    && 0 <= cachedMinLon - minLon && cachedMinLon - minLon <= 0.01
//                    && 0 <= maxLon - cachedMaxLon && maxLon - cachedMaxLon <= 0.01) {
//                hit = true;
//                result = cache.getUnchecked(key);
//                // System.out.println("Cache Hit!");
//                break;
//            }
//        }
        Data.GeoData result = cache.getUnchecked(request);
         System.out.println(cache.stats());
        return result;
    }
}
