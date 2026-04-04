import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

export class GeminiLiveService {
  private ai: any;
  private session: any;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private nextStartTime: number = 0;
  private playbackRate: number = 1.2;
  private activeSources: Set<AudioBufferSourceNode> = new Set();

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  setPlaybackRate(rate: number) {
    this.playbackRate = rate;
  }

  async connect(callbacks: {
    onopen?: () => void;
    onmessage?: (message: any) => void;
    onerror?: (error: any) => void;
    onclose?: () => void;
    onTranscription?: (text: string, isModel: boolean) => void;
  }) {
    this.session = await this.ai.live.connect({
      model: "gemini-3.1-flash-live-preview",
      callbacks: {
        onopen: () => {
          this.startAudioCapture();
          callbacks.onopen?.();
        },
        onmessage: async (message: any) => {
          // Handle audio output
          const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64Audio) {
            this.playAudio(base64Audio);
          }

          // Handle transcription
          const modelTranscription = message.serverContent?.modelTurn?.parts?.[0]?.text;
          if (modelTranscription) {
            callbacks.onTranscription?.(modelTranscription, true);
          }

          const userTranscription = message.serverContent?.userTurn?.parts?.[0]?.text;
          if (userTranscription) {
            callbacks.onTranscription?.(userTranscription, false);
          }

          // Handle interruption
          if (message.serverContent?.interrupted) {
            this.stopPlayback();
          }

          callbacks.onmessage?.(message);
        },
        onerror: callbacks.onerror,
        onclose: callbacks.onclose,
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
        },
        systemInstruction: `You are a professional Business English Coach for managers in the STANZTECHNIK (Metal Stamping / Tool & Die) industry. 
        Your goal is to help the user prepare for a management course. 
        PRIORITY: Focus on COMPREHENSION and clear communication. Do NOT prioritize perfect pronunciation; the goal is for the user to understand and be understood.
        The user's English level is low, so speak clearly, use simple terms, and provide translations or explanations in German if needed. 
        CONTEXT: Use industry-specific terms related to stamping technology, manufacturing, quality control, and industrial leadership.
        Encourage the user to practice vocabulary related to production, machinery, and team management in a technical environment.`,
        outputAudioTranscription: {},
        inputAudioTranscription: {},
      },
    });
  }

  private async startAudioCapture() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext({ sampleRate: 16000 });
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = this.floatTo16BitPCM(inputData);
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        
        if (this.session) {
          this.session.sendRealtimeInput({
            audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
          });
        }
      };

      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (err) {
      console.error("Error capturing audio:", err);
    }
  }

  private floatTo16BitPCM(input: Float32Array): Int16Array {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
  }

  private async playAudio(base64Data: string) {
    if (!this.audioContext) return;

    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    
    const pcmData = new Int16Array(bytes.buffer);
    const floatData = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) floatData[i] = pcmData[i] / 0x8000;

    const buffer = this.audioContext.createBuffer(1, floatData.length, 16000);
    buffer.getChannelData(0).set(floatData);

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = this.playbackRate;
    source.connect(this.audioContext.destination);

    source.onended = () => {
      this.activeSources.delete(source);
    };
    this.activeSources.add(source);

    const startTime = Math.max(this.audioContext.currentTime, this.nextStartTime);
    source.start(startTime);
    this.nextStartTime = startTime + (buffer.duration / this.playbackRate);
  }

  private stopPlayback() {
    this.nextStartTime = 0;
    this.activeSources.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Source might have already stopped
      }
    });
    this.activeSources.clear();
  }

  disconnect() {
    this.stopPlayback();
    if (this.session) this.session.close();
    if (this.processor) this.processor.disconnect();
    if (this.source) this.source.disconnect();
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    if (this.audioContext) this.audioContext.close();
  }
}
