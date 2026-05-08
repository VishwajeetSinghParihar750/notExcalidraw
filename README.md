# notExcalidraw

A hand-drawn style whiteboard built from scratch — an [Excalidraw](https://excalidraw.com)-inspired drawing app with real-time collaboration.

**Live demo:** [not-excalidraw.vercel.app](https://not-excalidraw.vercel.app)

## Features

### Drawing tools

| Tool | Description |
|------|-------------|
| **Selection** | Select, move, resize, and delete shapes |
| **Hand (Grab)** | Pan the canvas |
| **Rectangle** | Axis-aligned rectangles |
| **Diamond** | Rotated rectangles |
| **Circle** | Ellipses |
| **Arrow** | Straight, curved, or snake-style arrows |
| **Line** | Simple lines |
| **Pen** | Freehand drawing |
| **Text** | Editable text with multiple font styles |
| **Eraser** | Remove shapes |

Additional UX: **tool lock** keeps the active tool selected after each draw action.

### Styling

- Stroke and fill colors (theme-aware palette)
- Stroke width and style (solid / dotted)
- Fill style (solid / hachure / cross-hatch)
- Corner radius and opacity
- Font family (hand-drawn, monospace, normal) and size for text

### Collaboration

- Create a room and share a link (`/?roomId=...`)
- Real-time shape sync over WebSockets via [notExcalidrawBackend](https://github.com/VishwajeetSinghParihar750/notExcalidrawBackend)
- Live cursor presence for other participants
- Event-sourced updates with conflict resolution

### Other

- Light / dark theme (persisted in `localStorage`)
- Local canvas persistence when not in a collab session
- Responsive layout for mobile and desktop

## Tech stack

| Layer | Technology |
|-------|------------|
| UI | React 19, TypeScript, Tailwind CSS 4 |
| Build | Vite 7 |
| State | Zustand |
| Routing | React Router 7 |
| Validation | Zod |
| Rendering | HTML Canvas 2D |
| Notifications | Sonner |

## Architecture

```
React UI (Tools, StyleMenu, CollabPopup)
        ↕ Zustand stores
CanvasManager
  ├── ShapeManager   — shapes, event log, localStorage persistence
  ├── ToolManager    — active tool routing, input handling
  └── Collab         — WebSocket sync, remote cursors
```

Every shape change is recorded as a `shapeUpdateEvent`. During collaboration, events are synced over WebSocket and applied with inverse events for conflict resolution. Shape schemas and message types are defined in `src/types/`.

## Getting started

### Prerequisites

- Node.js 18+
- npm

### Install and run

```bash
git clone https://github.com/VishwajeetSinghParihar750/notExcalidraw.git
cd notExcalidraw
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Environment variables

Collaboration requires the [notExcalidrawBackend](https://github.com/VishwajeetSinghParihar750/notExcalidrawBackend) WebSocket server. Create a `.env` file in the project root:

```env
VITE_BACKEND_WEBSOCKET_URL=ws://localhost:3001
```

Point this at your running backend instance (e.g. `ws://localhost:3001` locally, or your deployed `wss://` URL in production). Drawing works locally without this variable.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Project structure

```
src/
├── classes/
│   ├── Shapes/          # Shape classes (Rect, Circle, Arrow, Pen, Text, …)
│   ├── Tools/           # Tool handlers (one per drawing tool)
│   ├── Managers/        # CanvasManager, ShapeManager, ToolManager
│   └── feature/Collab/  # Real-time collaboration + cursors
├── components/home/     # Canvas, toolbar, style menu, collab popup
├── store/               # Zustand stores (tools, theme, canvas manager)
├── hooks/               # useCanvas — render loop, device-pixel-ratio scaling
├── types/               # WebSocket schemas, shape update events
└── utils/               # Theme helpers, deserialization, mouse coords
```

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Delete` / `Backspace` | Delete selected shapes (selection tool active) |

## Acknowledgements

Inspired by [Excalidraw](https://excalidraw.com). Built as a learning project to implement a collaborative canvas from the ground up.
