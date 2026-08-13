import { Bot, Link2, Brain, Database, Wrench, Shield } from "@lucide/svelte";

const features = [
  {
    title: "Autonomous agents",
    description: "Deploy self-sufficient AI agents that can work 24/7 without supervision.",
    icon: Bot,
  },
  {
    title: "Multi-step planning",
    description: "Break down complex goals into actionable steps with intelligent planning.",
    icon: Link2,
  },
  {
    title: "Advanced reasoning",
    description: "Leverage state-of-the-art language models for intelligent decision-making.",
    icon: Brain,
  },
  {
    title: "Memory & context",
    description: "Persistent memory allows agents to learn and improve over time.",
    icon: Database,
  },
  {
    title: "Tool integration",
    description: "Connect to thousands of APIs and services seamlessly.",
    icon: Wrench,
  },
  {
    title: "Enterprise Security",
    description: "Bank-level encryption and compliance with SOC2, GDPR and HIPAA.",
    icon: Shield,
  },
];

export default features;