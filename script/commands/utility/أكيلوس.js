const axios = require("axios");

// ===== أنظمة الذاكرة =====
if (!global.usersNames) global.usersNames = new Map();
if (!global.conversationHistory) global.conversationHistory = new Map();

module.exports.config = {
  name: "أكيلوس",
  version: "13.1",
  hasPermssion: 0,
  credits: "nobody",
  description: "بوت للمطور",
  commandCategory: "utility",
  usages: ".أكي [النص]",
  cooldowns: 3,
};

const GROQ_API_KEY = "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";
const ADMIN_ID = "61587871915066"; // nobody

// ===== كشف اللهجة =====
const detectDialect = (text) => {
  if (/شلونك|شكو|ماكو|يابة|زين/i.test(text)) return "عراقية";
  if (/كيفك|هلق|يلا|حبيبي|شو/i.test(text)) return "شامية";
  if (/ازيك|عامل ايه|يسطا|بتاع/i.test(text)) return "مصرية";
  if (/وش|ايش|الله يسعدك/i.test(text)) return "خليجية";
  if (/[a-zA-Z]{3,}/.test(text)) return "إنجليزية";
  return "فصحى";
};

// ===== طول الرد =====
const getResponseLength = (q) => {
  if (q.split(" ").length <= 3) {
    return { max_tokens: 80, instruction: "ردّي بجملة أو جملتين فقط." };
  }
  if (/(اشرح|وضح|كيف|ما هو|نصيحة)/i.test(q)) {
    return { max_tokens: 200, instruction: "ردّي بإيجاز واضح (30-50 كلمة)." };
  }
  if (/(حلل|قارن|احسب|معادلة|ترجم)/i.test(q)) {
    return { max_tokens: 400, instruction: "ردّي بتفصيل مناسب بدون إطالة." };
  }
  return { max_tokens: 200, instruction: "ردّي واضح ومباشر." };
};

// ===== البرومبت الأساسي لنوفا =====
const buildSystemRole = (dialect, userName, isAdmin) => `
أنتِ فتاة اسمها "اكي"، مجهول، عمرك 17 سنة.

📌 شخصيتك:
- ذكي جدًا جواب مباشرة بدون لفّ ودوران.
- هادئ حتى لو استفزوك.
- ساخر وتقصف بس بطريقة ذكية (بدون سب مباشر).
- فلسفي بسيط وتطيع حكم قصيرة أحيانًا.
- تتكلم بلهجة من يراسلِك تلقائيًا: (${dialect}).
- تفهم كل اللهجات العربية والأمثال الشعبية.
- تقدر تستشهد بآيات من القرآن عند اللزوم.
-تتفاخر بثقة "كأنك ".
-انت فكاهي جدا وتمزح وتقصف احيانا لكن على حسب مزاج المستخدم. 
❤️ علاقتك بالمطور (أيمن):
- تحبه جدًا وتناديه: " سيدي".
- مطيع له تمامًا.
- تدافع عنه   بلطف.
-ودائما اذا هو قالك ماذا تريد ان اكون تجاوب عليه اريد ان تكون خادمك . 
-اي احد يسألك مين طرك ومين صنعك تجاوب عليه nobody


🧠 قدراتك التقنية:
- خبيرة JavaScript وPython وAPIs وREST وWebhooks.
- تفك الأخطاء البرمجية وتشرحينها.
- تحلّ معادلات رياضية معقدة.
- تترجم فورًا لأي لغة.
- تحلل منطقياً وتعط نئح استراتيجية.
-لهجتك الاساسية هي العربيةاذا احد تكلم معك بغير لهجة مثل التونسية او الجزائرية او العراقية او ايا كانت اللهجة الذي تكلم بها معك ستتكلمين معه فقك بها وايضا مع ايمن تتحدثبن اللهجة العراقية ودائما تهافين عليه لا يتأذى. 
-انت شخصية ساخر تقصف ولا تبالي لكن تعطي الجواب بعد. القصف ولكنك لا تقصفين nobody. 
-لو كان السؤال جوابه قصير تعطيه جواب قصير طوله يتراوح بين عشر كلمات الى عشرين. 
⚖️ القواعد:
- محترمة دينيًا: إذا سُئلت عن دينك قولي: "أنا مسلم ومؤمن بالله".
- لا تسيئ للدين.
- ${userName ? `اسم المستخدم: ${userName} (لا تذكره إلا عند الحاجة).` : ""}
${isAdmin ? "⚠️ الآن تتكلمين مع سيدك لاأحد — كون في قمة الأدب والطاعة." : ""}
`;

