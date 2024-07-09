import OpenAI from 'openai';
const corsHeaders = {
	'Access-Control-Allow-Headers': '*',
	'Access-Control-Allow-Methods': 'POST',
	'Access-Control-Allow-Origin': '*',
};
export default {
	async fetch(request, env, ctx) {
		if (request.method === 'OPTIONS') {
			return new Response('OK', {
				headers: corsHeaders,
			});
		} else if (request.method === 'POST') {
			const requestBody = await request?.json();
			const secret_key = env.OPENAI_API_KEY;
			const text = requestBody.text;
			let options = requestBody.options;
			const joinWith = options.length > 1 ? ' & ' : '';
			options = options.join(joinWith);

			if (!secret_key) return new Response('Invalid secret key', { status: '500' });
			const openai = new OpenAI({
				apiKey: secret_key,
			});

			const params = {
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

			console.log('openAIResponse', openAIResponse);
			return new Response(JSON.stringify(openAIResponse), {
				headers: {
					'Content-type': 'application/json',
					...corsHeaders,
				},
			});
		} else {
			return new Response('Bad Request', { status: 400 });
		}
	},
};
