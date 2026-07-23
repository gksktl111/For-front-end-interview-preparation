---
name: frontend-practice-architecture
description: Create or extend React and Next.js practice playground architecture for interview-study labs. Use when Codex needs to add or reorganize frontend practice examples with landing → week → day → practice routing, route metadata, and example pages whose UI structure fits the concept being taught.
---

# Frontend Practice Architecture

## Purpose

Build React or Next.js practice pages as navigable labs, not isolated demos. Preserve the project's existing routing style and make each practice easy to find, compare, and explain.

## Required Routing Shape

Use this hierarchy unless the repository already has a stricter convention:

```text
landing
└─ week
   └─ day
      └─ practice
```

For React/Vite playgrounds, a lightweight route registry plus History API routing is acceptable when no router library is already installed. For Next.js playgrounds, prefer file-system routing.

Each lower-level page must include a back button to its direct parent:

- week → landing
- day → week
- practice → day

## Route Registry Pattern

Keep practice metadata in one place. Include:

- week title, description, path
- day title, description, path
- practice title, description, path
- practice component reference

When adding a practice, add metadata first, then implement the page component. Avoid hard-coding lists in multiple components.

## Practice Page Structure

Use the existing day1 React and Next labs as a structural reference, not as a fixed UI template. Preserve the navigation, route registry, title area, and explanation style, but choose the example layout that best demonstrates the topic.

Prefer one of these shapes depending on the concept:

- Single focused demo: best for reproducing one bug, timing issue, browser behavior, or API contract.
- Two-way comparison: best when contrasting before/after behavior.
- Three-way comparison: best when there is a clearly useful wrong, recommended, and alternative approach.
- Step-by-step simulator: best when execution order, scheduling, rendering phases, or async timing matters.

Every practice should still include:

1. A title or intro area that shows what the practice is about.
2. A visible result or interactive demo that makes the concept observable.
3. A short explanation section that summarizes the concept and practical implication.

Use labels that fit the topic. For example:

```text
잘못된 예
권장 방식
대안
재현
결과
흐름
```

## Example Card Requirements

When using cards, each card should include:

- a short label
- a clear example title
- the visible result or interactive demo
- a short explanation of why it behaves that way
- a note about the practical implication

Do not force every practice into cards. If a timeline, console-like log, side-by-side state view, form, table, or simulator better explains the concept, use that instead.

Use color for semantic distinction, not decoration:

- wrong/risky: rose/red tone
- recommended/safe: emerald/green tone
- alternative/contextual: sky/blue tone
- shared summary or navigation accent: indigo tone

Keep the design modern and restrained. Avoid excessive gradients, heavy shadows, and generic AI-looking visual noise.

## Bottom Explanation Requirements

The bottom section should answer only the questions relevant to the current practice:

- What is the key concept?
- What observable behavior should the learner notice?
- What problem does the example demonstrate?
- How would production code prevent or handle it?
- What tradeoff should the reader remember?

Prefer short bullet lists over long paragraphs.

## Implementation Rules

- Preserve existing user code and unrelated work.
- Keep routing and UI concerns separate from practice logic.
- Keep practice logic readable and close to the example component.
- Do not add routing dependencies unless the project already uses one or the user asks for it.
- Validate with the relevant build command when package scripts are available.
- If the current repository has a route registry, extend it instead of creating a second one.

## Mock API Pattern

When a practice needs API calls, keep the example code shaped like real client code and mock the network boundary instead of replacing requests with local timeout functions.

- For React/Vite playgrounds, use MSW for browser-side API mocking when the project already has MSW or the task asks to add API mocking.
- Create an `api/` folder inside the relevant week/day/practice folder that owns the API behavior.
- Put request handlers, browser worker setup, and small API client functions in that local `api/` folder.
- Keep shared UI, data, and types in `shared/` when multiple examples in the same folder use them.
- Start the MSW worker from the playground entry point and compose handlers from the local `api/` modules that need mocking.
- In examples, call API client functions from the local `api/` folder so the component demonstrates real loading, error, abort, and response-order behavior.

## Naming Guidance

Use stable, readable paths:

```text
/week1
/week1/day1
/week1/day1/stale-closure
```

Use component names that describe the concept:

```text
StaleClosure
AsyncErrorHandling
RenderOptimization
ServerComponentBoundary
```
