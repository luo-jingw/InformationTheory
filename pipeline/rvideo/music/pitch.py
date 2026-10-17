"""MIDI note to equal-tempered frequency."""
def midi_to_hz(note: float) -> float:
    return 440.0 * 2.0 ** ((note - 69.0) / 12.0)
