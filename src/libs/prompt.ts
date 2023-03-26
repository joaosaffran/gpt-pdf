import handlebars from "handlebars"

export function replacePlaceholdersInPrompt(message: string, variables: { content: string }) {
    const template = handlebars.compile(message)
    const newMessage = template(variables)
    return newMessage
}