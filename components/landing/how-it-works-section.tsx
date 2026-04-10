"use client";

import { memo, useEffect, useRef, useState } from "react";
import { MessageSquare, Layers, Box, FileText, CreditCard, Rocket } from "lucide-react";
import { useRevealOnView } from "@/hooks/use-reveal-on-view";
import { siteChromeDots } from "@/lib/site-tones";

const howItWorksTheme = {
  base: "#000000",
  panel: "rgba(255, 255, 255, 0.026)",
  panelStrong: "rgba(255, 255, 255, 0.038)",
  panelCurrent: "rgba(255, 255, 255, 0.052)",
  panelSoft: "rgba(255, 255, 255, 0.016)",
  border: "rgba(215, 227, 252, 0.14)",
  borderStrong: "rgba(236, 242, 255, 0.22)",
  line: "rgba(229, 236, 252, 0.12)",
  lineStrong: "rgba(246, 249, 255, 0.64)",
  textPrimary: "rgba(248, 250, 255, 0.98)",
  textSecondary: "rgba(220, 230, 248, 0.74)",
  textMuted: "rgba(181, 196, 223, 0.52)",
  textFaint: "rgba(150, 166, 196, 0.36)",
  nodeCurrentBg: "#eef3fb",
  nodeCurrentFg: "#000000",
  nodeActiveBg: "rgba(255, 255, 255, 0.11)",
  nodeActiveFg: "rgba(243, 246, 255, 0.9)",
  nodeIdleBg: "rgba(255, 255, 255, 0.05)",
  nodeIdleFg: "rgba(158, 176, 214, 0.46)",
  accent: "rgba(214, 226, 252, 0.82)",
  success: "#2cc49a",
  warning: "#f0a127",
  successSoft: "rgba(44, 196, 154, 0.18)",
  warningSoft: "rgba(240, 161, 39, 0.18)",
  grid: "rgba(180, 197, 240, 0.04)",
} as const;

// Technical visualization for each step
const StepVisualization = memo(function StepVisualization({ stepIndex, isActive }: { stepIndex: number; isActive: boolean }) {
  const visualizations = [
    // Step 1: Chat conversation animation
    <ChatVisualization key="chat" isActive={isActive} />,
    // Step 2: Requirements mapping
    <RequirementsVisualization key="requirements" isActive={isActive} />,
    // Step 3: Prototype preview
    <PrototypeVisualization key="prototype" isActive={isActive} />,
    // Step 4: Proposal breakdown
    <ProposalVisualization key="proposal" isActive={isActive} />,
    // Step 5: Commercial activation
    <ActivationVisualization key={`activation-${isActive ? "active" : "inactive"}`} isActive={isActive} />,
    // Step 6: Delivery pipeline
    <DeliveryVisualization key={`delivery-${isActive ? "active" : "inactive"}`} isActive={isActive} />,
  ];

  return visualizations[stepIndex];
});

// Chat conversation with typing animation
function ChatVisualization({ isActive }: { isActive: boolean }) {
  const chatMessages = [
    { type: "user", text: "I need an app to manage..." },
    { type: "assistant", text: "I understand. Let me help..." },
    { type: "user", text: "With real-time analytics" },
  ];

  return (
    <div className={`flex h-full flex-col ${isActive ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
      <div
        className="min-h-0 flex-1 rounded-[10px] border p-3"
        style={{ backgroundColor: howItWorksTheme.panelStrong, borderColor: howItWorksTheme.border }}
      >
        <div className="flex h-full flex-col">
          <div className="mb-2 flex items-center gap-2 border-b pb-2" style={{ borderColor: howItWorksTheme.line }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: howItWorksTheme.success }} />
            <span className="text-xs font-mono" style={{ color: howItWorksTheme.textMuted }}>Maxwell Chat</span>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-2.5 pt-1">
            {chatMessages.map((message, i) => (
              <div
                key={message.text}
                className={`flex transition-all duration-500 ${
                  message.type === "user" ? "justify-end" : "justify-start"
                } ${
                  isActive
                    ? "opacity-100 translate-x-0"
                    : message.type === "user"
                    ? "opacity-0 translate-x-3"
                    : "opacity-0 -translate-x-3"
                }`}
                style={{ transitionDelay: `${i * 140}ms` }}
              >
                <div
                  className={`max-w-[72%] rounded-lg border px-3 py-1.5 text-xs leading-tight ${
                    message.type === "user" ? "ml-auto" : "mr-auto"
                  }`}
                  style={
                    message.type === "user"
                      ? {
                          backgroundColor: "rgba(235, 242, 255, 0.14)",
                          borderColor: howItWorksTheme.borderStrong,
                          color: howItWorksTheme.textPrimary,
                        }
                      : {
                          backgroundColor: howItWorksTheme.panelCurrent,
                          borderColor: howItWorksTheme.border,
                          color: howItWorksTheme.textSecondary,
                        }
                  }
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className={`ml-2 mt-2 flex justify-start transition-all duration-500 ${
          isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
        style={{ transitionDelay: "420ms" }}
      >
        <div
          className="flex gap-1 rounded-lg border px-3 py-1.5"
          style={{ backgroundColor: howItWorksTheme.panelCurrent, borderColor: howItWorksTheme.border }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: howItWorksTheme.textFaint }} />
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: howItWorksTheme.textMuted }} />
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: howItWorksTheme.textFaint }} />
        </div>
      </div>
    </div>
  );
}

