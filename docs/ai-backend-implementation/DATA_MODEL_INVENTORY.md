# Kedas Backend — Data Model Inventory (Verified As-Built)

Total Registered SQLAlchemy ORM Tables: **48**

## ai_interaction_logs
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| session_id | VARCHAR(64) | False | True | - | Yes |
| user_id | VARCHAR(36) | False | True | users.id | Yes |
| capability | VARCHAR(32) | False | False | - | Yes |
| destination_id | VARCHAR(36) | False | True | - | Yes |
| prompt_summary | TEXT | False | True | - | - |
| response_summary | TEXT | False | True | - | - |
| citations_json | TEXT | False | True | - | - |
| confidence_band | VARCHAR(32) | False | True | - | - |
| latency_ms | INTEGER | False | True | - | - |
| provider | VARCHAR(64) | False | False | - | - |
| fallback_used | BOOLEAN | False | False | - | - |
| feedback_rating | VARCHAR(16) | False | True | - | - |
| created_at | DATETIME | False | False | - | Yes |

## audit_logs
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| actor_user_id | VARCHAR(36) | False | True | - | Yes |
| action | VARCHAR(100) | False | False | - | Yes |
| entity_type | VARCHAR(100) | False | False | - | Yes |
| entity_id | VARCHAR(255) | False | True | - | Yes |
| reason | VARCHAR(500) | False | True | - | - |
| request_id | VARCHAR(64) | False | True | - | Yes |
| ip_address | VARCHAR(45) | False | True | - | - |
| details_json | TEXT | False | True | - | - |
| created_at | DATETIME | False | False | - | Yes |

## auth_sessions
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| user_id | VARCHAR(36) | False | False | users.id | Yes |
| token_hash | VARCHAR(64) | False | False | - | Yes |
| expires_at | DATETIME | False | False | - | Yes |
| revoked_at | DATETIME | False | True | - | - |
| ip_address | VARCHAR(45) | False | True | - | - |
| user_agent | VARCHAR(500) | False | True | - | - |
| created_at | DATETIME | False | False | - | - |

## b2b_locations
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| organization_id | VARCHAR(36) | False | False | b2b_organizations.id | Yes |
| name | VARCHAR(100) | False | False | - | - |
| address | TEXT | False | False | - | - |
| service_area_id | VARCHAR(36) | False | True | service_areas.id | Yes |
| contact_person | VARCHAR(100) | False | False | - | - |
| contact_phone | VARCHAR(50) | False | False | - | - |
| estimated_daily_kg | NUMERIC(10, 2) | False | False | - | - |
| pickup_frequency | VARCHAR(50) | False | False | - | - |
| access_instructions | TEXT | False | True | - | - |
| is_active | BOOLEAN | False | False | - | - |
| created_at | DATETIME | False | False | - | - |

## b2b_organization_members
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| organization_id | VARCHAR(36) | False | False | b2b_organizations.id | Yes |
| user_id | VARCHAR(36) | False | False | users.id | Yes |
| role | VARCHAR(32) | False | False | - | - |
| created_at | DATETIME | False | False | - | - |

## b2b_organizations
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| name | VARCHAR(150) | False | False | - | Yes |
| business_type | VARCHAR(50) | False | False | - | - |
| tax_id | VARCHAR(50) | False | True | - | - |
| billing_contact_name | VARCHAR(100) | False | False | - | - |
| billing_contact_phone | VARCHAR(50) | False | False | - | - |
| billing_contact_email | VARCHAR(255) | False | False | - | - |
| is_active | BOOLEAN | False | False | - | Yes |
| created_at | DATETIME | False | False | - | - |

