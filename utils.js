import * as FileSystem from 'expo-file-system';

import base64 from 'base64-js';

export async function saveAudioToLocalFS(audioUrl, soundName, audioFileType) {
    const fsDir = FileSystem.documentDirectory;
    

    const newAudioUrl = createAudioUrl(fsDir, soundName, audioFileType);
    let info = await FileSystem.getInfoAsync(newAudioUrl);
    if (info.exists) {
      return newAudioUrl;
    }
    const base64AudioData = extractBase64Data(audioUrl, audioFileType);

    await writeAudioDataToFile(newAudioUrl, base64AudioData);

    return newAudioUrl;
}

function createAudioUrl(fsDir, soundName, audioFileType) {
    return `${fsDir}${soundName}.${audioFileType}`;
}

function extractBase64Data(audioUrl, audioFileType) {
    return audioUrl.replace(`data:audio/${audioFileType};base64,`, '');
}

async function writeAudioDataToFile(newAudioUrl, base64AudioData) {
    await FileSystem.writeAsStringAsync(newAudioUrl, base64AudioData, {
        encoding: FileSystem.EncodingType.Base64,
    });
}

export function bytesToBase64(data) {
    if (data instanceof ArrayBuffer) {
        data = new Uint8Array(data);
      }
      if (data instanceof Uint8Array) {
        return base64.fromByteArray(data);
      }
      if (!ArrayBuffer.isView(data)) {
        throw new Error('data must be ArrayBuffer or typed array');
      }
      const {buffer, byteOffset, byteLength} = data;
      return base64.fromByteArray(new Uint8Array(buffer, byteOffset, byteLength));
}

export class Stack {
  constructor() {
      this.items = [];
  }

  push(element) {
      this.items.push(element);
  }

  length() {
    return this.items.length;
  }

  isEmpty() {
    return !(this.items.length > 0);
  }

  pop() {
      if (this.items.length === 0) {
          throw new Error("Underflow");
      }
      return this.items.pop();
  }
}
