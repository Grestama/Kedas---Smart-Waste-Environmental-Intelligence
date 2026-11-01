"""Kedas — Structure-Aware Knowledge Document Chunker.

Supports specialized parsing for:
1. Legal / Regulatory documents (Pergub, Perda, UU): Bab, Bagian, Paragraf, Pasal, Ayat.
2. Operational SOP & CDOA agreements: SOP identifiers, Langkah, Persyaratan, Sanksi.
3. Traditional Balinese Customary Adat: Awig-awig, Pararem, Pawos, Pamidanda, Tri Hita Karana.
4. General Markdown & Educational guides.
"""

from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass(frozen=True)
class ParsedChunk:
    chunk_index: int
    section_title: str | None
    clause_identifier: str | None
    content: str
    token_count: int


class StructureAwareChunker:
    """Intelligent chunker preserving legal, operational, and customary structure."""

    @classmethod
    def chunk(
        cls,
        content: str,
        source_type: str = "SOP",
        authority_class: str = "INTERNAL_SOP",
    ) -> list[ParsedChunk]:
        cleaned_content = content.strip()
        if not cleaned_content:
            return []

        upper_type = source_type.upper()
        if upper_type in ("REGULATION", "PERGUB", "PERDA", "UU"):
            return cls._chunk_regulation(cleaned_content)
        elif upper_type in ("AWIG_AWIG", "PARAREM", "ADAT"):
            return cls._chunk_adat(cleaned_content)
        elif upper_type in ("SOP", "CDOA"):
            return cls._chunk_sop_cdoa(cleaned_content)
        else:
            return cls._chunk_general(cleaned_content)

    @classmethod
    def _chunk_regulation(cls, text: str) -> list[ParsedChunk]:
        """Parse regulatory text by Bab, Pasal, and Ayat with context propagation."""
        # Split by Pasal or Bab
        pattern = r"\n(?=(?:BAB\s+[IVXLCDM\d]+|Pasal\s+\d+))"
        raw_sections = [
            s.strip() for s in re.split(pattern, text, flags=re.IGNORECASE) if s.strip()
        ]

        current_bab = "Ketentuan Umum"
        chunks: list[ParsedChunk] = []
        chunk_idx = 0

        for sec in raw_sections:
            # Check if section is a BAB header
            bab_match = re.match(
                r"^(BAB\s+[IVXLCDM\d]+(?::\s*|\s+-?\s*)[^\n]+)", sec, re.IGNORECASE
            )
            if bab_match and not re.search(r"Pasal\s+\d+", sec, re.IGNORECASE):
                current_bab = bab_match.group(1).strip()
                continue

            # Extract Pasal
            pasal_match = re.search(r"Pasal\s+(\d+)", sec, re.IGNORECASE)
            pasal_num = pasal_match.group(1) if pasal_match else None
            clause_id = f"Pasal {pasal_num}" if pasal_num else None

            # Sub-split by Ayat if present: e.g. (1) ... (2) ...
            ayat_pattern = r"\n(?=\(\d+\)\s+)"
            ayats = [a.strip() for a in re.split(ayat_pattern, sec) if a.strip()]

            if len(ayats) > 1 and pasal_num:
                pasal_header = ayats[0]
                first_line = pasal_header.split("\n", 1)[0].strip()
                for ayat_idx, ayat_text in enumerate(ayats[1:], start=1):
                    sub_clause = f"Pasal {pasal_num} Ayat ({ayat_idx})"
                    title = f"[{current_bab}] {sub_clause}"
                    full_chunk_text = f"{first_line}\n{ayat_text}"
                    token_est = len(full_chunk_text.split())
                    chunks.append(
                        ParsedChunk(
                            chunk_index=chunk_idx,
                            section_title=title[:255],
                            clause_identifier=sub_clause,
                            content=full_chunk_text,
                            token_count=token_est,
                        )
                    )
                    chunk_idx += 1
            else:
                first_line = sec.split("\n", 1)[0].strip()
                title = f"[{current_bab}] {first_line}" if current_bab else first_line
                token_est = len(sec.split())
                chunks.append(
                    ParsedChunk(
                        chunk_index=chunk_idx,
                        section_title=title[:255],
                        clause_identifier=clause_id,
                        content=sec,
                        token_count=token_est,
                    )
                )
                chunk_idx += 1

        return chunks if chunks else cls._chunk_general(text)

    @classmethod
    def _chunk_adat(cls, text: str) -> list[ParsedChunk]:
        """Parse Balinese customary awig-awig/pararem by Pawos, Palawa, or Palemahan."""
        pattern = r"\n(?=(?:Pawos\s+\d+|Palawa\s+\d+|Pararem\s+[^\n]+|BAB\s+[^\n]+))"
        raw_sections = [
            s.strip() for s in re.split(pattern, text, flags=re.IGNORECASE) if s.strip()
        ]

        chunks: list[ParsedChunk] = []
        for idx, sec in enumerate(raw_sections):
            pawos_match = re.search(r"(?:Pawos|Palawa)\s+(\d+)", sec, re.IGNORECASE)
            clause_id = f"Pawos {pawos_match.group(1)}" if pawos_match else None

            first_line = sec.split("\n", 1)[0].strip()
            title = first_line[:255]
            token_est = len(sec.split())
            chunks.append(
                ParsedChunk(
                    chunk_index=idx,
                    section_title=title,
                    clause_identifier=clause_id,
                    content=sec,
                    token_count=token_est,
                )
            )

        return chunks if chunks else cls._chunk_general(text)

    @classmethod
    def _chunk_sop_cdoa(cls, text: str) -> list[ParsedChunk]:
        """Parse SOP or CDOA operational agreement by Step, Section, or Article."""
        pattern = (
            r"\n(?=(?:#{1,3}\s+|SOP-[A-Z0-9-]+|Langkah\s+\d+|Tahap\s+\d+|Pasal\s+\d+|Bagian\s+\d+))"
        )
        raw_sections = [
            s.strip() for s in re.split(pattern, text, flags=re.IGNORECASE) if s.strip()
        ]

        chunks: list[ParsedChunk] = []
        for idx, sec in enumerate(raw_sections):
            clause_match = re.search(
                r"(SOP-[A-Z0-9-]+|Langkah\s+\d+|Tahap\s+\d+|Pasal\s+\d+)", sec, re.IGNORECASE
            )
            clause_id = clause_match.group(1) if clause_match else None

            first_line = sec.split("\n", 1)[0].strip()
            title = first_line.lstrip("#").strip()[:255]
            token_est = len(sec.split())
            chunks.append(
                ParsedChunk(
                    chunk_index=idx,
                    section_title=title,
                    clause_identifier=clause_id,
                    content=sec,
                    token_count=token_est,
                )
            )

        return chunks if chunks else cls._chunk_general(text)

    @classmethod
    def _chunk_general(cls, text: str) -> list[ParsedChunk]:
        """Fallback chunker splitting on markdown headers or double newlines."""
        raw_sections = [s.strip() for s in re.split(r"\n(?=#{1,4}\s+)", text) if s.strip()]
        if len(raw_sections) <= 1:
            raw_sections = [s.strip() for s in text.split("\n\n") if s.strip()]

        chunks: list[ParsedChunk] = []
        for idx, sec in enumerate(raw_sections):
            if len(sec) < 15:
                continue
            first_line = sec.split("\n", 1)[0].strip()
            title = first_line.lstrip("#").strip()[:255] if first_line.startswith("#") else None
            token_est = len(sec.split())
            chunks.append(
                ParsedChunk(
                    chunk_index=idx,
                    section_title=title,
                    clause_identifier=None,
                    content=sec,
                    token_count=token_est,
                )
            )
        return chunks