## b2b_pickup_requests
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| request_no | VARCHAR(64) | False | False | - | Yes |
| location_id | VARCHAR(36) | False | False | b2b_locations.id | Yes |
| category_id | VARCHAR(36) | False | False | waste_categories.id | - |
| scheduled_date | DATETIME | False | False | - | Yes |
| estimated_weight_kg | NUMERIC(10, 3) | False | False | - | - |
| actual_weight_kg | NUMERIC(10, 3) | False | True | - | - |
| status | VARCHAR(32) | False | False | - | Yes |
| collector_id | VARCHAR(36) | False | True | users.id | - |
| notes | TEXT | False | True | - | - |
| created_at | DATETIME | False | False | - | - |

## banjar_officials
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| user_id | VARCHAR(36) | False | False | users.id | Yes |
| service_area_id | VARCHAR(36) | False | False | service_areas.id | Yes |
| official_title | VARCHAR(100) | False | False | - | - |
| is_active | BOOLEAN | False | False | - | - |
| created_at | DATETIME | False | False | - | - |

## banjar_profiles
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| service_area_id | VARCHAR(36) | False | False | service_areas.id | - |
| desa_adat_name | VARCHAR(150) | False | False | - | - |
| kelian_banjar_name | VARCHAR(150) | False | False | - | - |
| contact_phone | VARCHAR(32) | False | False | - | - |
| household_count | INTEGER | False | False | - | - |
| target_sorting_percent | NUMERIC(5, 2) | False | False | - | - |
| created_at | DATETIME | False | False | - | - |
| updated_at | DATETIME | False | False | - | - |

## cdoa_agreements
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| agreement_no | VARCHAR(64) | False | False | - | Yes |
| service_area_id | VARCHAR(36) | False | False | service_areas.id | Yes |
| version | INTEGER | False | False | - | - |
| title | VARCHAR(200) | False | False | - | - |
| status | VARCHAR(32) | False | False | - | Yes |
| eligible_source_types | VARCHAR(255) | False | False | - | - |
| accepted_category_ids | TEXT | False | True | - | - |
| primary_facility_id | VARCHAR(36) | False | True | facilities.id | - |
| collection_schedule_notes | TEXT | False | True | - | - |
| capacity_limit_daily_kg | FLOAT | False | False | - | - |
| pic_name | VARCHAR(100) | False | False | - | - |
| pic_contact | VARCHAR(50) | False | False | - | - |
| escalation_channel | VARCHAR(100) | False | False | - | - |
| sla_hours | INTEGER | False | False | - | - |
| effective_from | DATETIME | False | False | - | - |
| effective_until | DATETIME | False | True | - | - |
| created_by | VARCHAR(36) | False | False | users.id | - |
| approved_by | VARCHAR(36) | False | True | users.id | - |
| approval_timestamp | DATETIME | False | True | - | - |
| created_at | DATETIME | False | False | - | - |
| updated_at | DATETIME | False | False | - | - |

## cleanup_actions
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| action_no | VARCHAR(64) | False | False | - | Yes |
| action_type | VARCHAR(50) | False | False | - | Yes |
| location_name | VARCHAR(200) | False | False | - | - |
| service_area_id | VARCHAR(36) | False | True | service_areas.id | - |
| coordinator_user_id | VARCHAR(36) | False | False | users.id | - |
| event_date | DATETIME | False | False | - | - |
| duration_hours | NUMERIC(5, 2) | False | False | - | - |
| volunteer_count | INTEGER | False | False | - | - |
| total_collected_weight_kg | FLOAT | False | False | - | - |
| plastic_weight_kg | FLOAT | False | False | - | - |
| organic_weight_kg | FLOAT | False | False | - | - |
| residual_weight_kg | FLOAT | False | False | - | - |
| evidence_notes | TEXT | False | True | - | - |
| status | VARCHAR(50) | False | False | - | Yes |
| verified_by | VARCHAR(36) | False | True | users.id | - |
| verified_at | DATETIME | False | True | - | - |
| created_at | DATETIME | False | False | - | - |

