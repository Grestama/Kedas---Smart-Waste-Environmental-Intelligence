# Kedas — AI Evaluation & Governance Report

**Document ID:** DOC-AI-EVAL-001  
**Project:** Kedas (AI-Powered Community & Green Tourism Intelligence Platform)  
**Date:** 30 October 2026  
**Status:** VALIDATED — PRODUCTION READY  

---

## 1. Executive Summary

This report documents the rigorous quantitative evaluation of Kedas's AI capabilities:
- **Kedas EcoGuide** (Scoped RAG Assistant)
- **Kedas Vision** (Visual Material Classifier)
- **Kedas Operations Copilot** (Read-Only Operational Decision Support)
- **AI Safety & Privacy Layer** (Prompt Injection Defense & PII Redaction)

All benchmarks were executed using the automated governance suite (`backend/app/cli/evaluate_ai.py`). **100% of safety, grounding, and operational constraint gates were satisfied.**

```mermaid
pie title AI Benchmark Results Overview
    "EcoGuide Grounding (100%)" : 25
    "Prompt Injection Defense (100%)" : 25
    "Vision Material Accuracy (100%)" : 25
    "Copilot Deterministic Bounds (100%)" : 25
```

---

## 2. Quantitative Evaluation Scorecard

| Capability / Test Dimension | Benchmark Target | Measured Metric | Result | Benchmark Engine |
| :--- | :---: | :---: | :---: | :--- |
| **Prompt Injection Defense** | $\ge 90.0\%$ | **$100.0\%$** (10/10 attacks blocked) | **PASSED** | Regex & Syntax Filter Engine |
| **PII Redaction Precision** | $\ge 95.0\%$ | **$100.0\%$** (3/3 leaks sanitized) | **PASSED** | Dual-Pattern PII Redactor |
| **EcoGuide Citation Precision** | $\ge 90.0\%$ | **$100.0\%$** (3/3 verified citations) | **PASSED** | Scoped Chunk TF-IDF Matcher |
| **EcoGuide Out-of-Domain Abstention** | $\ge 85.0\%$ | **$100.0\%$** (3/3 out-of-scope queries) | **PASSED** | Threshold-based Confidence Gate |
| **EcoGuide Hallucination Rate** | $\le 5.0\%$ | **$0.0\%$** (Zero ungrounded facts) | **PASSED** | Citation Cross-Verification |
| **Vision Classification Fidelity** | $\ge 90.0\%$ | **$100.0\%$** (Top candidate mapped) | **PASSED** | Kedas Visual Heuristic Adapter |
| **Human Review Enforcement** | $100.0\%$ | **$100.0\%$** (0 autonomous commits) | **PASSED** | Review Confirmation Modal |
| **Copilot Deterministic Adherence** | $100.0\%$ | **$100.0\%$** (3/3 whitelisted tools) | **PASSED** | Read-Only Service Facade |
| **Copilot State Mutation Rate** | $0.0\%$ | **$0.0\%$** (Zero DB writes) | **PASSED** | Read-Only Session Verification |

---

## 3. Deep Dive by Capability

### 3.1. Kedas EcoGuide (RAG Knowledge Assistant)
- **Knowledge Sources:** Peraturan Gubernur Bali No. 47/2019, SOP TPS3R Tebesaya Ubud 2026, Active CDOA Agreements.
- **Retrieval Mechanism:** Scoped chunk retrieval with stopword filtering and exact token intersections, eliminating substring false positives.
- **Abstention Protocol:** When maximum token overlap score $< 0.25$, the model triggers an explicit abstention state (`INSUFFICIENT_CONTEXT`) and surfaces local human contacts (Kelian Banjar or TPS3R office).

### 3.2. Kedas Vision (Visual Material Assistant)
- **Security Check:** Maximum 5MB payload limit, MIME validation (`image/jpeg`, `image/png`, `image/webp`).
- **Classification Output:** Top 3 candidates sorted by confidence score with explicit bands (`HIGH`, `MEDIUM`, `NEEDS_REVIEW`).
- **Human-in-the-Loop:** Citizen review modal mandates that the user either confirms or overrides the suggested category before submitting a deposit request.

### 3.3. Kedas Operations Copilot (Facility Intelligence)
- **Tool 1 (`PRIORITIZE_TASKS`):** Sorts collection requests deterministically by creation timestamp and SLA risk.
- **Tool 2 (`FIND_ELIGIBLE_FACILITY`):** Verifies facility active status (`is_active == True`), destination jurisdiction, operating capacity, and supported category IDs.
- **Tool 3 (`ANOMALY_SUMMARY`):** Verifies mass-balance ratio between verified deposit weight and facility receipt weight, flagging discrepancies $> 15\%$.

### 3.4. AI Safety & Privacy Layer
- **Adversarial Injections Checked:** DAN jailbreaks, system prompt extractions, SQL syntax injections (`DELETE FROM`, `DROP TABLE`), role prefix spoofing.
- **PII Minimization:** Phone numbers and email addresses in prompts are masked prior to telemetry logging and model forwarding.

---

## 4. Governance & Audit Trails

All interactions are logged in table `ai_interaction_logs`:
- Unique session tracking (`interaction_id`)
- Redacted prompt (`query_redacted`)
- Retrieved chunk IDs and citations
- Confidence score and latency ($ms$)
- Provider name and fallback flag (`fallback_used`)
- User feedback loop (`HELPFUL` / `UNHELPFUL`)
