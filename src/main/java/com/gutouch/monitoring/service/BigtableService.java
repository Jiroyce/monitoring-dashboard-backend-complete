package com.gutouch.monitoring.service;

import com.google.api.gax.rpc.ServerStream;
import com.google.cloud.bigtable.data.v2.BigtableDataClient;
import com.google.cloud.bigtable.data.v2.models.Query;
import com.google.cloud.bigtable.data.v2.models.Row;
import com.google.cloud.bigtable.data.v2.models.RowCell;
import com.google.protobuf.ByteString;
import com.gutouch.monitoring.dto.LogEntry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@Slf4j
@RequiredArgsConstructor
public class BigtableService {

    private final BigtableDataClient bigtableClient;

    @Value("${bigtable.tables.metrics}")
    private String metricsTable;

    @Value("${bigtable.tables.logs}")
    private String logsTable;

    @Value("${bigtable.tables.processing}")
    private String processingTable;

    @Value("${bigtable.column-families.metrics}")
    private String metricsCF;

    @Value("${bigtable.column-families.logs}")
    private String logsCF;

    @Value("${bigtable.column-families.processing-log}")
    private String processingLogCF;

    @Value("${bigtable.column-families.processing-message}")
    private String processingMessageCF;

    /**
     * Récupérer les métriques agrégées d'un connector
     */
    @Cacheable(value = "connectorMetrics", key = "#connector + '_' + #startTime + '_' + #endTime")
    public List<Map<String, String>> getConnectorMetrics(String connector, Instant startTime, Instant endTime) {
        log.info("Fetching metrics for connector: {} from {} to {}", connector, startTime, endTime);
        
        List<Map<String, String>> metrics = new ArrayList<>();
        
        try {
            // Construire la query avec regex pour filtrer par connector
            String regex = String.format(".*#metrics#%s#.*", connector);
            Query query = Query.create(metricsTable)
                    .filter(com.google.cloud.bigtable.data.v2.models.Filters.FILTERS
                            .key()
                            .regex(regex))
                    .limit(10000);

            ServerStream<Row> rows = bigtableClient.readRows(query);
            
            for (Row row : rows) {
                Map<String, String> metricMap = rowToMap(row, metricsCF);
                
                // Filtrer par timestamp si nécessaire
                String timestampStr = metricMap.get("window_timestamp");
                if (timestampStr != null) {
                    long timestamp = Long.parseLong(timestampStr);
                    Instant metricTime = Instant.ofEpochMilli(timestamp);
                    
                    if (metricTime.isAfter(startTime) && metricTime.isBefore(endTime)) {
                        metrics.add(metricMap);
                    }
                }
            }
            
            log.info("Retrieved {} metrics for {}", metrics.size(), connector);
        } catch (Exception e) {
            log.error("Error fetching metrics for connector: {}", connector, e);
        }
        
        return metrics;
    }

    /**
     * Récupérer tous les logs bruts avec filtres
     */
    public List<LogEntry> searchLogs(String connector, String type, Instant startTime, Instant endTime, int limit) {
        log.info("Searching logs: connector={}, type={}, from={}, to={}, limit={}", 
                connector, type, startTime, endTime, limit);
        
        List<LogEntry> logs = new ArrayList<>();
        
        try {
            // Construire le range de timestamps
            long startTimestamp = startTime.toEpochMilli();
            long endTimestamp = endTime.toEpochMilli();
            
            String startKey = String.format("%013d", startTimestamp);
            String endKey = String.format("%013d", endTimestamp);
            
            // Construire la query
            Query query = Query.create(logsTable)
                    .range(startKey, endKey)
                    .limit(limit * 2); // *2 car on va filtrer après

            ServerStream<Row> rows = bigtableClient.readRows(query);
            
            for (Row row : rows) {
                LogEntry logEntry = rowToLogEntry(row);
                
                // Appliquer les filtres
                boolean matches = true;
                
                if (connector != null && !connector.equals("all") && !connector.equals(logEntry.getConnector())) {
                    matches = false;
                }
                
                if (type != null && !type.equals("all") && !type.equals(logEntry.getType())) {
                    matches = false;
                }
                
                if (matches) {
                    logs.add(logEntry);
                    if (logs.size() >= limit) {
                        break;
                    }
                }
            }
            
            log.info("Retrieved {} logs", logs.size());
        } catch (Exception e) {
            log.error("Error searching logs", e);
        }
        
        return logs;
    }

