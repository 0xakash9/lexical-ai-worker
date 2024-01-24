import OpenAI from 'openai';

export default {
	async fetch(request, env, ctx) {
		const requestBody = await request.json();
		const secret_key = request.headers.get('secret_key');
		const text = requestBody.text;
		const options = requestBody.option;
		if (!secret_key) return new Response('Invalid secret key', { status: '500' });
		const openai = new OpenAI({
			apiKey: secret_key,
		});

		const params = {
			messages: [
				{ role: 'system', content: 'You are a helpful text editor assistant.' },
				{
					role: 'user',
					content: `${options} the following text from editor: ${text}`,
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
		const openAIResponse = chatCompletion.choices[0].message;

		return new Response(openAIResponse);
	},
};
