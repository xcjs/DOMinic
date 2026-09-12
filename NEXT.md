---
type: Roadmap
title: DOMinic Post-Hackathon Roadmap
description: Out-of-scope features, enhancements, and long-term vision beyond the hackathon POC.
tags: [roadmap, future]
generated: { by: agent/pi, at: 2026-09-12T00:00:00Z }
verified: { by: human:charles, at: 2026-09-12T00:00:00Z }
---

# DOMinic: Post-Hackathon Roadmap (NEXT)

This document collects architectural features, security hardening, and
platform enhancements deliberately deferred from the Hackathon Proof of
Concept to protect delivery velocity.

---

## 1. Security & Isolation

- **Sandboxed `<iframe>` Execution**: Isolate agent-authored Vue
  components inside sandboxed iframes using a lightweight RPC bridge
  (`postMessage`) to prevent rogue scripts from accessing host window
  cookies, parent DOM, or host OS Pinia stores.
- **Automated NPM Dependency Vetting Gate**: Complete ADR 0008 by querying
  the npm registry API and advisory databases (audit) before allowing
  dynamic CDN loading. Score packages based on age, download volume, and
  known CVEs.
- **Content Security Policy (CSP)**: Implement a strict CSP that limits
  dynamic script injection and network connections to approved CDN and
  API domains.
- **Server Proxy SSRF Hardening**: Add IP blocklists (disallowing
  RFC 1918 private subnets and cloud metadata endpoints) to `/api/proxy`
  to ensure safe public hosting.

---

## 2. Operating System & Shell

- **Mobile-First Responsive Shell**: Deliver the adaptive UI designed in
  ADR 0004: degrade the desktop window manager into a mobile-friendly
  stacked card view or bottom-sheet drawer on viewport widths below 768px.
- **Window Snapping & Tiling**: Add edge-snapping (left/right half-screen,
  corner quadrants) and maximize gestures familiar to desktop OS users.
- **Multi-Desktop Workspaces**: Support multiple virtual desktops
  (Workspaces) allowing users to organize applications by project or
  context.
- **System Notification Center**: A shared OS notification bus allowing
  apps and the agent to post toast notifications and system alerts.

---

## 3. Storage & Persistence (VFS)

- **Pluggable Multi-Driver VFS**: Implement the dual-driver architecture
  from ADR 0007, routing small config files to localStorage and large app
  bundles/assets to IndexedDB or OPFS (Origin Private File System).
- **File System Access API Integration**: Allow users to mount a local
  directory on their real computer into DOMinic's virtual file system.
- **Snapshot Export & Import**: One-click export of the entire OS state
  (installed apps, chat sessions, settings) as a downloadable zip archive
  or JSON bundle.

---

## 4. Agent Capabilities & Developer Experience

- **Interactive Code Diff Approval**: When modifying an existing app,
  render a side-by-side or unified code diff in the chat thread allowing
  the user to review changes before mounting.
- **Error Auto-Healing Loop**: If a runtime component throws an error
  caught by the error boundary, automatically invoke the agent with the
  stack trace to patch the code without user intervention.
- **App-to-App Inter-Process Communication (IPC)**: Provide an OS event
  bus and shared data contract so agent-authored apps can communicate
  (e.g., a Timer app triggering a notification in a Todo app).
- **P2P App Sharing**: Allow users to share installed apps with other
  DOMinic instances via WebRTC or QR codes.

---

## 5. Toolchain & Quality Gates

- **Type-Checked Pre-Commit CI**: Restore strict `vue-tsc --noEmit` and
  typechecked ESLint flat config in the pre-commit workflow once the rapid
  hackathon prototyping phase concludes.
- **Automated Component Testing**: Agent-generated unit tests that verify
  authored SFC functionality in-browser before app installation.
