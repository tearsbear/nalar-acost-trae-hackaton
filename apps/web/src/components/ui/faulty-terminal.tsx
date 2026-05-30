"use client"

import { useEffect, useRef } from "react"
import { Renderer, Program, Mesh, Triangle } from "ogl"

interface FaultyTerminalProps {
  tint?: string
  scale?: number
  digitSize?: number
  timeScale?: number
  scanlineIntensity?: number
  glitchAmount?: number
  flickerAmount?: number
  noiseAmp?: number
  curvature?: number
  brightness?: number
  mouseReact?: boolean
  mouseStrength?: number
  className?: string
}

const VERT = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const FRAG = `
precision highp float;
varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uTint;
uniform float uScale;
uniform float uDigitSize;
uniform float uTimeScale;
uniform float uScanline;
uniform float uGlitch;
uniform float uFlicker;
uniform float uNoise;
uniform float uCurvature;
uniform float uBrightness;
uniform vec2 uMouse;
uniform float uMouseStrength;

float rand(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = rand(i);
  float b = rand(i + vec2(1.0, 0.0));
  float c = rand(i + vec2(0.0, 1.0));
  float d = rand(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float digit(vec2 uv, float t) {
  vec2 g = fract(uv) - 0.5;
  float n = rand(floor(uv) + floor(t * 4.0));
  float v = step(0.3, abs(g.x)) + step(0.3, abs(g.y));
  v = 1.0 - clamp(v, 0.0, 1.0);
  return v * step(0.3, n);
}

void main() {
  vec2 uv = vUv;

  if (uCurvature > 0.0) {
    vec2 c = uv * 2.0 - 1.0;
    c *= 1.0 + uCurvature * dot(c, c);
    uv = c * 0.5 + 0.5;
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }
  }

  vec2 mouse = uMouse * uMouseStrength * 0.05;
  uv += mouse * (1.0 - length(uv - 0.5));

  float t = uTime * uTimeScale;

  float glitchLine = step(0.998, rand(vec2(floor(t * 8.0), 0.0)));
  float glitchY = rand(vec2(floor(t * 8.0), 1.0));
  float glitchOffset = (rand(vec2(floor(t * 8.0), 2.0)) - 0.5) * 0.04 * uGlitch;
  if (glitchLine > 0.0 && abs(uv.y - glitchY) < 0.02) {
    uv.x += glitchOffset;
  }

  float aspect = uResolution.x / uResolution.y;
  vec2 grid = uv * uScale * vec2(aspect * 2.0, 1.0) * uDigitSize;

  float d = digit(grid, t);
  float d2 = digit(grid * 0.5 + vec2(0.3, 0.7), t * 0.7);
  float d3 = digit(grid * 0.25 + vec2(0.6, 0.2), t * 0.4);

  float pattern = d * 0.6 + d2 * 0.3 + d3 * 0.1;

  float n = noise(uv * 8.0 + t * 0.3) * uNoise;
  pattern += n * 0.15;

  float scanline = sin(uv.y * uResolution.y * 0.5) * 0.5 + 0.5;
  pattern *= mix(1.0, scanline, uScanline * 0.3);

  float flicker = 1.0 - uFlicker * 0.05 * rand(vec2(floor(t * 20.0), 0.0));
  pattern *= flicker;

  pattern *= uBrightness;
  pattern = clamp(pattern, 0.0, 1.0);

  gl_FragColor = vec4(uTint * pattern, 1.0);
}
`

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return [r, g, b]
}

export function FaultyTerminal({
  tint = "#ffffff",
  scale = 1.5,
  digitSize = 1.2,
  timeScale = 0.5,
  scanlineIntensity = 0.5,
  glitchAmount = 1,
  flickerAmount = 1,
  noiseAmp = 1,
  curvature = 0.1,
  brightness = 0.6,
  mouseReact = true,
  mouseStrength = 0.5,
  className = "",
}: FaultyTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef<[number, number]>([0, 0])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new Renderer({ alpha: false, antialias: false })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 1)
    container.appendChild(gl.canvas)

    const geometry = new Triangle(gl)
    const rgb = hexToRgb(tint)

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [gl.canvas.width, gl.canvas.height] },
        uTint: { value: rgb },
        uScale: { value: scale },
        uDigitSize: { value: digitSize },
        uTimeScale: { value: timeScale },
        uScanline: { value: scanlineIntensity },
        uGlitch: { value: glitchAmount },
        uFlicker: { value: flickerAmount },
        uNoise: { value: noiseAmp },
        uCurvature: { value: curvature },
        uBrightness: { value: brightness },
        uMouse: { value: [0, 0] },
        uMouseStrength: { value: mouseStrength },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })

    function resize() {
      renderer.setSize(container!.offsetWidth, container!.offsetHeight)
      program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height]
    }

    const ro = new ResizeObserver(resize)
    ro.observe(container)
    resize()

    function onMouseMove(e: MouseEvent) {
      if (!mouseReact) return
      const rect = container!.getBoundingClientRect()
      mouseRef.current = [
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -(((e.clientY - rect.top) / rect.height) * 2 - 1),
      ]
    }

    window.addEventListener("mousemove", onMouseMove)

    let raf: number
    const start = performance.now()

    function loop() {
      raf = requestAnimationFrame(loop)
      program.uniforms.uTime.value = (performance.now() - start) / 1000
      program.uniforms.uMouse.value = mouseRef.current
      renderer.render({ scene: mesh })
    }

    loop()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener("mousemove", onMouseMove)
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas)
      gl.getExtension("WEBGL_lose_context")?.loseContext()
    }
  }, [tint, scale, digitSize, timeScale, scanlineIntensity, glitchAmount, flickerAmount, noiseAmp, curvature, brightness, mouseReact, mouseStrength])

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ zIndex: 0 }}
    />
  )
}
