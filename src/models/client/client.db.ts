import { Schema, model } from "mongoose"

interface IClient {
    client: boolean
    memory: number[]
}

const clientSchema = new Schema<IClient>({
    client: Boolean,
    memory: Array<Number>
})

export default model("client", clientSchema)
