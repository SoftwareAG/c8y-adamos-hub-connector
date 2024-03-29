package com.adamos.hubconnector.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.adamos.hubconnector.model.events.EventMapping;
import com.adamos.hubconnector.model.events.EventRules;
import com.adamos.hubconnector.services.EventRulesService;

@RestController
public class EventRulesApi {

	@Autowired
	EventRulesService eventService;

	@PreAuthorize("hasRole('ROLE_ADAMOS_HUB_READ')")
	@RequestMapping(value = "/eventRules", method = RequestMethod.GET)
	public ResponseEntity<EventRules> getEventRulesFromHub() {
		EventRules list = eventService.getEventRules();
		if (list != null) {
			return new ResponseEntity<EventRules>(list, HttpStatus.OK);
		}

		return new ResponseEntity<>(HttpStatus.NOT_FOUND);
	}

	@PreAuthorize("hasRole('ROLE_ADAMOS_HUB_UPDATE')")
	@RequestMapping(value = "/eventRules", method = RequestMethod.PUT)
	public ResponseEntity<EventRules> updateEventRulesFromHub(@RequestBody EventRules eventRules) {
		eventService.storeEventRules(eventRules);
		return new ResponseEntity<EventRules>(eventRules, HttpStatus.OK);
	}

	@PreAuthorize("hasRole('ROLE_ADAMOS_HUB_READ')")
	@RequestMapping(value = "/eventMapping", method = RequestMethod.GET)
	public ResponseEntity<EventMapping[]> getEventMappingFromHub() {
		EventMapping[] list = eventService.getEventMapping();
		if (list != null) {
			return new ResponseEntity<EventMapping[]>(list, HttpStatus.OK);
		}

		return new ResponseEntity<>(HttpStatus.NOT_FOUND);
	}

	@PreAuthorize("hasRole('ROLE_ADAMOS_HUB_UPDATE')")
	@RequestMapping(value = "/eventMapping", method = RequestMethod.PUT)
	public ResponseEntity<EventMapping[]> updateEventMappingFromHub(@RequestBody EventMapping[] mappings) {
		eventService.updateEventMapping(mappings);
		return new ResponseEntity<EventMapping[]>(mappings, HttpStatus.OK);
	}
}