## collection_slots
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| service_area_id | VARCHAR(36) | False | False | service_areas.id | Yes |
| start_time | DATETIME | False | False | - | Yes |
| end_time | DATETIME | False | False | - | - |
| max_capacity | INTEGER | False | False | - | - |
| booked_capacity | INTEGER | False | False | - | - |
| is_active | BOOLEAN | False | False | - | Yes |
| created_at | DATETIME | False | False | - | - |
| updated_at | DATETIME | False | False | - | - |

## collector_applications
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| user_id | VARCHAR(36) | False | False | users.id | Yes |
| status | VARCHAR(32) | False | False | - | Yes |
| vehicle_type | VARCHAR(100) | False | True | - | - |
| operational_notes | TEXT | False | True | - | - |
| reviewed_by | VARCHAR(36) | False | True | users.id | - |
| reviewed_at | DATETIME | False | True | - | - |
| rejection_reason | VARCHAR(500) | False | True | - | - |
| created_at | DATETIME | False | False | - | - |
| updated_at | DATETIME | False | False | - | - |

## community_complaints
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| ticket_no | VARCHAR(64) | False | False | - | Yes |
| service_area_id | VARCHAR(36) | False | False | service_areas.id | Yes |
| reporter_user_id | VARCHAR(36) | False | False | users.id | - |
| title | VARCHAR(200) | False | False | - | - |
| description | TEXT | False | False | - | - |
| location_detail | VARCHAR(255) | False | False | - | - |
| status | VARCHAR(50) | False | False | - | Yes |
| resolution_notes | TEXT | False | True | - | - |
| resolved_by | VARCHAR(36) | False | True | users.id | - |
| resolved_at | DATETIME | False | True | - | - |
| created_at | DATETIME | False | False | - | - |

## community_events
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| event_no | VARCHAR(64) | False | False | - | Yes |
| service_area_id | VARCHAR(36) | False | False | service_areas.id | Yes |
| title | VARCHAR(200) | False | False | - | - |
| description | TEXT | False | True | - | - |
| event_date | DATETIME | False | False | - | - |
| event_type | VARCHAR(50) | False | False | - | - |
| status | VARCHAR(50) | False | False | - | Yes |
| organizer_user_id | VARCHAR(36) | False | False | users.id | - |
| expected_attendees | INTEGER | False | False | - | - |
| actual_attendees | INTEGER | False | False | - | - |
| created_at | DATETIME | False | False | - | - |

## delivery_records
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| batch_id | VARCHAR(36) | False | False | material_batches.id | Yes |
| partner_id | VARCHAR(36) | False | False | partners.id | Yes |
| dispatched_weight_kg | NUMERIC(10, 3) | False | False | - | - |
| received_weight_kg | NUMERIC(10, 3) | False | True | - | - |
| weight_discrepancy_kg | NUMERIC(10, 3) | False | True | - | - |
| status | VARCHAR(50) | False | False | - | Yes |
| dispatched_by | VARCHAR(36) | False | False | users.id | - |
| dispatched_at | DATETIME | False | False | - | - |
| received_at | DATETIME | False | True | - | - |
| notes | TEXT | False | True | - | - |

## evidence_files
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| storage_key | VARCHAR(255) | False | False | - | Yes |
| original_filename | VARCHAR(255) | False | False | - | - |
| mime_type | VARCHAR(100) | False | False | - | - |
| file_size_bytes | INTEGER | False | False | - | - |
| sha256_hash | VARCHAR(64) | False | False | - | - |
| uploader_id | VARCHAR(36) | False | False | users.id | Yes |
| entity_type | VARCHAR(50) | False | False | - | Yes |
| entity_id | VARCHAR(36) | False | False | - | Yes |
| status | VARCHAR(50) | False | False | - | - |
| created_at | DATETIME | False | False | - | - |

## facilities
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| code | VARCHAR(50) | False | False | - | Yes |
| name | VARCHAR(100) | False | False | - | - |
| facility_type | VARCHAR(50) | False | False | - | - |
| service_area_id | VARCHAR(36) | False | True | service_areas.id | Yes |
| address | TEXT | False | False | - | - |
| capacity_kg_per_day | NUMERIC(10, 2) | False | False | - | - |
| is_active | BOOLEAN | False | False | - | Yes |
| created_at | DATETIME | False | False | - | - |

