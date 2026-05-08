package com.smartcity.messaging;

import com.smartcity.config.RabbitMQConfig;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class IncidentEventConsumer {

    /**
     * Listens on the incident.created.queue for new incident events.
     * This could trigger notifications, analytics, or logging pipelines.
     */
    @RabbitListener(queues = RabbitMQConfig.INCIDENT_QUEUE)
    public void handleIncidentCreated(Map<String, Object> event) {
        System.out.println("[MOM Consumer] Received incident event:");
        System.out.println("  ID:       " + event.get("incidentId"));
        System.out.println("  Title:    " + event.get("title"));
        System.out.println("  Urgency:  " + event.get("urgencyScore") + "%");
        System.out.println("  Location: " + event.get("location"));
        System.out.println("  Status:   " + event.get("status"));

        // Future enhancements: send SMS/email alerts, update analytics dashboard, trigger workflows
        if (event.get("urgencyScore") instanceof Integer score && score >= 90) {
            System.out.println("[MOM Consumer] ⚠️ CRITICAL URGENCY - Alert dispatched for: " + event.get("title"));
        }
    }
}
