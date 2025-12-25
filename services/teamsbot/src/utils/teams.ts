export function getConversationParentMessageId(conversationId: string): string {
  try {
    const id = conversationId.split(";messageid=")[1];

    console.log("\n=============Parent Message ID=============\n");
    console.log(id);
    console.log("\n=============Parent Message ID=============\n");

    return id;
  } catch (error) {
    console.error("Error fetching parent message ID:", error);
    throw error;
  }
}


export function textFromLinkMarkdown(markdown: string): string {
  // Check if it's a standard markdown link [text](url)
  if (markdown.startsWith('[')) {
    // Find the last occurrence of '](' which indicates the end of the link text
    const lastBracketIndex = markdown.lastIndexOf('](');
    if (lastBracketIndex === -1) return markdown;
    
    // Find the first '[' at the beginning
    const firstBracketIndex = markdown.indexOf('[');
    if (firstBracketIndex === -1) return markdown;
    
    // Extract text between the first '[' and the last ']('
    return markdown.substring(firstBracketIndex + 1, lastBracketIndex);
  } else {
    // Handle plain text with URL format: text(url)
    // Find the last occurrence of '(' which indicates the start of the URL
    const lastParenIndex = markdown.lastIndexOf('(');
    if (lastParenIndex === -1) return markdown;
    
    // Extract text before the last '('
    return markdown.substring(0, lastParenIndex);
  }
}