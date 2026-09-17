#!/usr/bin/env python3
"""Generate public audio renderings for the Sleeve Qualification corpus.

The published research page remains the source of truth. This script parses the
47 successful response cells, skips the provider-failed cell, and renders each
response with Luna's standard Ava voice at +3% speaking rate.

The output is build-time public-site material. It is explicitly not part of the
original experimental evaluation.
"""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import re
from dataclasses import dataclass
from pathlib import Path

VOICE = "en-US-AvaMultilingualNeural"
RATE = "+3%"
SOURCE = Path("src/pages/research/sleeve-qualification-full.astro")
OUT_DIR = Path("public/assets/research/sleeve-audio")
EXPECTED_CELLS = 48
EXPECTED_SUCCESSFUL = 47

MODELS = {
    "A": ("GPT-5.6 Terra", "terra"),
    "B": ("Claude Fable 5.1", "fable"),
    "C": ("Gemini 2.5 Flash", "gemini"),
    "D": ("DeepSeek V4 Flash", "deepseek"),
}


@dataclass(frozen=True)
class Cell:
    probe: str
    sleeve: str
    model: str
    model_slug: str
    response: str
    provider_failed: bool

    @property
    def filename(self) -> str:
        return f"{self.probe.lower()}-{self.model_slug}.mp3"


def parse_cells(source: str) -> list[Cell]:
    probe_matches = list(
        re.finditer(r"\{\s*\n\s*id:\s*'([^']+)',", source, flags=re.MULTILINE)
    )
    if not probe_matches:
        raise RuntimeError("Could not find probe definitions in the research source.")

    cells: list[Cell] = []
    for index, probe_match in enumerate(probe_matches):
        probe = probe_match.group(1)
        start = probe_match.start()
        if index + 1 < len(probe_matches):
            end = probe_matches[index + 1].start()
        else:
            end = source.find("\n];", start)
            if end == -1:
                end = len(source)
        block = source[start:end]

        answer_pattern = re.compile(
            r"\{\s*sleeve:\s*'([ABCD])',"
            r"(?P<meta>.*?)"
            r"response:\s*`(?P<response>(?:\\`|[^`])*)`\s*\}",
            flags=re.DOTALL,
        )
        for answer in answer_pattern.finditer(block):
            sleeve = answer.group(1)
            model, model_slug = MODELS[sleeve]
            cells.append(
                Cell(
                    probe=probe,
                    sleeve=sleeve,
                    model=model,
                    model_slug=model_slug,
                    response=answer.group("response"),
                    provider_failed="status: 'provider_failed'" in answer.group("meta"),
                )
            )
    return cells


def successful_cells() -> list[Cell]:
    cells = parse_cells(SOURCE.read_text(encoding="utf-8"))
    successful = [cell for cell in cells if not cell.provider_failed]

    if len(cells) != EXPECTED_CELLS:
        raise RuntimeError(
            f"Safety stop: expected {EXPECTED_CELLS} cells, parsed {len(cells)}."
        )
    if len(successful) != EXPECTED_SUCCESSFUL:
        raise RuntimeError(
            f"Safety stop: expected {EXPECTED_SUCCESSFUL} successful cells, "
            f"parsed {len(successful)}."
        )
    filenames = [cell.filename for cell in successful]
    if len(filenames) != len(set(filenames)):
        raise RuntimeError("Safety stop: duplicate audio filenames detected.")
    return successful


def spoken_text(text: str) -> str:
    """Remove presentation-only Markdown without changing verbal content."""
    text = text.replace('\\"', '"').replace("\\'", "'")
    text = text.replace("**", "").replace("*", "").replace("`", "")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r" *\n *", "\n", text)
    return text.strip()


def corpus_hash(cells: list[Cell]) -> str:
    digest = hashlib.sha256()
    digest.update(f"voice={VOICE}\nrate={RATE}\n".encode())
    for cell in cells:
        digest.update(cell.filename.encode())
        digest.update(b"\0")
        digest.update(spoken_text(cell.response).encode("utf-8"))
        digest.update(b"\0")
    return digest.hexdigest()


async def synthesize(cells: list[Cell], overwrite: bool) -> None:
    try:
        import edge_tts  # type: ignore
    except ImportError as exc:
        raise RuntimeError(
            "edge-tts is required for generation. Install it with: pip install edge-tts"
        ) from exc

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest_files = []

    for index, cell in enumerate(cells, start=1):
        output = OUT_DIR / cell.filename
        speech = spoken_text(cell.response)
        manifest_files.append(
            {
                "probe": cell.probe,
                "sleeve": cell.sleeve,
                "model": cell.model,
                "file": cell.filename,
                "voice": VOICE,
                "rate": RATE,
                "response_sha256": hashlib.sha256(
                    cell.response.encode("utf-8")
                ).hexdigest(),
                "spoken_text_sha256": hashlib.sha256(
                    speech.encode("utf-8")
                ).hexdigest(),
            }
        )

        if output.exists() and not overwrite:
            print(f"[{index:02}/{len(cells)}] skip {cell.filename}")
            continue

        print(f"[{index:02}/{len(cells)}] make {cell.filename}")
        last_error: Exception | None = None
        for attempt in range(1, 4):
            try:
                await edge_tts.Communicate(
                    text=speech,
                    voice=VOICE,
                    rate=RATE,
                ).save(str(output))
                last_error = None
                break
            except Exception as exc:  # network/service retry
                last_error = exc
                if attempt < 3:
                    await asyncio.sleep(attempt * 2)
        if last_error is not None:
            raise last_error

    manifest = {
        "experiment": "sleeve-continuity-v1-20260916",
        "voice": VOICE,
        "rate": RATE,
        "successful_responses": len(cells),
        "corpus_hash": corpus_hash(cells),
        "note": (
            "Synthetic voice renderings generated after the experiment. "
            "Audio was not part of the model evaluation."
        ),
        "files": manifest_files,
    }
    (OUT_DIR / "manifest.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8"
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--hash-only", action="store_true")
    parser.add_argument("--validate-only", action="store_true")
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()

    cells = successful_cells()
    if args.hash_only:
        print(corpus_hash(cells))
        return
    if args.validate_only:
        print(f"Validated {len(cells)} successful responses.")
        return

    asyncio.run(synthesize(cells, overwrite=args.overwrite))
    print(f"Generated {len(cells)} audio renderings in {OUT_DIR}.")


if __name__ == "__main__":
    main()