    /**
     * Récupérer les logs d'erreur
     */
    @Cacheable(value = "errorLogs", key = "#connector + '_' + #limit")
    public List<LogEntry> getErrorLogs(String connector, int limit) {
        log.info("Fetching error logs for connector: {}, limit: {}", connector, limit);
        
        List<LogEntry> errorLogs = new ArrayList<>();
        
        try {
            // Récupérer les derniers logs
            Query query = Query.create(logsTable)
                    .limit(limit * 10); // *10 car on filtre sur success=false

            ServerStream<Row> rows = bigtableClient.readRows(query);
            
            for (Row row : rows) {
                LogEntry logEntry = rowToLogEntry(row);
                
                // Filtrer sur les erreurs
                if (Boolean.FALSE.equals(logEntry.getSuccess())) {
                    if (connector == null || connector.equals("all") || connector.equals(logEntry.getConnector())) {
                        errorLogs.add(logEntry);
                        if (errorLogs.size() >= limit) {
                            break;
                        }
                    }
                }
            }
            
            log.info("Retrieved {} error logs", errorLogs.size());
        } catch (Exception e) {
            log.error("Error fetching error logs", e);
        }
        
        return errorLogs;
    }

    /**
     * Récupérer un log par son ID
     */
    public Map<String, String> getLogById(String logId) {
        log.info("Fetching log by ID: {}", logId);
        
        try {
            Row row = bigtableClient.readRow(logsTable, logId);
            if (row != null) {
                return rowToMap(row, logsCF);
            }
        } catch (Exception e) {
            log.error("Error fetching log by ID: {}", logId, e);
        }
        
        return null;
    }

    /**
     * Tracer une transaction par messageId
     */
    public List<Map<String, String>> traceByMessageId(String messageId) {
        log.info("Tracing transaction by messageId: {}", messageId);
        
        List<Map<String, String>> trace = new ArrayList<>();
        
        try {
            // Chercher dans la table processing
            Query query = Query.create(processingTable)
                    .limit(1000);

            ServerStream<Row> rows = bigtableClient.readRows(query);
            
            for (Row row : rows) {
                Map<String, String> logMap = new HashMap<>();
                
                // Lire les deux column families
                for (RowCell cell : row.getCells(processingLogCF)) {
                    String column = cell.getQualifier().toStringUtf8();
                    String value = cell.getValue().toStringUtf8();
                    logMap.put(column, value);
                }
                
                for (RowCell cell : row.getCells(processingMessageCF)) {
                    String column = cell.getQualifier().toStringUtf8();
                    String value = cell.getValue().toStringUtf8();
                    logMap.put("message_" + column, value);
                }
                
                // Filtrer par messageId
                if (messageId.equals(logMap.get("messageId"))) {
                    trace.add(logMap);
                }
            }
            
            // Trier par timestamp
            trace.sort(Comparator.comparing(m -> m.get("timestamp")));
            
            log.info("Retrieved {} steps for messageId: {}", trace.size(), messageId);
        } catch (Exception e) {
            log.error("Error tracing by messageId: {}", messageId, e);
        }
        
        return trace;
    }

