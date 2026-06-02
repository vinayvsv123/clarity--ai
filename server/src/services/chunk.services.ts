export interface ChunkOptions {
  
  // The maximum size of each chunk in characters.   
  chunkSize?: number;
  // The number of characters to overlap between consecutive chunks.
  chunkOverlap?: number;
  useSmartSplit?: boolean;
}

export interface ChunkResult {
  chunkIndex: number;
  text: string;
  charCount: number;
}

export class ChunkService {
 
  public static chunkText(
    text: string,
    options: ChunkOptions = {}
  ): ChunkResult[] {
    const chunkSize = options.chunkSize ?? 1000;
    const chunkOverlap = options.chunkOverlap ?? 200;
    const useSmartSplit = options.useSmartSplit ?? true;

    if (!text || text.trim() === '') {
      return [];
    }

    // Ensure parameters are safe and logical
    const safeChunkSize = Math.max(1, chunkSize);
    const safeChunkOverlap = Math.min(Math.max(0, chunkOverlap), safeChunkSize - 1);

    const chunks: ChunkResult[] = [];
    let start = 0;
    let chunkIndex = 0;
    const textLength = text.length;

    while (start < textLength) {
      let end = start + safeChunkSize;
      
      if (end >= textLength) {
        end = textLength;
      } else if (useSmartSplit) {
        // Search for whitespace backwards from the end of the chunk
        // but only within the overlap window to prevent excessive resizing
        const searchStart = Math.max(start + 1, end - safeChunkOverlap);
        const substringToSearch = text.substring(searchStart, end + 1);
        
        let whitespaceIndex = -1;
        for (let i = substringToSearch.length - 1; i >= 0; i--) {
          const char = substringToSearch[i];
          // Check for any whitespace character (space, newline, tab, etc.)
          if (/\s/.test(char)) {
            whitespaceIndex = searchStart + i;
            break;
          }
        }

        // If a whitespace was found, adjust the end index to split at the word boundary
        if (whitespaceIndex !== -1) {
          end = whitespaceIndex;
        }
      }

      // Slice the text and trim leading/trailing spaces
      const chunkText = text.substring(start, end).trim();
      
      // Add chunk if it has actual content
      if (chunkText.length > 0) {
        chunks.push({
          chunkIndex,
          text: chunkText,
          charCount: chunkText.length
        });
        chunkIndex++;
      }

      // If we reached the end of the text, stop
      if (end >= textLength) {
        break;
      }

      // Calculate the start position of the next chunk
      const nextStart = end - safeChunkOverlap;
      
      // Ensure the start position always moves forward to prevent infinite loops
      if (nextStart <= start) {
        start = start + 1;
      } else {
        start = nextStart;
      }
    }

    return chunks;
  }
}