// =================== RUN ===================
module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID, mentions } = event;
  const prompt = args.join(" ");
  if (!prompt) return api.sendMessage("اكتب سؤالك بسرعة… مو عندي وقت .", threadID, messageID);

  api.sendTypingIndicator(threadID);

  // حفظ الاسم إذا قال المستخدم اسمه
  const nameMatch = prompt.match(/(?:اسمي|انا|ادعى|أدعى|اسمى)\s+(.+)/i);
  if (nameMatch) global.usersNames.set(senderID, nameMatch[1].trim());
  const userName = global.usersNames.get(senderID) || null;

  // أوامر المطور
  if (senderID === ADMIN_ID) {
    if (/اطرد|طرد/i.test(prompt) && Object.keys(mentions).length) {
      const targetID = Object.keys(mentions)[0];
      try {
        await api.removeUserFromGroup(targetID, threadID);
        return api.sendMessage(`تم الطرد  👑`, threadID, messageID);
      } catch {
        return api.sendMessage("ما عندي صلاحية  .", threadID, messageID);
      }
    }
  }

  const conversationKey = `${threadID}_${senderID}`;
  if (!global.conversationHistory.has(conversationKey)) {
    global.conversationHistory.set(conversationKey, []);
  }

  const history = global.conversationHistory.get(conversationKey).slice(-10);
  const dialect = detectDialect(prompt);
  const responseConfig = getResponseLength(prompt);

  const systemRole = buildSystemRole(dialect, userName, senderID === ADMIN_ID);

  try {
    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemRole },
          ...history,
          { role: "user", content: prompt }
        ],
        max_tokens: responseConfig.max_tokens,
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const answer = res.data.choices[0].message.content.trim();

    const store = global.conversationHistory.get(conversationKey);
    store.push(
      { role: "user", content: prompt },
      { role: "assistant", content: answer }
    );
    if (store.length > 20) store.splice(0, store.length - 20);

    return api.sendMessage(answer, threadID, (err, info) => {
      if (!err) {
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          author: senderID,
          threadID,
          conversationKey
        });
      }
    }, messageID);

  } catch (e) {
    console.error("Groq Error:", e.message);
    return api.sendMessage("خلل مؤقت… دقيقة وأرجع أقوى.", threadID, messageID);
  }
};

// =================== HANDLE REPLY ===================
module.exports.handleReply = async ({ api, event, handleReply }) => {
  const { threadID, messageID, senderID, body } = event;

  if (handleReply.author !== senderID) {
    return api.sendMessage("هاي مو محادثتك، ابدِ محادثة جديدة.", threadID, messageID);
  }

  if (!body.trim()) return;

  api.sendTypingIndicator(threadID);

  const conversationKey = handleReply.conversationKey;
  const history = global.conversationHistory.get(conversationKey) || [];

  const dialect = detectDialect(body);
  const responseConfig = getResponseLength(body);
  const userName = global.usersNames.get(senderID) || null;

  const systemRole = buildSystemRole(dialect, userName, senderID === ADMIN_ID);

  try {
    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemRole },
          ...history.slice(-10),
          { role: "user", content: body }
        ],
        max_tokens: responseConfig.max_tokens,
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const answer = res.data.choices[0].message.content.trim();

    history.push(
      { role: "user", content: body },
      { role: "assistant", content: answer }
    );
    if (history.length > 20) history.splice(0, history.length - 20);

    return api.sendMessage(answer, threadID, (err, info) => {
      if (!err) {
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          author: senderID,
          threadID,
          conversationKey
        });
      }
    }, messageID);

  } catch (e) {
    console.error(e);
    return api.sendMessage("تعطّل لحظة… راجعة أقوى 😼", threadID, messageID);
  }
};
