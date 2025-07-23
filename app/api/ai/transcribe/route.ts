import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('🎤 Transcription request received');
    
    const formData = await request.formData();
    const audioFile = formData.get('file') as File;
    const model = formData.get('model') as string || 'whisper-1';

    if (!audioFile) {
      console.log('❌ No audio file provided');
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    console.log('📁 Audio file received:', audioFile.name, audioFile.size, 'bytes');

    // Send to OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: model,
      response_format: 'json',
    });

    console.log('✅ Transcription successful:', transcription.text);

    return NextResponse.json({
      text: transcription.text,
    });

  } catch (error) {
    console.error('❌ Transcription error:', error);
    
    return NextResponse.json(
      { 
        error: 'Transcription failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 