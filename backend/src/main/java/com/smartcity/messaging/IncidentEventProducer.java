package com.smartcity.messaging;

import com.smartcity.config.RabbitMQConfig;
import com.smartcity.model.Incident;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class IncidentEventProducer {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void publishIncidentCreated(Incident incident) {
        Map<String, Object> event = new HashMap<>();
        event.put("incidentId", incident.getId());
        event.put("title", incident.getTitle());
        event.put("urgencyScore", incident.getUrgencyScore());
        event.put("location", incident.getLocation());
        event.put("status", incident.getStatus());
        event.put("timestamp", System.currentTimeMillis());

        System.out.println("[MOM] Publishing incident event to RabbitMQ: " + incident.getTitle());
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.EXCHANGE,
            RabbitMQConfig.ROUTING_KEY,
            event
        );
    }
}