## facility_receipts
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| receipt_no | VARCHAR(64) | False | False | - | Yes |
| facility_id | VARCHAR(36) | False | False | facilities.id | Yes |
| pickup_id | VARCHAR(36) | False | True | pickup_requests.id | Yes |
| category_id | VARCHAR(36) | False | False | waste_categories.id | Yes |
| receiver_user_id | VARCHAR(36) | False | False | users.id | Yes |
| sender_user_id | VARCHAR(36) | False | True | users.id | Yes |
| gross_weight_kg | NUMERIC(10, 3) | False | True | - | - |
| tare_weight_kg | NUMERIC(10, 3) | False | True | - | - |
| received_weight_kg | NUMERIC(10, 3) | False | False | - | - |
| discrepancy_kg | NUMERIC(10, 3) | False | False | - | - |
| discrepancy_reason | TEXT | False | True | - | - |
| quality_grade | VARCHAR(32) | False | False | - | - |
| contamination_percent | NUMERIC(5, 2) | False | False | - | - |
| receipt_status | VARCHAR(32) | False | False | - | Yes |
| idempotency_key | VARCHAR(64) | False | True | - | Yes |
| notes | TEXT | False | True | - | - |
| created_at | DATETIME | False | False | - | - |

## funding_programs
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| code | VARCHAR(50) | False | False | - | Yes |
| name | VARCHAR(100) | False | False | - | - |
| sponsor_name | VARCHAR(150) | False | True | - | - |
| program_type | VARCHAR(50) | False | False | - | - |
| target_service_area_id | VARCHAR(36) | False | True | service_areas.id | - |
| total_budget_idr | BIGINT | False | False | - | - |
| disbursed_budget_idr | BIGINT | False | False | - | - |
| total_points_disbursed | INTEGER | False | False | - | - |
| points_capacity | INTEGER | False | False | - | - |
| status | VARCHAR(50) | False | False | - | Yes |
| created_at | DATETIME | False | False | - | - |
| updated_at | DATETIME | False | False | - | - |

## hazardous_waste_manifests
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| manifest_no | VARCHAR(64) | False | False | - | Yes |
| category_id | VARCHAR(36) | False | False | waste_categories.id | - |
| service_area_id | VARCHAR(36) | False | True | service_areas.id | - |
| source_pickup_id | VARCHAR(36) | False | True | pickup_requests.id | - |
| handler_partner_id | VARCHAR(36) | False | False | partners.id | - |
| transporter_license_no | VARCHAR(100) | False | False | - | - |
| weight_kg | FLOAT | False | False | - | - |
| hazard_type | VARCHAR(50) | False | False | - | - |
| handling_sop_code | VARCHAR(50) | False | False | - | - |
| status | VARCHAR(50) | False | False | - | Yes |
| destruction_cert_no | VARCHAR(100) | False | True | - | - |
| notes | TEXT | False | True | - | - |
| created_by | VARCHAR(36) | False | False | users.id | - |
| created_at | DATETIME | False | False | - | - |
| disposed_at | DATETIME | False | True | - | - |

## inspection_records
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| pickup_id | VARCHAR(36) | False | False | pickup_requests.id | Yes |
| inspector_id | VARCHAR(36) | False | False | users.id | Yes |
| result | VARCHAR(50) | False | False | - | - |
| contamination_level | VARCHAR(50) | False | False | - | - |
| accepted_weight_kg | NUMERIC(10, 3) | False | True | - | - |
| rejected_weight_kg | NUMERIC(10, 3) | False | True | - | - |
| rejection_reason_code | VARCHAR(50) | False | True | - | - |
| rejection_notes | TEXT | False | True | - | - |
| created_at | DATETIME | False | False | - | - |

