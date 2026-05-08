package com.smartcity.soap;

import com.smartcity.model.Incident;
import com.smartcity.service.IncidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import javax.xml.parsers.DocumentBuilderFactory;
import java.util.List;

@Endpoint
public class IncidentEndpoint {

    private static final String NAMESPACE_URI = "http://smartcity.com/soap";

    @Autowired
    private IncidentService incidentService;

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "GetIncidentRequest")
    @ResponsePayload
    public Element getIncident(@RequestPayload Element request) throws Exception {
        String idStr = request.getElementsByTagNameNS(NAMESPACE_URI, "id").item(0).getTextContent();
        long id = Long.parseLong(idStr);
        Incident incident = incidentService.getIncidentById(id);

        Document doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().newDocument();
        Element response = doc.createElementNS(NAMESPACE_URI, "GetIncidentResponse");
        doc.appendChild(response);

        if (incident != null) {
            Element incEl = doc.createElementNS(NAMESPACE_URI, "incident");
            addChild(doc, incEl, "id", String.valueOf(incident.getId()));
            addChild(doc, incEl, "title", incident.getTitle());
            addChild(doc, incEl, "description", incident.getDescription());
            addChild(doc, incEl, "location", incident.getLocation());
            addChild(doc, incEl, "status", incident.getStatus());
            addChild(doc, incEl, "urgencyScore", String.valueOf(incident.getUrgencyScore()));
            addChild(doc, incEl, "type", incident.getType());
            response.appendChild(incEl);
        }
        return response;
    }

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "GetAllIncidentsRequest")
    @ResponsePayload
    public Element getAllIncidents(@RequestPayload Element request) throws Exception {
        Element pageEl = (Element) request.getElementsByTagNameNS(NAMESPACE_URI, "page").item(0);
        Element sizeEl = (Element) request.getElementsByTagNameNS(NAMESPACE_URI, "size").item(0);
        int page = pageEl != null ? Integer.parseInt(pageEl.getTextContent()) : 0;
        int size = sizeEl != null ? Integer.parseInt(sizeEl.getTextContent()) : 10;

        List<Incident> incidents = incidentService.getAllIncidents(PageRequest.of(page, size)).getContent();
        long total = incidentService.getTotalCount();

        Document doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().newDocument();
        Element response = doc.createElementNS(NAMESPACE_URI, "GetAllIncidentsResponse");
        doc.appendChild(response);

        for (Incident inc : incidents) {
            Element incEl = doc.createElementNS(NAMESPACE_URI, "incidents");
            addChild(doc, incEl, "id", String.valueOf(inc.getId()));
            addChild(doc, incEl, "title", inc.getTitle());
            addChild(doc, incEl, "description", inc.getDescription());
            addChild(doc, incEl, "location", inc.getLocation());
            addChild(doc, incEl, "status", inc.getStatus());
            addChild(doc, incEl, "urgencyScore", String.valueOf(inc.getUrgencyScore()));
            addChild(doc, incEl, "type", inc.getType());
            response.appendChild(incEl);
        }
        addChild(doc, response, "totalElements", String.valueOf(total));
        return response;
    }

    private void addChild(Document doc, Element parent, String name, String value) {
        Element el = doc.createElementNS(NAMESPACE_URI, name);
        el.setTextContent(value != null ? value : "");
        parent.appendChild(el);
    }
}