    /**
     * Tracer une transaction par endToEndId
     */
    public List<Map<String, String>> traceByEndToEndId(String endToEndId) {
        log.info("Tracing transaction by endToEndId: {}", endToEndId);
        
        List<Map<String, String>> trace = new ArrayList<>();
        
        try {
            // Chercher dans la table processing avec regex sur la row key
            String regex = String.format(".*#%s#.*", endToEndId);
            Query query = Query.create(processingTable)
                    .filter(com.google.cloud.bigtable.data.v2.models.Filters.FILTERS
                            .key()
                            .regex(regex))
                    .limit(1000);

            ServerStream<Row> rows = bigtableClient.readRows(query);
            
            for (Row row : rows) {
                Map<String, String> logMap = new HashMap<>();
                
                // Lire les deux column families
                for (RowCell cell : row.getCells(processingLogCF)) {
                    String column = cell.getQualifier().toStringUtf8();
                    String value = cell.getValue().toStringUtf8();
                    logMap.put(column, value);
                }
                
                for (RowCell cell : row.getCells(processingMessageCF)) {
                    String column = cell.getQualifier().toStringUtf8();
                    String value = cell.getValue().toStringUtf8();
                    logMap.put("message_" + column, value);
                }
                
                trace.add(logMap);
            }
            
            // Chercher aussi dans la table logs
            List<LogEntry> relatedLogs = searchLogsWithFilter(endToEndId, "endToEndId");
            for (LogEntry log : relatedLogs) {
                Map<String, String> logMap = new HashMap<>();
                logMap.put("timestamp", log.getTimestamp().toString());
                logMap.put("type", log.getType());
                logMap.put("service", log.getConnector());
                logMap.put("method", log.getMethod());
                logMap.put("path", log.getPath());
                logMap.put("status", String.valueOf(log.getStatusCode()));
                logMap.put("duration_ms", String.valueOf(log.getResponseTimeMs()));
                logMap.put("endToEndId", endToEndId);
                trace.add(logMap);
            }
            
            // Trier par timestamp
            trace.sort(Comparator.comparing(m -> m.get("timestamp")));
            
            log.info("Retrieved {} steps for endToEndId: {}", trace.size(), endToEndId);
        } catch (Exception e) {
            log.error("Error tracing by endToEndId: {}", endToEndId, e);
        }
        
        return trace;
    }

    /**
     * Rechercher des logs avec un filtre spécifique
     */
    private List<LogEntry> searchLogsWithFilter(String value, String field) {
        List<LogEntry> logs = new ArrayList<>();
        
        try {
            Query query = Query.create(logsTable)
                    .limit(1000);

            ServerStream<Row> rows = bigtableClient.readRows(query);
            
            for (Row row : rows) {
                LogEntry logEntry = rowToLogEntry(row);
                
                // Appliquer le filtre selon le field
                boolean matches = false;
                switch (field) {
                    case "endToEndId":
                        matches = value.equals(logEntry.getEndToEndId());
                        break;
                    case "messageId":
                        matches = value.equals(logEntry.getMessageId());
                        break;
                }
                
                if (matches) {
                    logs.add(logEntry);
                }
            }
        } catch (Exception e) {
            log.error("Error searching logs with filter: {}={}", field, value, e);
        }
        
        return logs;
    }

    /**
     * Convertir une Row BigTable en Map
     */
    private Map<String, String> rowToMap(Row row, String columnFamily) {
        Map<String, String> map = new HashMap<>();
        map.put("row_key", row.getKey().toStringUtf8());
        
        for (RowCell cell : row.getCells(columnFamily)) {
            String column = cell.getQualifier().toStringUtf8();
            String value = cell.getValue().toStringUtf8();
            map.put(column, value);
        }
        
        return map;
    }

    /**
     * Convertir une Row BigTable en LogEntry
     */
    private LogEntry rowToLogEntry(Row row) {
        Map<String, String> data = rowToMap(row, logsCF);
        
        // Parser la row key : timestamp#type#connector#uuid
        String rowKey = row.getKey().toStringUtf8();
        String[] keyParts = rowKey.split("#");
        
        return LogEntry.builder()
                .id(rowKey)
                .timestamp(Instant.ofEpochMilli(Long.parseLong(keyParts[0])))
                .type(keyParts.length > 1 ? keyParts[1] : data.get("type"))
                .connector(keyParts.length > 2 ? keyParts[2] : data.get("connector"))
                .method(data.get("method"))
                .path(data.get("path"))
                .statusCode(parseInteger(data.get("status_code")))
                .success(parseBoolean(data.get("success")))
                .responseTimeMs(parseDouble(data.get("response_time_ms")))
                .clientIp(data.get("client_ip"))
                .timeout(parseBoolean(data.get("timeout")))
                .serviceStatus(data.get("service_status"))
                .error(data.get("error"))
                .messageId(data.get("messageId"))
                .endToEndId(data.get("endToEndId"))
                .build();
    }

    /**
     * Helper methods pour parser les valeurs
     */
    private Integer parseInteger(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Double parseDouble(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Boolean parseBoolean(String value) {
        if (value == null || value.isEmpty()) return null;
        return Boolean.parseBoolean(value);
    }
}