## knowledge_chunks
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| document_id | VARCHAR(36) | False | False | knowledge_documents.id | Yes |
| chunk_index | INTEGER | False | False | - | - |
| section_title | VARCHAR(255) | False | True | - | - |
| content | TEXT | False | False | - | - |
| token_count | INTEGER | False | False | - | - |
| created_at | DATETIME | False | False | - | - |
| updated_at | DATETIME | False | False | - | - |

## knowledge_documents
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| title | VARCHAR(255) | False | False | - | Yes |
| source_type | VARCHAR(64) | False | False | - | Yes |
| destination_id | VARCHAR(36) | False | True | service_areas.id | Yes |
| organization_id | VARCHAR(36) | False | True | b2b_organizations.id | Yes |
| cdoa_id | VARCHAR(36) | False | True | cdoa_agreements.id | Yes |
| is_public | BOOLEAN | False | False | - | Yes |
| version | VARCHAR(32) | False | False | - | - |
| status | VARCHAR(32) | False | False | - | Yes |
| checksum | VARCHAR(64) | False | False | - | - |
| total_chunks | INTEGER | False | False | - | - |
| metadata_json | TEXT | False | True | - | - |
| created_by | VARCHAR(255) | False | False | - | - |
| created_at | DATETIME | False | False | - | - |
| updated_at | DATETIME | False | False | - | - |

## ledger_entries
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| user_id | VARCHAR(36) | False | False | users.id | Yes |
| points_delta | INTEGER | False | False | - | - |
| entry_type | VARCHAR(50) | False | False | - | Yes |
| status | VARCHAR(50) | False | False | - | Yes |
| source_type | VARCHAR(50) | False | False | - | - |
| source_id | VARCHAR(36) | False | False | - | Yes |
| idempotency_key | VARCHAR(120) | False | False | - | Yes |
| rule_snapshot | TEXT | False | True | - | - |
| actor_id | VARCHAR(36) | False | False | users.id | - |
| reason | VARCHAR(255) | False | False | - | - |
| reverses_entry_id | VARCHAR(36) | False | True | ledger_entries.id | - |
| created_at | DATETIME | False | False | - | Yes |

## material_acceptance_rules
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| category_id | VARCHAR(36) | False | False | waste_categories.id | Yes |
| service_area_id | VARCHAR(36) | False | False | service_areas.id | Yes |
| is_accepted | BOOLEAN | False | False | - | - |
| special_route_confirmed | BOOLEAN | False | False | - | - |
| notes | VARCHAR(255) | False | True | - | - |
| created_at | DATETIME | False | False | - | - |
| updated_at | DATETIME | False | False | - | - |

## material_batch_items
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| batch_id | VARCHAR(36) | False | False | material_batches.id | Yes |
| pickup_id | VARCHAR(36) | False | False | pickup_requests.id | Yes |
| weight_kg | NUMERIC(10, 3) | False | False | - | - |

## material_batches
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| batch_code | VARCHAR(50) | False | False | - | Yes |
| category_id | VARCHAR(36) | False | False | waste_categories.id | Yes |
| total_weight_kg | NUMERIC(10, 3) | False | False | - | - |
| status | VARCHAR(50) | False | False | - | Yes |
| created_by | VARCHAR(36) | False | False | users.id | - |
| created_at | DATETIME | False | False | - | - |
| updated_at | DATETIME | False | False | - | - |

## material_offers
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| offer_no | VARCHAR(64) | False | False | - | Yes |
| offer_type | VARCHAR(32) | False | False | - | Yes |
| partner_id | VARCHAR(36) | False | True | partners.id | - |
| facility_id | VARCHAR(36) | False | True | facilities.id | - |
| category_id | VARCHAR(36) | False | False | waste_categories.id | Yes |
| min_quantity_kg | NUMERIC(10, 3) | False | False | - | - |
| max_quantity_kg | NUMERIC(10, 3) | False | False | - | - |
| quality_grade | VARCHAR(32) | False | False | - | - |
| price_indicative_idr | INTEGER | False | True | - | - |
| valid_until | DATETIME | False | False | - | Yes |
| status | VARCHAR(32) | False | False | - | Yes |
| notes | TEXT | False | True | - | - |
| created_by | VARCHAR(36) | False | False | users.id | - |
| created_at | DATETIME | False | False | - | - |

