import { Hono } from 'hono';
import OpenAI from 'openai';
import { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/index.mjs';

type Bindings = {
	OPENAI_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();
const corsHeaders = {
	'Access-Control-Allow-Headers': '*',
	'Access-Control-Allow-Methods': 'POST',
	'Access-Control-Allow-Origin': '*',
};

app.post('/', async (c) => {
	const requestBody = await c.req?.json();
	console.log('Request body', requestBody);

	const secret_key = c.env.OPENAI_API_KEY;
	const text = requestBody.text;
	let options = requestBody.options;
	const joinWith = options.length > 1 ? ' & ' : '';
	options = options.join(joinWith);

	if (!secret_key) return c.json('Invalid secret key', 500);
	const openai = new OpenAI({
		apiKey: secret_key,
	});

	const params: ChatCompletionCreateParamsNonStreaming = {
		messages: [
			{ role: 'system', content: 'You are a helpful text editor assistant.' },
			{
				role: 'user',
				content: `${options} the following text from editor and return the text as a single sentence: ${text}`,
			},
		],
		model: 'gpt-3.5-turbo',
		temperature: 0,
		top_p: 1,
		frequency_penalty: 0,
		presence_penalty: 0,
		max_tokens: 2000,
		n: 1,
	};

	const chatCompletion = await openai.chat.completions.create(params);
	const openAIResponse = chatCompletion.choices[0].message.content;

	return c.json(openAIResponse, 200, {
		'Content-type': 'application/json',
		...corsHeaders,
	});
});

export default app;
