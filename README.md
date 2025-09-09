<div align="center">

# Empress

Minimal, fast, and modular Discord bot — TypeScript + discord.js + Lavalink (Poru)

</div>

## ✨ Features

- **Music**: Play via Lavalink/Poru, queue, skip/skipto, pause/resume, loop, shuffle, volume, now playing, clear, disconnect
- **Discovery**: Lyrics, playlists (create/manage), liked tracks, autocomplete on play
- **Tickets**: Setup panel, claim, lock/unlock, close, add/remove user
- **Moderation**: Warnings (add/remove/list)
- **Utilities**: Anime lookup, status, server/user info
- **UX**: Slash commands, buttons, select menus, rich embeds
- **DX**: Strong typing, clean handlers, structured logging

## ⚡ Quick start

1) Install deps

```bash
pnpm i # or npm i / yarn
```

2) Configure

- Set your bot credentials and Lavalink in `src/config.ts`
- Ensure a Lavalink node is running

3) Run

```bash
pnpm dev   # ts-node-dev
pnpm build # tsc
pnpm start # node dist
```

## 📂 Highlights

- Commands live in `src/Commands/**`
- Interactions in `src/Events/interactionCreate/**`
- Music engine in `src/Functions/Poru/**` and `src/services/poru.ts`
- Schemas in `src/Schemas/**` (client, moderation, music, ticket)

## 📝 License

MIT


