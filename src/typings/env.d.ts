declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production"
            DISCORD_TOKEN: string
            OWNER_ID: string
            DEV_GUILD_NAME: string
            DEV_GUILD_ID: string
            DATABASE_URL: string
        }
    }
}

export {}
