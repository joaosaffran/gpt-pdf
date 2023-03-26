import { ChatCompletionRequestMessage, CreateChatCompletionRequest, OpenAIApi } from "openai/dist/api";
import { Configuration } from "openai/dist/configuration";

export async function getGptResponseAsync(prompt: CreateChatCompletionRequest, apiKey: string) {
    const configuration = new Configuration({ apiKey });
    const openai = new OpenAIApi(configuration);

    const completion = await openai.createChatCompletion(prompt);

    return completion.data.choices.reduce(
        (acc, cur) => (
            (cur.message === undefined) ? acc : [...acc, cur.message]
        ), [] as ChatCompletionRequestMessage[])
}