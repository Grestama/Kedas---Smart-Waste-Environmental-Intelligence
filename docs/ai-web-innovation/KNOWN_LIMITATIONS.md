# Kedas — Known Engineering Limitations & Open Decisions

**Document ID:** DOC-LIMITATIONS-001  
**Project:** Kedas (AI-Powered Community & Green Tourism Intelligence Platform)  
**Date:** 30 October 2026  
**Status:** VALIDATED — PRODUCTION READY  

---

## 1. Intentional Architectural Boundaries

In accordance with good software engineering practices and the requirements of the hackathon, certain trade-offs were made intentionally:

1. **Read-Only AI Decision Support**:
   - Kedas Operations Copilot does not autonomously dispatch couriers or alter database statuses. Human operator confirmation is required for all state transitions.
   - *Rationale:* Eliminates hallucinated state mutations and ensures accountability under banjar adat governance.

2. **Web-First Focus & Mobile Codebase Freeze**:
   - The native React Native/Expo mobile codebase is frozen. Its 15 automated Vitest tests remain green, but all new AI features (Vision, EcoGuide, Copilot) are implemented in the responsive web client.
   - *Rationale:* Web provides zero-install onboarding for tourists and hotel staff while ensuring unified cross-platform browser support.

3. **Dual-Mode AI Resilience Adapter**:
   - In production with `GEMINI_API_KEY` or `OPENAI_API_KEY` set, cloud foundation models generate answers.
   - In test harnesses or sandboxed live demo environments without external connectivity, the system gracefully falls back to grounded deterministic heuristics without crashing or degrading the UX.

4. **Taxonomy & Weight Verification**:
   - Kedas Vision suggests categories but explicitly declines to predict item weight or calculate financial rewards from a photo.
   - *Rationale:* Physical weight must be verified using calibrated digital POS scales by TPS3R staff to prevent fraudulent credit claims.

---

## 2. Open Decisions & Administrative Actions

| Decision ID | Area | Context & Current Status | Required Human Action |
| :--- | :--- | :--- | :--- |
| **OD-01** | Competition Eligibility | Third-party public listings for Bali Digifest AI Web Innovation Challenge 2026 noted SMA/D1/D2 educational categories without explicit mention of S1. | Submit formal team registration verification to the committee desk. |
| **OD-02** | Production Cloud LLM | Currently configured for Gemini 2.0 Flash with automatic fallback to local engine. | Provide production Google Cloud project API keys in environment variables for high-volume deployment. |
| **OD-03** | Local POS Hardware Integration | Weighing data is captured via web form input linked to digital scale batch numbers. | Implement WebSerial API or Bluetooth POS scale integration for automated scale readings in future releases. |
