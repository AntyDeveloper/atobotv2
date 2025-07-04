const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function fetchPollQuestionsFromChannel(channelId, client) {
  const channel = await client.channels.fetch(channelId);
  if (!channel || !channel.isTextBased()) return [];

  // Pobierz ostatnie 100 wiadomości (możesz zwiększyć limit jeśli potrzebujesz)
  const messages = await channel.messages.fetch({ limit: 100 });

  // Filtruj tylko te z ankietą i wyciągnij pytania
  const pollQuestions = [];
  messages.forEach((msg) => {
    if (msg.poll && msg.poll.question && msg.poll.question.text) {
      pollQuestions.push(msg.poll.question.text);
    }
  });

  return pollQuestions;
}

async function generateAndSendMinecraftPoll(
  client,
  multipleChoice = false,
  duration = 86400 // 24 hours in seconds
) {
  const guild = client.guilds.cache.get("1312084655473950821");
  const channel = guild.channels.cache.get("1343437749482553354");

  const pollQuestions = await fetchPollQuestionsFromChannel(
    "1343437749482553354",
    client
  );
  const normalPrompts = [
    `Wymyśl kilka (3–5) krótkich i ciekawych ankiet związanych z Minecraftem (np. wersje gry, moby, style gry, biomy, narzędzia). Następnie wybierz najlepszą z nich i zwróć **tylko ją**. Wszystkie odpowiedzi muszą być logiczne, stylistycznie spójne i poprawne gramatycznie — np. wszystkie w liczbie pojedynczej lub mnogiej. Nie mieszaj języków (albo wszystko po polsku, albo wszystko po angielsku). Każdej opcji przypisz **jedno inne, pasujące emoji** i zwróć je osobno w tablicy "emojis", w tej samej kolejności co opcje. **W pytaniu również dodaj jedno emoji na początku.** Emoji mają być w osobnym polu — nie umieszczaj ich bezpośrednio w tekście pytań ani opcji. **Zwróć tylko jedną, wybraną ankietę w formacie JSON — bez żadnych numerów, komentarzy, wstępu ani dodatkowego tekstu.** Tekst pytania i każdej odpowiedzi nie może być dłuższy niż 55 znaków. Format:
  {
    "question": "🧱 Twoje pytanie",
    "options": ["Opcja A", "Opcja B", "Opcja C"],
    "emojis": ["🌲", "🔥", "🧱"]
  }
  Dozwolone tylko 2 lub 3 opcje. Pamiętaj, że te pytania już były zadawane: ` +
      pollQuestions.join(", "),
  ];

  const brainrotPrompts = [
    `Wymyśl kilka (3–5) absurdalnych i śmiesznych ankiet z luźnym powiązaniem do Minecrafta lub TikTokowego klimatu brainrot (np. krokodilo bombardiro, sigma villager, Herobrine robiący latte). Następnie wybierz najlepszą z nich i zwróć **tylko ją**, w formacie JSON. Każda opcja powinna mieć jedno **inne, pasujące lub odjechane emoji**, przypisane osobno w tablicy "emojis", w tej samej kolejności co odpowiedzi. **W pytaniu też dodaj jedno emoji na początku.** Nie powtarzaj emoji. **Nie dodawaj emoji bezpośrednio do tekstu opcji ani pytania.** Tekst pytania i każdej odpowiedzi nie może przekraczać 55 znaków. **Zwróć tylko jedną wybraną ankietę — jako czysty JSON bez żadnych dodatkowych numerów, opisów ani komentarzy.** Format:
  {
    "question": "🧌 Śmieszne pytanie",
    "options": ["Odp A", "Odp B", "Odp C"],
    "emojis": ["🧌", "🛸", "🍞"]
  }`,
  ];
  const useBrainrot = Math.random() < 0.2;
  const prompt = (useBrainrot ? brainrotPrompts : normalPrompts)[0];

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 150,
    temperature: 1.2,
  });

  console.log(response.choices[0].message?.content || "Brak odpowiedzi");
  let poll;
  try {
    // Pobierz content bezpiecznie
    const content = response.choices[0].message?.content || "";
    if (!content) {
      console.error("❌ Brak contentu w odpowiedzi OpenAI!");
      return;
    }
    const jsonMatch = content.match(
      /```json\s*([\s\S]*?)```|([\[\{][\s\S]*[\]\}])/i
    );
    const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[2] : content;
    let parsed = JSON.parse(jsonString);
    // Jeśli to tablica, weź pierwszy element
    poll = Array.isArray(parsed) ? parsed[0] : parsed;
  } catch (err) {
    console.error("❌ Błąd parsowania JSON-a:", err);
    return;
  }
  // ...existing code...
  const { question, options, emojis } = poll;
  if (
    !question ||
    !options ||
    options.length < 2 ||
    !emojis ||
    !Array.isArray(emojis) ||
    emojis.length !== options.length
  ) {
    console.warn("⚠️ Niepoprawny format ankiety");
    return;
  }

  // Połącz opcje z emoji z tablicy emojis
  const answers = options.slice(0, 3).map((option, idx) => ({
    text: option.trim(),
    emoji: emojis[idx],
  }));

  await channel.send({
    poll: {
      question: { text: question },
      allowMultiSelect: multipleChoice,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      answers,
    },
  });

  // await channel.send({ content: "<@&1343415863423930390>" }).then((message) => {
  //   setTimeout(
  //     () => message.delete().catch((err) => console.log(err)),
  //     2 * 1000
  //   );
  // });
}

module.exports = generateAndSendMinecraftPoll;