## notification_outbox
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| event_type | VARCHAR(100) | False | False | - | Yes |
| payload_json | TEXT | False | False | - | - |
| status | VARCHAR(32) | False | False | - | Yes |
| retry_count | INTEGER | False | False | - | - |
| max_retries | INTEGER | False | False | - | - |
| last_error | TEXT | False | True | - | - |
| created_at | DATETIME | False | False | - | Yes |
| processed_at | DATETIME | False | True | - | - |

## notifications
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| user_id | VARCHAR(36) | False | False | users.id | Yes |
| title | VARCHAR(100) | False | False | - | - |
| body | TEXT | False | False | - | - |
| event_type | VARCHAR(50) | False | False | - | - |
| reference_id | VARCHAR(36) | False | True | - | - |
| is_read | BOOLEAN | False | False | - | Yes |
| created_at | DATETIME | False | False | - | Yes |

## organic_processing_records
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| batch_no | VARCHAR(64) | False | False | - | Yes |
| facility_id | VARCHAR(36) | False | False | facilities.id | Yes |
| operator_user_id | VARCHAR(36) | False | False | users.id | - |
| process_type | VARCHAR(50) | False | False | - | - |
| input_weight_kg | NUMERIC(10, 3) | False | False | - | - |
| output_product_weight_kg | NUMERIC(10, 3) | False | False | - | - |
| residue_weight_kg | NUMERIC(10, 3) | False | False | - | - |
| status | VARCHAR(32) | False | False | - | Yes |
| started_at | DATETIME | False | False | - | - |
| completed_at | DATETIME | False | True | - | - |
| notes | TEXT | False | True | - | - |
| created_at | DATETIME | False | False | - | - |

## partners
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| name | VARCHAR(100) | False | False | - | - |
| contact_email | VARCHAR(255) | False | False | - | - |
| contact_phone | VARCHAR(50) | False | False | - | - |
| address | TEXT | False | False | - | - |
| partner_type | VARCHAR(50) | False | False | - | Yes |
| capacity_kg_per_month | NUMERIC(10, 2) | False | True | - | - |
| service_area_id | VARCHAR(36) | False | True | service_areas.id | - |
| verification_status | VARCHAR(50) | False | False | - | Yes |
| verified_at | DATETIME | False | True | - | - |
| verified_by | VARCHAR(36) | False | True | users.id | - |
| created_at | DATETIME | False | False | - | - |

## pickup_requests
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| public_code | VARCHAR(32) | False | False | - | Yes |
| reporter_user_id | VARCHAR(36) | False | False | users.id | Yes |
| service_area_id | VARCHAR(36) | False | False | service_areas.id | Yes |
| category_id | VARCHAR(36) | False | False | waste_categories.id | Yes |
| address_id | VARCHAR(36) | False | False | user_addresses.id | Yes |
| slot_id | VARCHAR(36) | False | False | collection_slots.id | Yes |
| status | VARCHAR(32) | False | False | - | Yes |
| service_mode | VARCHAR(32) | False | False | - | Yes |
| idempotency_key | VARCHAR(64) | False | True | - | Yes |
| assigned_collector_id | VARCHAR(36) | False | True | users.id | Yes |
| estimated_weight_kg | NUMERIC(8, 2) | False | True | - | - |
| actual_weight_kg | NUMERIC(10, 3) | False | True | - | - |
| notes | TEXT | False | True | - | - |
| cancellation_reason | VARCHAR(500) | False | True | - | - |
| completed_at | DATETIME | False | True | - | - |
| created_at | DATETIME | False | False | - | - |
| updated_at | DATETIME | False | False | - | - |