// Requirements mapping diagram
function RequirementsVisualization({ isActive }: { isActive: boolean }) {
  const nodes = [
    { x: 50, y: 20, label: "Core" },
    { x: 20, y: 50, label: "Auth" },
    { x: 50, y: 50, label: "API" },
    { x: 80, y: 50, label: "DB" },
    { x: 35, y: 80, label: "UI" },
    { x: 65, y: 80, label: "Logic" },
  ];

  return (
    <div
      className={`w-full h-full rounded-[10px] border p-3 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}
      style={{ backgroundColor: howItWorksTheme.panelStrong, borderColor: howItWorksTheme.border }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: howItWorksTheme.accent }} />
        <span className="text-[10px] font-mono" style={{ color: howItWorksTheme.textMuted }}>System Map</span>
      </div>
      <svg className="w-full h-[calc(100%-24px)]" viewBox="0 0 100 100">
        {/* Connection lines */}
        <g className="transition-opacity duration-700">
          <line x1="50" y1="20" x2="20" y2="50" stroke={howItWorksTheme.lineStrong} strokeWidth="0.5" className={`transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "120ms" }} />
          <line x1="50" y1="20" x2="50" y2="50" stroke={howItWorksTheme.lineStrong} strokeWidth="0.5" className={`transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "180ms" }} />
          <line x1="50" y1="20" x2="80" y2="50" stroke={howItWorksTheme.lineStrong} strokeWidth="0.5" className={`transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "240ms" }} />
          <line x1="20" y1="50" x2="35" y2="80" stroke={howItWorksTheme.lineStrong} strokeWidth="0.5" className={`transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "300ms" }} />
          <line x1="50" y1="50" x2="35" y2="80" stroke={howItWorksTheme.lineStrong} strokeWidth="0.5" className={`transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "360ms" }} />
          <line x1="50" y1="50" x2="65" y2="80" stroke={howItWorksTheme.lineStrong} strokeWidth="0.5" className={`transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "420ms" }} />
          <line x1="80" y1="50" x2="65" y2="80" stroke={howItWorksTheme.lineStrong} strokeWidth="0.5" className={`transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "480ms" }} />
        </g>
        {/* Nodes */}
        {nodes.map((node, i) => (
          <g key={i} className={`transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: `${i * 100}ms` }}>
            <rect
              x={node.x - 10}
              y={node.y - 6}
              width="20"
              height="12"
              rx="2"
              fill={howItWorksTheme.panelCurrent}
              stroke={howItWorksTheme.border}
              strokeWidth="0.6"
            />
            <text
              x={node.x}
              y={node.y + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[6px] font-mono"
              fill={howItWorksTheme.textSecondary}
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// Prototype preview with animated UI elements
function PrototypeVisualization({ isActive }: { isActive: boolean }) {
  return (
    <div
      className={`w-full h-full rounded-[10px] border overflow-hidden transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}
      style={{ backgroundColor: howItWorksTheme.panelStrong, borderColor: howItWorksTheme.border }}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 border-b px-3 py-2" style={{ backgroundColor: howItWorksTheme.panelSoft, borderColor: howItWorksTheme.line }}>
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: siteChromeDots.red }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: siteChromeDots.amber }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: siteChromeDots.green }} />
        <div className="flex-1 mx-2">
          <div
            className="flex h-3 items-center rounded px-1.5 text-[6px] font-mono"
            style={{ backgroundColor: howItWorksTheme.panelCurrent, color: howItWorksTheme.textFaint }}
          >
            app.noon.dev
          </div>
        </div>
      </div>
      {/* App preview */}
      <div className="p-3 space-y-2">
        <div className={`h-3 w-20 rounded transition-all duration-500 ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`} style={{ backgroundColor: howItWorksTheme.lineStrong }} />
        <div className={`h-6 w-full rounded transition-all duration-500 ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`} style={{ transitionDelay: "100ms", backgroundColor: howItWorksTheme.panelCurrent }} />
        <div className="grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-8 rounded transition-all duration-500 ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
              style={{ transitionDelay: `${180 + i * 70}ms`, backgroundColor: howItWorksTheme.panelSoft }}
            />
          ))}
        </div>
        <div className="flex gap-1.5">
          <div className={`flex-1 h-4 rounded transition-all duration-500 ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`} style={{ transitionDelay: "360ms", backgroundColor: howItWorksTheme.panelCurrent }} />
          <div className={`w-8 h-4 rounded transition-all duration-500 ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`} style={{ transitionDelay: "440ms", backgroundColor: "rgba(235, 242, 255, 0.16)" }} />
        </div>
        <div className={`h-2 w-16 rounded transition-all duration-500 ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`} style={{ transitionDelay: "520ms", backgroundColor: howItWorksTheme.panelSoft }} />
      </div>
    </div>
  );
}

