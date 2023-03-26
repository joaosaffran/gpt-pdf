import { CreateChatCompletionRequest } from "openai/dist/api"
import fs from "node:fs"

export function saveChatState(state: CreateChatCompletionRequest, filename: string) {
    const json = JSON.stringify(state)
    fs.writeFile(filename, json, 'utf-8', (err) => {
        if (err != null)
            throw err
    })
}

export function loadPromptsState(filepath: string, encoding: BufferEncoding = 'utf-8') {

    const rawdata = fs.readFileSync(filepath, encoding);
    const content: CreateChatCompletionRequest = JSON.parse(rawdata)
    return content
}

export function loadChatState(filepath: string) {

    let state: CreateChatCompletionRequest = {
        model: 'gpt-3.5-turbo',
        messages: []
    }
    if (fs.existsSync(filepath)) {
        const rawdata = fs.readFileSync(filepath, 'utf-8');
        state = JSON.parse(rawdata)
    }

    return state

}