## pickup_status_events
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| pickup_request_id | VARCHAR(36) | False | False | pickup_requests.id | Yes |
| from_status | VARCHAR(32) | False | False | - | - |
| to_status | VARCHAR(32) | False | False | - | - |
| actor_user_id | VARCHAR(36) | False | True | users.id | Yes |
| reason | VARCHAR(500) | False | True | - | - |
| request_id | VARCHAR(64) | False | True | - | - |
| created_at | DATETIME | False | False | - | Yes |

## program_budget_allocations
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| program_id | VARCHAR(36) | False | False | funding_programs.id | Yes |
| service_area_id | VARCHAR(36) | False | False | service_areas.id | Yes |
| allocated_amount_idr | BIGINT | False | False | - | - |
| spent_amount_idr | BIGINT | False | False | - | - |
| purpose | VARCHAR(255) | False | False | - | - |
| allocated_at | DATETIME | False | False | - | - |
| created_at | DATETIME | False | False | - | - |

## program_sponsorships
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| program_id | VARCHAR(36) | False | False | funding_programs.id | Yes |
| sponsor_name | VARCHAR(150) | False | False | - | - |
| sponsor_type | VARCHAR(50) | False | False | - | - |
| amount_idr | BIGINT | False | False | - | - |
| contract_ref | VARCHAR(100) | False | True | - | - |
| contributed_at | DATETIME | False | False | - | - |
| notes | TEXT | False | True | - | - |
| created_at | DATETIME | False | False | - | - |

## reward_rules
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| category_id | VARCHAR(36) | False | False | waste_categories.id | Yes |
| version | INTEGER | False | False | - | - |
| status | VARCHAR(50) | False | False | - | Yes |
| points_per_kg | INTEGER | False | False | - | - |
| minimum_weight_kg | NUMERIC(10, 3) | False | False | - | - |
| max_points_per_pickup | INTEGER | False | True | - | - |
| effective_from | DATETIME | False | False | - | - |
| effective_to | DATETIME | False | True | - | - |
| created_by | VARCHAR(36) | False | True | users.id | - |
| created_at | DATETIME | False | False | - | - |

## roles
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| code | VARCHAR(32) | False | False | - | Yes |
| name | VARCHAR(100) | False | False | - | - |
| description | VARCHAR(255) | False | True | - | - |

## service_areas
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| code | VARCHAR(64) | False | False | - | Yes |
| name | VARCHAR(100) | False | False | - | - |
| administrative_area | VARCHAR(100) | False | False | - | - |
| is_active | BOOLEAN | False | False | - | Yes |
| created_at | DATETIME | False | False | - | - |
| updated_at | DATETIME | False | False | - | - |

## stock_movements
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| facility_id | VARCHAR(36) | False | False | facilities.id | Yes |
| category_id | VARCHAR(36) | False | False | waste_categories.id | Yes |
| batch_id | VARCHAR(36) | False | True | material_batches.id | Yes |
| movement_type | VARCHAR(50) | False | False | - | Yes |
| quantity_kg | NUMERIC(10, 3) | False | False | - | - |
| reference_id | VARCHAR(64) | False | True | - | Yes |
| actor_user_id | VARCHAR(36) | False | False | users.id | Yes |
| notes | TEXT | False | True | - | - |
| created_at | DATETIME | False | False | - | - |

## user_addresses
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| user_id | VARCHAR(36) | False | False | users.id | Yes |
| label | VARCHAR(100) | False | False | - | - |
| address_text | TEXT | False | False | - | - |
| service_area_id | VARCHAR(36) | False | True | service_areas.id | Yes |
| notes | VARCHAR(255) | False | True | - | - |
| is_default | BOOLEAN | False | False | - | - |
| created_at | DATETIME | False | False | - | - |
| updated_at | DATETIME | False | False | - | - |

