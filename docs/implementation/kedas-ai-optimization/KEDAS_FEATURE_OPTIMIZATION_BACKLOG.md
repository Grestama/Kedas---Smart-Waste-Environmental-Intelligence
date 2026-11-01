# KEDAS FEATURE OPTIMIZATION BACKLOG
## Strategic Product Roadmap & Future Innovation Items
**Date:** 30 October 2026  
**Document Version:** 1.0  
**Status:** Post-Hackathon Backlog Items  

---

## 1. High-Priority Near-Term Optimizations (Post-Pilot)

| ID | Title | Domain | Description | Complexity | Priority |
| :---: | :--- | :---: | :--- | :---: | :---: |
| **OPT-001** | Vector DB Integration (pgvector / Qdrant) | AI / RAG | Transition from hybrid in-memory scoring to dense embedding similarity search using `pgvector` as the knowledge repository expands beyond 10,000 chunks. | Medium | P1 |
| **OPT-002** | Real-time IoT Scale Integration | IoT / Facility | Direct serial / Bluetooth Low Energy (BLE) integration with digital hanging scales and truck weighbridges at TPS3R facilities to eliminate manual keyboard input. | High | P1 |
| **OPT-003** | Automated OCR for Physical Weight Tickets | Computer Vision | Implement on-device OCR pipeline to scan paper weighing receipts issued by regional landfills (TPA Suwung) and cross-reference against digital manifests. | Medium | P1 |
| **OPT-004** | Push Notification Service Worker | PWA / Mobile | Deploy Web Push Notifications for citizen pickup reminders, slot opening alerts, and emergency corridor cleanup broadcasts. | Low | P2 |

---

## 2. Mid-Term Strategic Initiatives (Q1 2027)

| ID | Title | Domain | Description | Complexity | Priority |
| :---: | :--- | :---: | :--- | :---: | :---: |
| **STRAT-001** | Provincial DLH API Gateway | Integration | Build standard REST/GraphQL push connectors to synchronize Kedas mass-balance data with the Bali Provincial Environmental Agency (DLH Bali) SIPSN system. | High | P2 |
| **STRAT-002** | Verified Carbon Credit Tokenization | Sustainability | Aggregate certified methane avoidance tons into standardized voluntary carbon offset credits (VCS / Gold Standard) for purchase by corporate eco-tourists. | High | P3 |
| **STRAT-003** | Multi-Facility Routing Optimization | Logistics | Implement vehicle routing problem (VRP) algorithms with real-time Google Maps traffic constraints to minimize diesel consumption for collection trucks. | High | P2 |
| **STRAT-004** | Multilingual Audio Voice Assistant | AI / Voice | Add text-to-speech (TTS) and speech-to-text (STT) in Balinese language (*Basa Bali*) for elderly rural waste depositors who prefer verbal interaction. | Medium | P3 |

---

## 3. Governance & Quality Maintenance Backlog

- **BACKLOG-001:** Automated weekly regression testing pipeline with synthetic image injection.
- **BACKLOG-002:** Automated drift detection for community RAG retrieval queries.
- **BACKLOG-003:** Comprehensive load testing (Locust) up to 1,000 concurrent collectors during morning peak intake hours (07:00 - 10:00 WITA).
