import { getPdfDocumentContentAsync } from "./pdf-client";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import { type PDFDocumentProxy } from "pdfjs-dist/legacy/build/pdf.js";
import { Options, type OptionsType } from './cli'
import fs from "node:fs"
import * as handlebars from "handlebars"
import { Configuration, OpenAIApi, CreateChatCompletionRequest, ChatCompletionRequestMessage } from "openai";
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

type ProgramState = {
    pdfDocument?: PDFDocumentProxy
    chatFile?: CreateChatCompletionRequest
    promptFile?: CreateChatCompletionRequest
    pdfContent?: string
}

class Program {
    private _state: ProgramState;

    constructor() {
        this._state = {}
    }

    async loadPdfDocument(documentPath: string) {
        if (!fs.existsSync(documentPath))
            throw new Error(`PDF Document '${documentPath}' doesn't exist`)

        this._state.pdfDocument = await pdfjsLib.getDocument({ url: "C:/Users/jderezende/Repos/GPTCli/files/A.pdf", password: "" }).promise
        return this
    }

    async loadChatFile(chatFilePath: string) {
        if (!fs.existsSync(chatFilePath)) {
            this._state.chatFile = {
                model: 'gpt-4-32k',
                messages: []
            } as CreateChatCompletionRequest
        } else {
            let rawdata = fs.readFileSync(chatFilePath, 'utf-8');
            this._state.chatFile = JSON.parse(rawdata) as CreateChatCompletionRequest
        }
        return this

    }

    async loadPrompFile(promptFilePath: string) {
        if (!fs.existsSync(promptFilePath))
            throw new Error(`Prompt Document '${promptFilePath}' doesn't exist`)
        let rawdata = fs.readFileSync(promptFilePath, 'utf-8');
        this._state.promptFile = JSON.parse(rawdata) as CreateChatCompletionRequest
        return this
    }

    async loadPdfFileContent() {
        if (this._state.pdfDocument === undefined)
            throw new Error("PDF Document is not loaded, load the document by calling: `loadPdfDocument`")

        this._state.pdfContent = await getPdfDocumentContentAsync(this._state.pdfDocument)
        return this
    }

    async replacePromptsTemplates() {
        if (this._state.promptFile === undefined)
            throw new Error("Prompt file is not loaded, load the document by calling: `loadPrompFile`")

        if (this._state.pdfContent === undefined)
            throw new Error("Content of PDF files is not loaded, load the document by calling: `loadPdfFileContent`")

        const newMessages = this._state.promptFile?.messages.map((message) => {
            const template = handlebars.compile(message.content)
            const newMessage = template({ content: this._state.pdfContent })
            return { ...message, content: newMessage }
        })

        this._state.promptFile = { ...this._state.promptFile, messages: newMessages }
        return this
    }

    async loadChatIntoPrompt() {
        if (this._state.promptFile === undefined)
            throw new Error("Prompt file is not loaded, load the document by calling: `loadPrompFile`")

        if (this._state.chatFile === undefined)
            throw new Error("Chat file is not loaded, load the document by calling: `loadChatFile`")

        this._state.promptFile.messages = [...this._state.chatFile.messages, ...this._state.promptFile.messages]
        return this
    }

    async getChatGptResponse() {
        if (this._state.promptFile === undefined)
            throw new Error("Prompt file is not loaded, load the document by calling: `loadPrompFile`")

        if (this._state.chatFile === undefined)
            throw new Error("Chat file is not loaded, load the document by calling: `loadChatFile`")

        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);

        const completion = await openai.createChatCompletion(this._state.promptFile);
        const newMessages = completion.data.choices.reduce(
            (acc, cur) => ((cur.message === undefined) ? acc : [...acc, cur.message]),
            [] as ChatCompletionRequestMessage[])

        this._state.chatFile.messages = [...this._state.chatFile.messages, ...newMessages]

        return this
    }

    async saveChatFile(savefileName: string) {
        if (this._state.chatFile === undefined)
            throw new Error("Chat file is not loaded, load the document by calling: `loadChatFile`")
        const json = JSON.stringify(this._state.chatFile)
        fs.writeFile(savefileName, json, 'utf-8', (err) => {
            if (err != null)
                throw err
        })

        return this
    }

    async printState() {
        console.log(this._state, null, 2)
    }
}

new Program()
    .loadChatFile(Options.chat)
    .then((prog) => prog.loadPrompFile(Options.prompts))
    .then((prog) => prog.loadPdfDocument(Options.file))
    .then((prog) => prog.loadPdfFileContent())
    .then((prog) => prog.replacePromptsTemplates())
    .then((prog) => prog.loadChatIntoPrompt())
    .then((prog) => prog.getChatGptResponse())
    .then((prog) => prog.saveChatFile(Options.chat))
    .then((prog) => prog.printState())
