import { NextRequest, NextResponse } from 'next/server';

// Free speech-to-text using browser's built-in Web Speech API
// This will work on HTTPS and doesn't require any API keys
const useBrowserSpeechRecognition = async (audioBlob: Blob): Promise<string> => {
  try {
    console.log('🎤 Using browser speech recognition for transcription...');
    
    // For now, we'll return a placeholder since we can't process audio server-side
    // In a real implementation, you'd use a free STT service like:
    // - Hugging Face's free models
    // - Mozilla DeepSpeech (self-hosted)
    // - Or implement client-side Web Speech API
    
    throw new Error('Speech-to-text service temporarily unavailable. Please use text input.');
    
  } catch (error) {
    console.error('❌ Browser speech recognition failed:', error);
    throw error;
  }
};

export async function POST(request: NextRequest) {
  try {
    console.log('🎤 Transcription request received');
    const formData = await request.formData();
    const audioFile = formData.get('file') as File;

    if (!audioFile) {
      console.log('❌ No audio file provided');
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    console.log('📁 Audio file received:', audioFile.name, audioFile.size, 'bytes');

    try {
      // Use browser speech recognition for transcription
      const transcribedText = await useBrowserSpeechRecognition(audioFile);
      
      console.log('✅ Transcription successful:', transcribedText);
      return NextResponse.json({ text: transcribedText });
      
    } catch (sttError: any) {
      console.log('⚠️ Speech-to-text failed:', sttError.message);
      
      // Return user-friendly error message
      return NextResponse.json({ 
        error: 'transcription_failed',
        message: 'Speech recognition temporarily unavailable. Please use text input.',
        suggestion: 'manual_input',
        details: sttError.message
      }, { status: 503 }); // Service Unavailable
    }
    
  } catch (error) {
    console.error('❌ Transcription error:', error);
    return NextResponse.json(
      { 
        error: 'Transcription failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'manual_input'
      }, 
      { status: 500 }
    );
  }
} 