# 27 — AI Copilot & Intelligent Assistant Interface UI/UX Specification

- **Document Version**: 1.0.0
- **Status**: Production Specification
- **Target Audience**: AI Product Designers, Frontend Engineers, Conversational UX Architects
- **Cross-References**: `09_Component_Library.md`, `10_Layout_System.md`, `11_Navigation_System.md`

---

## 1. Purpose

This document specifies the UI/UX architecture for the AI Copilot Module. It covers the Slide-over AI Side Panel, Streaming Response Bubbles, Prompt Shortcut Pills, Context-Aware Page Summaries, and Human-in-the-Loop Confirmation Triggers.

---

## 2. Executive Overview

Awais HR integrates a contextual AI Copilot assistant that aids HR administrators, recruiters, and managers. The AI Copilot can summarize candidate resumes, draft policy documents, generate job descriptions, and query complex SQL analytics using natural language.

---

## 3. Detailed Specifications

### 3.1 AI Copilot Side Panel Anatomy

```
┌────────────────────────────────────────────────────────────────────────┐
│ AWAIS HR AI COPILOT  [✨ Sparkles Badge]                 [ Close ✕ ]   │
├────────────────────────────────────────────────────────────────────────┤
│ Context: Viewing Employee Profile — Sarah Jenkins (Lead Developer)     │
├────────────────────────────────────────────────────────────────────────┤
│ 👤 USER: Summarize Sarah's attendance and leave history for Q3.        │
│                                                                        │
│ ✨ COPILOT: [ Streaming response... ]                                  │
│ Sarah maintained 98.4% attendance in Q3 with zero unexcused absences.  │
│ She took 3 days of vacation leave (Aug 14-16) which was approved.      │
│                                                                        │
│ [ 📋 Copy Summary ]  [ ✉️ Email to Manager ]  [ 🔄 Regenerate ]        │
├────────────────────────────────────────────────────────────────────────┤
│ PROMPT SUGGESTIONS:                                                    │
│ [ "Draft Performance Review" ]  [ "Check Salary Band Compliance" ]     │
├────────────────────────────────────────────────────────────────────────┤
│ [ Ask AI Copilot anything about Sarah or HR policies...   ] [ Send ⬆️ ]│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Design Decisions & Rationale

- **Context-Aware Initial Prompt Suggestions**: When the user opens AI Copilot on the Payroll page, suggested prompts auto-adapt to payroll topics (e.g., *"Summarize tax variance for this month"*). On an ATS page, prompts adapt to recruitment (e.g., *"Generate interview questions for Senior Frontend Engineer"*).
- **Human Confirmation Guard for Actions**: AI Copilot can draft emails or stage database updates, but it can **never** execute an action automatically without an explicit user button click (`[ Confirm & Execute ]`).

---

## 5. Examples & Implementation Contracts

```jsx
// AI Chat Message Bubble Component Contract
export function AIChatBubble({ sender, message, isStreaming, actionButtons }) {
  const isAI = sender === 'copilot';

  return (
    <div className={`flex gap-3 ${isAI ? 'bg-[var(--bg-surface-l2)]/60' : 'bg-transparent'} p-4 rounded-xl border border-[var(--border-subtle)]`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${isAI ? 'bg-gradient-to-tr from-indigo-500 to-purple-500 text-white' : 'bg-gray-700 text-white'}`}>
        {isAI ? '✨' : '👤'}
      </div>
      <div className="flex-1 overflow-hidden text-xs leading-relaxed text-[var(--text-primary)]">
        <div className="font-bold text-[11px] text-[var(--text-secondary)] mb-1">{isAI ? 'Awais HR AI Copilot' : 'You'}</div>
        <p className="whitespace-pre-wrap">{message}</p>
        {isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-[var(--accent-primary)] animate-pulse" />}
        {actionButtons && <div className="flex gap-2 mt-3 pt-2 border-t border-[var(--border-subtle)]">{actionButtons}</div>}
      </div>
    </div>
  );
}
```

---

## 6. Best Practices

- **Differentiate AI Generated Content**: Always label AI-generated summaries or drafted text with a distinct gradient border and sparkler icon (`✨`).
- **Support Instant Cancellation**: Allow users to stop streaming responses immediately with a `[ Stop Generating ]` button.

---

## 7. Future Considerations

- **Voice Input Commands**: Speech-to-text integration enabling voice-activated hands-free query navigation.
