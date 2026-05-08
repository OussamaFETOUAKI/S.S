package com.smartcity.repository;

import com.smartcity.model.Incident;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    Page<Incident> findByCreatorId(Long creatorId, Pageable pageable);
    List<Incident> findByCreatorId(Long creatorId); // keep List for internal use if needed

    // Sort by Urgency Score (High to Low)
    Page<Incident> findAllByOrderByUrgencyScoreDesc(Pageable pageable);
    List<Incident> findAllByOrderByUrgencyScoreDesc(); // keep List for internal use if needed
}

