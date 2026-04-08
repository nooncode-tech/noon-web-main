import type { CSSProperties } from "react";

function getFloatingAnimationStyle({
  name,
  duration,
  delay,
  timingFunction = "linear",
  direction,
}: {
  name: string;
  duration: string;
  delay: number;
  timingFunction?: string;
  direction?: CSSProperties["animationDirection"];
}): CSSProperties {
  return {
    animationName: name,
    animationDuration: duration,
    animationTimingFunction: timingFunction,
    animationDelay: `${delay}ms`,
    animationIterationCount: "infinite",
    animationDirection: direction ?? "normal",
  };
}

function createBinarySequence(seed: number, length = 20) {
  let state = seed % 2147483647;
  if (state <= 0) {
    state += 2147483646;
  }

  return Array.from({ length }, () => {
    state = (state * 48271) % 2147483647;
    return state % 2 === 0 ? "0" : "1";
  }).join("");
}

// Floating code snippets that drift across the screen
function FloatingCodeSnippet({ 
  code, 
  x, 
  y, 
  delay,
  direction = "up"
}: { 
  code: string; 
  x: number; 
  y: number; 
  delay: number;
  direction?: "up" | "down";
}) {
  return (
    <div
      className="absolute font-mono text-[10px] lg:text-xs text-foreground/[0.04] whitespace-pre pointer-events-none select-none opacity-100"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        ...getFloatingAnimationStyle({
          name: `float-${direction}`,
          duration: "40s",
          delay,
        }),
      }}
    >
      {code}
    </div>
  );
}

// Architecture diagram node
function ArchitectureNode({
  x,
  y,
  label,
  size = "md"
}: {
  x: number;
  y: number;
  label: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "w-16 h-8 text-[8px]",
    md: "w-20 h-10 text-[9px]",
    lg: "w-24 h-12 text-[10px]"
  };

  return (
    <div
      className="absolute pointer-events-none select-none opacity-100"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className={`${sizes[size]} rounded-lg border border-foreground/[0.05] bg-foreground/[0.015] flex items-center justify-center`}>
        <span className="font-mono text-foreground/[0.08] tracking-tight">{label}</span>
      </div>
    </div>
  );
}

// Binary data stream
function BinaryStream({ x, delay }: { x: number; delay: number }) {
  const binarySequence = createBinarySequence(Math.round(x * 1000) + delay);

  return (
    <div
      className="absolute font-mono text-[8px] text-foreground/[0.025] pointer-events-none select-none opacity-100"
      style={{
        left: `${x}%`,
        top: '-5%',
        writingMode: 'vertical-lr',
        ...getFloatingAnimationStyle({
          name: "binary-fall",
          duration: "20s",
          delay,
        }),
      }}
    >
      {binarySequence}
    </div>
  );
}

// Floating brackets and symbols
function FloatingSymbol({ 
  symbol, 
  x, 
  y, 
  delay,
  size = "md"
}: { 
  symbol: string; 
  x: number; 
  y: number; 
  delay: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl"
  };

  return (
    <div
      className={`absolute font-mono ${sizes[size]} text-foreground/[0.025] pointer-events-none select-none opacity-100`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        ...getFloatingAnimationStyle({
          name: "float-gentle",
          duration: "15s",
          delay,
          timingFunction: "ease-in-out",
        }),
      }}
    >
      {symbol}
    </div>
  );
}

// Main component that orchestrates all floating elements
export function FloatingTechElements() {
  const codeSnippets = [
    { code: "async function deploy() {\n  await build();\n  return success;\n}", x: 5, y: 15, delay: 0 },
    { code: "const API = {\n  endpoint: '/v1',\n  auth: true\n}", x: 86, y: 28, delay: 2000 },
    { code: "interface User {\n  id: string;\n  role: 'admin';\n}", x: 8, y: 55, delay: 4000 },
    { code: "type Response<T> =\n  Promise<Result<T>>", x: 4, y: 84, delay: 8000 },
  ];

  const architectureNodes = [
    { x: 92, y: 12, label: "API", delay: 1000, size: "sm" as const },
    { x: 4, y: 35, label: "DATABASE", delay: 1500, size: "md" as const },
    { x: 6, y: 72, label: "AUTH", delay: 2500, size: "sm" as const },
    { x: 88, y: 82, label: "CDN", delay: 3000, size: "sm" as const },
  ];

  const symbols = [
    { symbol: "{ }", x: 15, y: 20, delay: 500, size: "md" as const },
    { symbol: "< />", x: 82, y: 35, delay: 1200, size: "md" as const },
    { symbol: "[ ]", x: 12, y: 60, delay: 1800, size: "sm" as const },
    { symbol: "=>", x: 85, y: 55, delay: 2400, size: "md" as const },
    { symbol: "&&", x: 90, y: 92, delay: 3600, size: "sm" as const },
  ];

  const binaryStreams = [
    { x: 25, delay: 0 },
    { x: 58, delay: 6000 },
    { x: 92, delay: 12000 },
  ];

  return (
    <div className="hidden lg:block fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Code snippets */}
      {codeSnippets.map((snippet, i) => (
        <FloatingCodeSnippet
          key={`code-${i}`}
          code={snippet.code}
          x={snippet.x}
          y={snippet.y}
          delay={snippet.delay}
          direction={i % 2 === 0 ? "up" : "down"}
        />
      ))}

      {/* Architecture nodes */}
      {architectureNodes.map((node, i) => (
        <ArchitectureNode
          key={`node-${i}`}
          x={node.x}
          y={node.y}
          label={node.label}
          size={node.size}
        />
      ))}

      {/* Floating symbols */}
      {symbols.map((sym, i) => (
        <FloatingSymbol
          key={`sym-${i}`}
          symbol={sym.symbol}
          x={sym.x}
          y={sym.y}
          delay={sym.delay}
          size={sym.size}
        />
      ))}

      {/* Binary streams */}
      {binaryStreams.map((stream, i) => (
        <BinaryStream
          key={`binary-${i}`}
          x={stream.x}
          delay={stream.delay}
        />
      ))}

      {/* Subtle gradient orbs */}
      <div 
        className="absolute w-[520px] h-[520px] rounded-full opacity-[0.012]"
        style={{
          background: 'radial-gradient(circle, var(--foreground) 0%, transparent 70%)',
          left: '-10%',
          top: '20%',
          animation: 'float-gentle 30s ease-in-out infinite',
        }}
      />
      <div 
        className="absolute w-[320px] h-[320px] rounded-full opacity-[0.01]"
        style={{
          background: 'radial-gradient(circle, var(--foreground) 0%, transparent 70%)',
          right: '-5%',
          bottom: '30%',
          animation: 'float-gentle 25s ease-in-out infinite reverse',
        }}
      />
    </div>
  );
}
