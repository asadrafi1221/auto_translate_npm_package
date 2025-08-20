const starter = () => {
  const title = "🚀 AUTO TRANSLATION TOOL 🚀";
  const description = "Automatically extract and manage React i18n keys";
  const features = ["⚡ Fast", "🔒 Secure", "🎯 Accurate"];
  const commands = [
    { cmd: "react", desc: "Run the tool for React projects " },
    { cmd: "react-native", desc: "Run the tool for React Native projects --upcoming feature" },
    { cmd: "node", desc: "Run the tool for Node projects --upcoming feature" },
 
  ];

  // Calculate max width dynamically
  const allLines = [
    title,
    description,
    features.join(" | "),
    ...commands.map(c => `${c.cmd.padEnd(15)} - ${c.desc}`),
  ];
  const maxWidth = Math.max(...allLines.map(line => line.length)) + 4; // padding

  const line = "═".repeat(maxWidth);
  const emptyLine = "║" + " ".repeat(maxWidth - 2) + "║";

  console.log("\n");
  console.log(`╔${line}╗`);
  console.log(emptyLine);
  console.log(`║ ${title.padEnd(maxWidth - 3)}║`);
  console.log(emptyLine);
  console.log(`║ ${description.padEnd(maxWidth - 3)}║`);
  console.log(emptyLine);
  console.log(`║ ${features.join(" | ").padEnd(maxWidth - 3)}║`);
  console.log(emptyLine);
  console.log(`╠${line}╣`);
  console.log(`║ Commands:${" ".repeat(maxWidth - 11)}║`);
  commands.forEach(c => {
    const lineText = `${c.cmd.padEnd(15)} - ${c.desc}`;
    console.log(`║ ${lineText.padEnd(maxWidth - 3)}║`);
  });
  console.log(`║${" ".repeat(maxWidth - 2)}║`);
  console.log(`╚${line}╝\n`);
};

// Example usage
module.exports = {
    starter
}