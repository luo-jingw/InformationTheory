"""Argument parsing and dispatch for the local episode build pipeline."""
from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Sequence, cast

from rvideo.cli.commands import CommandName, CommandOptions, PipelineCommands

COMMANDS: tuple[CommandName, ...] = (
    "validate", "narrate", "timeline", "subtitles", "music", "mix", "audio",
    "transcribe", "mux", "check", "deliver",
)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="rvideo")
    parser.add_argument("command", choices=COMMANDS)
    parser.add_argument("episode")
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--version", type=int, default=1)
    parser.add_argument("--workers", type=int, default=1)
    parser.add_argument("--port", type=int, default=5300)
    parser.add_argument("--device", choices=("cuda", "cpu"), default="cuda")
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_parser()
    arguments = parser.parse_args(argv)
    options = CommandOptions(
        command=cast(CommandName, arguments.command), episode=arguments.episode, root=arguments.root,
        version=arguments.version, workers=arguments.workers, port=arguments.port,
        device=arguments.device,
    )
    return PipelineCommands().dispatch(options)


if __name__ == "__main__":
    sys.exit(main())