## user_roles
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| user_id | VARCHAR(36) | False | False | users.id | Yes |
| role_id | VARCHAR(36) | False | False | roles.id | Yes |
| verification_status | VARCHAR(32) | False | False | - | - |
| granted_by | VARCHAR(36) | False | True | users.id | - |
| granted_at | DATETIME | False | False | - | - |
| notes | VARCHAR(255) | False | True | - | - |

## users
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| email | VARCHAR(255) | False | True | - | Yes |
| phone | VARCHAR(32) | False | True | - | Yes |
| full_name | VARCHAR(255) | False | False | - | - |
| password_hash | VARCHAR(255) | False | False | - | - |
| account_status | VARCHAR(32) | False | False | - | Yes |
| preferred_active_role | VARCHAR(32) | False | False | - | - |
| created_at | DATETIME | False | False | - | - |
| updated_at | DATETIME | False | False | - | - |

## waste_bank_members
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| account_no | VARCHAR(50) | False | False | - | Yes |
| user_id | VARCHAR(36) | False | False | users.id | Yes |
| facility_id | VARCHAR(36) | False | False | facilities.id | Yes |
| current_balance_idr | BIGINT | False | False | - | - |
| status | VARCHAR(32) | False | False | - | Yes |
| created_at | DATETIME | False | False | - | - |

## waste_bank_transactions
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| transaction_no | VARCHAR(64) | False | False | - | Yes |
| member_id | VARCHAR(36) | False | False | waste_bank_members.id | Yes |
| category_id | VARCHAR(36) | False | True | waste_categories.id | Yes |
| transaction_type | VARCHAR(32) | False | False | - | Yes |
| weight_kg | NUMERIC(10, 3) | False | True | - | - |
| unit_price_idr | INTEGER | False | True | - | - |
| amount_idr | BIGINT | False | False | - | - |
| running_balance_idr | BIGINT | False | False | - | - |
| receipt_id | VARCHAR(36) | False | True | - | - |
| reverses_transaction_id | VARCHAR(36) | False | True | - | - |
| recorded_by | VARCHAR(36) | False | False | users.id | - |
| status | VARCHAR(32) | False | False | - | Yes |
| notes | TEXT | False | True | - | - |
| created_at | DATETIME | False | False | - | - |

## waste_categories
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| code | VARCHAR(64) | False | False | - | Yes |
| name | VARCHAR(100) | False | False | - | - |
| category_type | VARCHAR(32) | False | False | - | Yes |
| description | TEXT | False | True | - | - |
| preparation_guide | TEXT | False | True | - | - |
| safety_notes | TEXT | False | True | - | - |
| is_active | BOOLEAN | False | False | - | Yes |
| display_order | INTEGER | False | False | - | - |
| created_at | DATETIME | False | False | - | - |
| updated_at | DATETIME | False | False | - | - |

## weight_records
| Column | Type | Primary Key | Nullable | Foreign Key | Indexes |
|---|---|---|---|---|---|
| id | VARCHAR(36) | True | False | - | PK |
| pickup_id | VARCHAR(36) | False | False | pickup_requests.id | Yes |
| version | INTEGER | False | False | - | - |
| recorder_id | VARCHAR(36) | False | False | users.id | Yes |
| verifier_id | VARCHAR(36) | False | True | users.id | Yes |
| method | VARCHAR(50) | False | False | - | - |
| gross_weight_kg | NUMERIC(10, 3) | False | True | - | - |
| tare_weight_kg | NUMERIC(10, 3) | False | True | - | - |
| net_weight_kg | NUMERIC(10, 3) | False | False | - | - |
| verification_status | VARCHAR(50) | False | False | - | - |
| supersedes_id | VARCHAR(36) | False | True | weight_records.id | Yes |
| correction_reason | TEXT | False | True | - | - |
| created_at | DATETIME | False | False | - | - |

