"""Stereo early reflections and a diffuse, frequency-shaped chamber tail."""
from __future__ import annotations

import numpy as np
from scipy.signal import butter, oaconvolve, sosfilt

from rvideo.music.score_settings import SAMPLE_RATE


class RoomProcessor:
    """Own the impulse response and apply it to an explicit mono room send."""

    def __init__(self, decay_seconds: float = 2.15) -> None:
        self._decay = decay_seconds

    def apply(self, dry: np.ndarray, send: np.ndarray) -> np.ndarray:
        length = dry.shape[0]
        for channel in range(2):
            impulse = self._impulse(channel)
            wet = oaconvolve(send, impulse, mode='full')[:length]
            dry[:, channel] += wet.astype(np.float32, copy=False)
        return dry

    def _impulse(self, channel: int) -> np.ndarray:
        rng = np.random.default_rng(40811 + channel * 801)
        count = int((self._decay + .20) * SAMPLE_RATE)
        t = np.arange(count, dtype=np.float64) / SAMPLE_RATE
        noise = rng.standard_normal(count)
        sos = np.vstack((butter(2, 170, btype='highpass', fs=SAMPLE_RATE, output='sos'),
                         butter(2, 5200, btype='lowpass', fs=SAMPLE_RATE, output='sos')))
        tail = sosfilt(sos, noise)
        tail *= np.exp(-np.log(1000) * t / self._decay)
        tail[t < .07] = 0
        tail *= .43 / max(float(np.sqrt(np.sum(tail * tail))), 1e-12)
        delays = (.031, .047, .071, .097, .131) if channel == 0 else (.039, .059, .083, .113, .149)
        for delay, gain in zip(delays, (.22, .17, .13, .10, .075)):
            tail[round(delay * SAMPLE_RATE)] += gain
        return tail.astype(np.float32)