// Proposal breakdown with animated stats
function ProposalVisualization({ isActive }: { isActive: boolean }) {
  const items = [
    { label: "Features", value: 12, width: 80 },
    { label: "Sprints", value: 4, width: 50 },
    { label: "Team", value: 3, width: 40 },
  ];

  return (
    <div
      className={`w-full h-full rounded-[10px] border p-3 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}
      style={{ backgroundColor: howItWorksTheme.panelStrong, borderColor: howItWorksTheme.border }}
    >
      <div className="flex h-full flex-col">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-mono" style={{ color: howItWorksTheme.textMuted }}>Proposal</span>
          <span className="text-[10px] font-mono" style={{ color: howItWorksTheme.textSecondary }}>Q1 2024</span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-between">
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span style={{ color: howItWorksTheme.textMuted }}>{item.label}</span>
                  <span className="font-mono" style={{ color: howItWorksTheme.textSecondary }}>{item.value}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: howItWorksTheme.panelSoft }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: isActive ? `${item.width}%` : "0%",
                      transitionDelay: `${i * 150}ms`,
                      backgroundColor: howItWorksTheme.accent,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 border-t pt-2" style={{ borderColor: howItWorksTheme.line }}>
            <div className="flex justify-between items-baseline">
              <span className="text-[10px]" style={{ color: howItWorksTheme.textMuted }}>Timeline</span>
              <span className="text-sm font-mono" style={{ color: howItWorksTheme.textPrimary }}>8 weeks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivationVisualization({ isActive }: { isActive: boolean }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const interval = setInterval(() => {
      setStage((prev) => (prev + 1) % 3);
    }, 1600);

    return () => clearInterval(interval);
  }, [isActive]);

  const checkpoints = [
    { label: "Terms", value: "Aligned" },
    { label: "Deposit", value: stage >= 1 ? "Confirmed" : "Pending" },
    { label: "Kickoff", value: stage === 2 ? "Scheduled" : "Queued" },
  ];

  return (
    <div
      className={`w-full h-full rounded-[10px] border p-3 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}
      style={{ backgroundColor: howItWorksTheme.panelStrong, borderColor: howItWorksTheme.border }}
    >
      <div className="mb-3 flex items-center gap-2">
        <div
          className="h-1.5 w-1.5 rounded-full transition-colors duration-300"
          style={{ backgroundColor: stage === 2 ? howItWorksTheme.success : howItWorksTheme.warning }}
        />
        <span className="text-[10px] font-mono" style={{ color: howItWorksTheme.textMuted }}>Activation</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {checkpoints.map((checkpoint, index) => {
          const isComplete = index < stage;
          const isCurrent = index === stage;

          return (
            <div
              key={checkpoint.label}
              className="rounded border px-2 py-2 transition-all duration-300"
              style={
                isComplete
                  ? {
                      backgroundColor: howItWorksTheme.successSoft,
                      borderColor: howItWorksTheme.borderStrong,
                    }
                  : isCurrent
                    ? {
                        backgroundColor: howItWorksTheme.panelCurrent,
                        borderColor: howItWorksTheme.borderStrong,
                      }
                    : {
                        backgroundColor: howItWorksTheme.panelSoft,
                        borderColor: howItWorksTheme.border,
                      }
              }
            >
              <div
                className="text-[9px] font-mono"
                style={{ color: isComplete || isCurrent ? howItWorksTheme.textSecondary : howItWorksTheme.textFaint }}
              >
                {checkpoint.label}
              </div>
              <div
                className="mt-1 text-[10px]"
                style={{ color: isComplete ? howItWorksTheme.success : howItWorksTheme.textPrimary }}
              >
                {checkpoint.value}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="mt-3 rounded border p-2.5"
        style={{ backgroundColor: howItWorksTheme.panelCurrent, borderColor: howItWorksTheme.border }}
      >
        <div className="flex items-center justify-between text-[10px]">
          <span style={{ color: howItWorksTheme.textMuted }}>Payment route</span>
          <span className="font-mono" style={{ color: howItWorksTheme.textSecondary }}>
            {stage >= 1 ? "Initial payment received" : "Awaiting confirmation"}
          </span>
        </div>
        <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ backgroundColor: howItWorksTheme.panelSoft }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${((stage + 1) / checkpoints.length) * 100}%`,
              backgroundColor: stage >= 1 ? howItWorksTheme.success : howItWorksTheme.accent,
            }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[9px]" style={{ color: howItWorksTheme.textMuted }}>
          <span>Scope approved</span>
          <span>Kickoff window</span>
        </div>
      </div>

      <div
        className="mt-3 flex items-center justify-between rounded border px-2.5 py-2 text-[10px]"
        style={{ backgroundColor: howItWorksTheme.panelSoft, borderColor: howItWorksTheme.border }}
      >
        <span style={{ color: howItWorksTheme.textMuted }}>Delivery mode</span>
        <span style={{ color: stage === 2 ? howItWorksTheme.textPrimary : howItWorksTheme.textSecondary }}>
          {stage === 2 ? "Kickoff ready" : "Phased option available"}
        </span>
      </div>
    </div>
  );
}

// Delivery pipeline animation
function DeliveryVisualization({ isActive }: { isActive: boolean }) {
  const [stage, setStage] = useState(0);
  
  useEffect(() => {
    if (!isActive) {
      return;
    }
    
    const interval = setInterval(() => {
      setStage(prev => (prev + 1) % 5);
    }, 1400);
    
    return () => clearInterval(interval);
  }, [isActive]);

  const stages = ["Build", "Test", "Stage", "Deploy", "Live"];

  return (
    <div
      className={`w-full h-full rounded-[10px] border p-3 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}
      style={{ backgroundColor: howItWorksTheme.panelStrong, borderColor: howItWorksTheme.border }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
          style={{ backgroundColor: stage === 4 ? howItWorksTheme.success : howItWorksTheme.warning }}
        />
        <span className="text-[10px] font-mono" style={{ color: howItWorksTheme.textMuted }}>Delivery</span>
      </div>
      
      {/* Pipeline stages */}
      <div className="flex items-center justify-between mb-4">
        {stages.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className="flex h-6 w-6 items-center justify-center rounded text-[8px] font-mono transition-all duration-300"
              style={
                i < stage
                  ? { backgroundColor: howItWorksTheme.successSoft, color: howItWorksTheme.success }
                  : i === stage
                    ? { backgroundColor: howItWorksTheme.panelCurrent, color: howItWorksTheme.textPrimary }
                    : { backgroundColor: howItWorksTheme.panelSoft, color: howItWorksTheme.textFaint }
              }
            >
              {i < stage ? 'OK' : i + 1}
            </div>
            <span
              className="text-[7px] transition-colors duration-300"
              style={{ color: i <= stage ? howItWorksTheme.textSecondary : howItWorksTheme.textFaint }}
            >
              {s}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: howItWorksTheme.panelSoft }}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${(stage / 4) * 100}%`, backgroundColor: howItWorksTheme.accent }}
        />
      </div>

      {/* Terminal output */}
      <div
        className="mt-3 space-y-0.5 rounded border p-2 font-mono text-[8px]"
        style={{
          backgroundColor: howItWorksTheme.panelCurrent,
          borderColor: howItWorksTheme.border,
          color: howItWorksTheme.textMuted,
        }}
      >
        <div className={`transition-opacity duration-300 ${stage >= 0 ? 'opacity-100' : 'opacity-0'}`}>
          $ pnpm build <span style={{ color: howItWorksTheme.success }}>OK</span>
        </div>
        <div className={`transition-opacity duration-300 ${stage >= 1 ? 'opacity-100' : 'opacity-0'}`}>
          $ pnpm test <span style={{ color: howItWorksTheme.success }}>OK</span>
        </div>
        <div className={`transition-opacity duration-300 ${stage >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          $ vercel --prod <span style={{ color: stage >= 3 ? howItWorksTheme.success : howItWorksTheme.warning }}>
            {stage >= 3 ? "OK" : "..."}
          </span>
        </div>
      </div>
    </div>
  );
}

const steps = [
  {
    number: "01",
    icon: MessageSquare,
    title: "Share what you want to build",
    description: "Start with your idea. We use that first input to understand the goal, the type of product, and the core need behind it.",
  },
  {
    number: "02",
    icon: Layers,
    title: "We shape the first direction",
    description: "Maxwell helps turn the idea into a clearer software direction and, when appropriate, a first prototype path.",
  },
  {
    number: "03",
    icon: Box,
    title: "Refine the concept",
    description: "You can review the initial direction and request up to two rounds of refinements before moving forward.",
  },
  {
    number: "04",
    icon: FileText,
    title: "Receive a structured proposal",
    description: "Once the direction is approved, Noon prepares a formal proposal with scope, deliverables, timing, and payment structure.",
  },
  {
    number: "05",
    icon: CreditCard,
    title: "Activate the project",
    description: "Work begins once the project is activated through payment. For larger scopes, execution can move in phases.",
  },
  {
    number: "06",
    icon: Rocket,
    title: "Build, review, and deliver",
    description: "We execute, review internally, and deliver with a production-minded process and post-delivery continuity options when needed.",
  },
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isDesktopViewport, setIsDesktopViewport] = useState<boolean | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const { ref: revealRef, isVisible } = useRevealOnView<HTMLElement>({ threshold: 0.1 });
  const timelineRef = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const frameRef = useRef<number | null>(null);
  const activeStepRef = useRef(0);
  const scrollProgressRef = useRef(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const updateViewport = () => setIsDesktopViewport(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => {
      mediaQuery.removeEventListener("change", updateViewport);
    };
  }, []);

  // Scroll-based progress for the connecting line
  useEffect(() => {
    const updateTimeline = () => {
      frameRef.current = null;

      if (!timelineRef.current || !sectionRef.current) return;
      
      const sectionRect = sectionRef.current.getBoundingClientRect();
      const sectionTop = sectionRect.top;
      const sectionHeight = sectionRect.height;
      const windowHeight = window.innerHeight;
      
      // Calculate progress based on section visibility
      const progress = Math.max(0, Math.min(1, 
        (windowHeight - sectionTop) / (sectionHeight + windowHeight * 0.5)
      ));
      
      if (Math.abs(progress - scrollProgressRef.current) > 0.01) {
        scrollProgressRef.current = progress;
        if (progressLineRef.current) {
          progressLineRef.current.style.height = `${progress * 100}%`;
        }
      }
      
      const viewportAnchor = windowHeight * 0.62;
      let nextStepIndex = -1;
      let closestDistance = Number.POSITIVE_INFINITY;

      stepRefs.current.forEach((stepNode, index) => {
        if (!stepNode) {
          return;
        }

        const rect = stepNode.getBoundingClientRect();
        const isInViewBand = rect.bottom > windowHeight * 0.18 && rect.top < windowHeight * 0.88;
        if (!isInViewBand) {
          return;
        }

        const stepCenter = rect.top + rect.height / 2;
        const distance = Math.abs(stepCenter - viewportAnchor);
        if (distance < closestDistance) {
          closestDistance = distance;
          nextStepIndex = index;
        }
      });

      if (nextStepIndex === -1) {
        nextStepIndex = Math.min(
        Math.floor(progress * steps.length),
        steps.length - 1
        );
      }

      if (nextStepIndex !== activeStepRef.current) {
        activeStepRef.current = nextStepIndex;
        setActiveStep(nextStepIndex);
      }
    };

    const handleScroll = () => {
      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(updateTimeline);
    };

    updateTimeline();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <section
      id="how-it-works"
      ref={(node) => {
        sectionRef.current = node;
        revealRef.current = node;
      }}
      className="relative z-[2] py-20 lg:py-24 text-background overflow-hidden"
      style={{ backgroundColor: howItWorksTheme.base, color: howItWorksTheme.textPrimary }}
    >
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-12 lg:mb-16 text-center">
          <span className="mb-6 inline-flex items-center gap-3 text-sm font-mono" style={{ color: howItWorksTheme.textMuted }}>
            <span className="w-8 h-px" style={{ backgroundColor: howItWorksTheme.borderStrong }} />
            How it works
            <span className="w-8 h-px" style={{ backgroundColor: howItWorksTheme.borderStrong }} />
          </span>
          <h2
            className={`text-3xl lg:text-4xl font-display tracking-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ color: howItWorksTheme.textPrimary }}
          >
            From conversation to software.
            <br />
            <span style={{ color: howItWorksTheme.textSecondary }}>A clear path forward.</span>
          </h2>
        </div>

        {/* Timeline Container */}
        <div ref={timelineRef} className="relative">
          {/* Central vertical line - Desktop */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2">
            {/* Background line */}
            <div className="absolute inset-0" style={{ backgroundColor: howItWorksTheme.line }} />
            {/* Progress line */}
            <div 
              ref={progressLineRef}
              className="absolute top-0 left-0 w-full transition-[height] duration-200 ease-out"
              style={{ height: "0%", backgroundColor: howItWorksTheme.lineStrong }}
            />
          </div>

          {/* Steps */}
          <div className="relative space-y-14 lg:space-y-20">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep >= index;
              const isCurrentStep = activeStep === index;
              const panelStyle = isCurrentStep
                ? {
                    backgroundColor: howItWorksTheme.panelCurrent,
                    borderColor: howItWorksTheme.borderStrong,
                    boxShadow: "0 28px 52px -40px rgba(0, 0, 0, 0.68)",
                  }
                : isActive
                  ? {
                      backgroundColor: howItWorksTheme.panel,
                      borderColor: howItWorksTheme.border,
                      boxShadow: "0 22px 42px -36px rgba(0, 0, 0, 0.52)",
                    }
                  : {
                      backgroundColor: howItWorksTheme.panelSoft,
                      borderColor: "rgba(156, 180, 242, 0.1)",
                    };
              const stepLabelColor = isCurrentStep
                ? howItWorksTheme.accent
                : isActive
                  ? howItWorksTheme.textMuted
                  : howItWorksTheme.textFaint;
              const stepTitleColor = isCurrentStep
                ? howItWorksTheme.textPrimary
                : isActive
                  ? howItWorksTheme.textSecondary
                  : "rgba(186, 199, 232, 0.66)";
              const stepDescriptionColor = isCurrentStep
                ? howItWorksTheme.textSecondary
                : isActive
                  ? howItWorksTheme.textMuted
                  : "rgba(163, 177, 211, 0.44)";
              const nodeStyle = isCurrentStep
                ? {
                    backgroundColor: howItWorksTheme.nodeCurrentBg,
                    color: howItWorksTheme.nodeCurrentFg,
                    boxShadow: "0 18px 36px -22px rgba(0, 0, 0, 0.55)",
                  }
                : isActive
                  ? {
                      backgroundColor: howItWorksTheme.nodeActiveBg,
                      color: howItWorksTheme.nodeActiveFg,
                      border: `1px solid ${howItWorksTheme.borderStrong}`,
                    }
                  : {
                      backgroundColor: howItWorksTheme.nodeIdleBg,
                      color: howItWorksTheme.nodeIdleFg,
                      border: "1px solid rgba(156, 180, 242, 0.12)",
                    };

              return (
                <div
                  key={step.number}
                  ref={(node) => {
                    stepRefs.current[index] = node;
                  }}
                  className={`relative transition-all duration-700 ${
                    isVisible ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {isDesktopViewport ? (
                    <div className="grid grid-cols-[minmax(0,1fr)_5.5rem_minmax(0,1fr)] items-center gap-8">
                      {/* Left content */}
                      <div className="min-w-0">
                        <div
                          className="rounded-[10px] border p-4 text-left transition-all duration-500 lg:p-5"
                          style={panelStyle}
                        >
                          <span className="font-mono text-xs" style={{ color: stepLabelColor }}>
                            Step {step.number}
                          </span>
                          <h3 className="mb-3 mt-2 text-lg font-display lg:text-xl" style={{ color: stepTitleColor }}>{step.title}</h3>
                          <p className="text-sm leading-relaxed" style={{ color: stepDescriptionColor }}>{step.description}</p>
                        </div>
                      </div>

                      {/* Center rail node */}
                      <div
                        className={`relative flex min-h-[11rem] items-center justify-center transition-all duration-500 ${
                          isActive ? "opacity-100" : "opacity-55"
                        }`}
                      >
                        <div className="pointer-events-none relative">
                          <div
                            className="flex h-14 w-14 items-center justify-center rounded-[10px] transition-all duration-500"
                            style={nodeStyle}
                          >
                            <Icon className="h-6 w-6" />
                          </div>

                          {isCurrentStep && (
                            <div
                              className="absolute -inset-1.5 rounded-[10px] border"
                              style={{ borderColor: howItWorksTheme.borderStrong }}
                            />
                          )}
                        </div>
                      </div>

                      {/* Right content */}
                      <div className="min-w-0">
                        <div className={`h-44 min-w-0 transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-45'}`}>
                          <StepVisualization stepIndex={index} isActive={isCurrentStep} />
                        </div>
                      </div>
                    </div>
                  ) : isDesktopViewport === false ? (
                    <div className="flex gap-4">
                      {/* Left line and node */}
                      <div className="flex flex-col items-center">
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] transition-all duration-300"
                          style={nodeStyle}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        {index < steps.length - 1 && (
                          <div className="my-2 w-px flex-1" style={{ backgroundColor: howItWorksTheme.line }}>
                            <div 
                              className="w-full transition-all duration-500"
                              style={{ 
                                height: isActive ? "100%" : "0%",
                                backgroundColor: howItWorksTheme.lineStrong,
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div
                        className={`flex-1 pb-7 transition-opacity duration-300 ${
                          isActive ? "opacity-100" : "opacity-50"
                        }`}
                      >
                        <span className="font-mono text-xs" style={{ color: stepLabelColor }}>
                          Step {step.number}
                        </span>
                        <h3 className="mb-2 mt-1 text-lg font-display" style={{ color: stepTitleColor }}>{step.title}</h3>
                        <p className="mb-4 text-sm leading-relaxed" style={{ color: stepDescriptionColor }}>
                          {step.description}
                        </p>
                        {/* Mobile visualization */}
                        <div className="h-40">
                          <StepVisualization stepIndex={index} isActive={isCurrentStep} />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

        </div>

        {/* Bottom CTA */}
        <div 
          className={`mt-14 lg:mt-20 text-center transition-all duration-700 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="font-mono text-sm" style={{ color: howItWorksTheme.textMuted }}>
            Ready to start? Tell Maxwell your idea.
          </p>
        </div>
      </div>
    </section>
  );
}

