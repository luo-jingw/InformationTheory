import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";
import { PlayerSession, startServer } from "./PlayerSession";

const FPS = 30;
const JPEG_QUALITY = 93;
const X264_ARGS = ["-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p"];

interface ExcerptCaptureSpec {
  episode: string;
  sourceStart: number;
  duration: number;
  fps: number;
}

interface RawExcerptCaptureSpec {
  episode?: unknown;
  sourceStart?: unknown;
  duration?: unknown;
  fps?: unknown;
}

function readSpec(path: string): ExcerptCaptureSpec {
  const raw: unknown = JSON.parse(readFileSync(path, "utf8"));
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) throw new Error("excerpt spec must be an object");
  const value = raw as RawExcerptCaptureSpec;
  if (typeof value.episode !== "string" || value.episode.length === 0 ||
      typeof value.sourceStart !== "number" || !Number.isFinite(value.sourceStart) || value.sourceStart < 0 ||
      typeof value.duration !== "number" || !Number.isFinite(value.duration) || value.duration <= 0 ||
      value.fps !== FPS) {
    throw new Error("excerpt spec requires episode, nonnegative sourceStart, positive duration, and fps 30");
  }
  return { episode: value.episode, sourceStart: value.sourceStart, duration: value.duration, fps: FPS };
}

async function capture(spec: ExcerptCaptureSpec, outputPath: string, port: number): Promise<void> {
  if (existsSync(outputPath)) throw new Error(`refusing to overwrite excerpt video: ${outputPath}`);
  const frames = Math.round(spec.duration * FPS);
  if (Math.abs(frames / FPS - spec.duration) > 1e-6) throw new Error("excerpt duration must lie on the 30-fps frame grid");
  mkdirSync(dirname(outputPath), { recursive: true });
  const server = await startServer(port);
  let session: PlayerSession | undefined;
  let encoder: ReturnType<typeof spawn> | undefined;
  try {
    session = await PlayerSession.open(port, spec.episode, undefined);
    if (session.info.missingScenes.length > 0) throw new Error(`scene files not implemented: ${session.info.missingScenes.join(", ")}`);
    if (spec.sourceStart + spec.duration > session.info.duration + 1e-6) {
      throw new Error(`excerpt interval ends at ${spec.sourceStart + spec.duration}, episode ends at ${session.info.duration}`);
    }
    encoder = spawn("ffmpeg", ["-hide_banner", "-loglevel", "error", "-n", "-f", "image2pipe", "-framerate",
      String(FPS), "-c:v", "mjpeg", "-i", "-", ...X264_ARGS, "-r", String(FPS), outputPath],
    { stdio: ["pipe", "inherit", "inherit"] });
    const ff = encoder;
    const stdin = ff.stdin;
    if (!stdin) throw new Error("ffmpeg stdin is unavailable");
    const encoderDone = new Promise<void>((resolveDone, rejectDone) => {
      ff.once("error", rejectDone);
      ff.once("close", (code) => code === 0 ? resolveDone() : rejectDone(new Error(`ffmpeg exit ${code}`)));
    });
    for (let frame = 0; frame < frames; frame++) {
      await session.renderAt(spec.sourceStart + frame / FPS);
      const jpeg = await session.jpeg(JPEG_QUALITY);
      if (!stdin.write(jpeg)) await new Promise<void>((resolveDrain) => stdin.once("drain", resolveDrain));
      if ((frame + 1) % 300 === 0 || frame + 1 === frames) {
        console.log(`[capture-excerpt] ${spec.episode}: ${frame + 1}/${frames} frames`);
      }
    }
    stdin.end();
    await encoderDone;
  } catch (error: unknown) {
    if (encoder && encoder.exitCode === null) encoder.kill("SIGKILL");
    rmSync(outputPath, { force: true });
    throw error;
  } finally {
    if (session) await session.close();
    await server.close();
  }
}

async function main(): Promise<void> {
  const { values } = parseArgs({ options: {
    spec: { type: "string" }, out: { type: "string" }, port: { type: "string", default: "5300" },
  } });
  if (!values.spec || !values.out) throw new Error("--spec and --out are required");
  const spec = readSpec(resolve(values.spec));
  await capture(spec, resolve(values.out), Number(values.port));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
