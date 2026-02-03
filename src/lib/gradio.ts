import { Client } from '@gradio/client';

let gradioClient: Client | null = null;

export async function initGradioClient(): Promise<Client | null> {
  if (gradioClient) return gradioClient;

  try {
    gradioClient = await Client.connect('rezaenayati/RezAi');
    return gradioClient;
  } catch (error) {
    console.error('Failed to connect to Gradio client:', error);
    return null;
  }
}

export async function sendMessage(message: string): Promise<string> {
  try {
    const client = await initGradioClient();
    if (!client) {
      throw new Error('Client not connected');
    }

    const result = await client.predict('/chat', {
      message: message,
    });

    const data = result.data as string[];
    return data[0] || 'Sorry, I didn\'t receive a proper response.';
  } catch (error) {
    console.error('Error calling Gradio API:', error);
    throw error;
  }
}
