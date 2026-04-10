const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();

// DeepSeek API配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_MODEL = "deepseek-chat";

// 验证API密钥
if (!DEEPSEEK_API_KEY) {
  console.warn("警告: 未配置DEEPSEEK_API_KEY环境变量");
}

/**
 * 调用DeepSeek API
 * @param {Array} messages - 对话消息数组
 * @returns {Promise<string>} - AI回复内容
 */
async function callDeepSeekAPI(messages, stream = false) {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DeepSeek API密钥未配置");
  }

  try {
    console.log("正在调用DeepSeek API...");

    if (stream) {
      // 流式响应
      const response = await axios.post(
        DEEPSEEK_API_URL,
        {
          model: DEEPSEEK_MODEL,
          messages: messages,
          temperature: 0.7,
          max_tokens: 2048,
          stream: true, // 启用流式响应
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          },
          timeout: 90000, // 90秒超时
          responseType: "stream", // 流式响应类型
        },
      );

      return response.data; // 返回流数据
    } else {
      // 非流式响应
      const response = await axios.post(
        DEEPSEEK_API_URL,
        {
          model: DEEPSEEK_MODEL,
          messages: messages,
          temperature: 0.7,
          max_tokens: 2048,
          stream: false, // 禁用流式响应
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          },
          timeout: 90000, // 90秒超时
        },
      );

      console.log("DeepSeek API调用成功，响应状态:", response.status);
      return response.data.choices[0].message.content;
    }
  } catch (error) {
    console.error("DeepSeek API调用失败:", error.message);
    if (error.response) {
      console.error("响应状态:", error.response.status);
      console.error("响应数据:", error.response.data);
    } else if (error.request) {
      console.error("请求已发送但未收到响应");
    } else {
      console.error("请求配置错误:", error.message);
    }
    throw new Error("AI服务调用失败，请稍后再试");
  }
}

// AI对话接口（支持流式输出）
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "请输入对话内容" });
    }

    const messages = [
      {
        role: "system",
        content:
          "你是一个专业的技术助手，擅长解答各种技术问题。请使用标准的Markdown格式回答技术问题，代码示例必须使用三个反引号（```）包裹并指定语言类型，例如：\n\n```python\nprint('Hello World')\n```\n\n请确保所有代码都使用正确的Markdown代码块格式。",
      },
      {
        role: "user",
        content: message,
      },
    ];

    // 使用流式响应
    const stream = await callDeepSeekAPI(messages, true);

    // 设置流式响应头
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    // 处理流式数据
    let buffer = "";
    stream.on("data", (chunk) => {
      buffer += chunk.toString();

      // 按行处理数据
      const lines = buffer.split("\n");
      buffer = lines.pop(); // 保存最后一行（可能不完整）

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6); // 移除 "data: " 前缀
          if (data === "[DONE]") {
            // 流式结束
            res.write("data: [DONE]\n\n");
            res.end();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.choices && parsed.choices[0].delta.content) {
              // 发送文本片段
              res.write(
                `data: ${JSON.stringify({ content: parsed.choices[0].delta.content })}\n\n`,
              );
            }
          } catch (e) {
            console.error("解析流式数据失败:", e);
          }
        }
      }
    });

    stream.on("error", (error) => {
      console.error("流式响应错误:", error);
      res
        .status(500)
        .write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    });

    stream.on("end", () => {
      res.end();
    });
  } catch (error) {
    console.error("AI对话错误:", error.message);
    res.status(500).json({ message: "AI对话失败", error: error.message });
  }
});

// 文章生成接口
router.post("/generate-article", async (req, res) => {
  try {
    const { topic, type, length, requirement } = req.body;

    if (!topic || typeof topic !== "string") {
      return res.status(400).json({ message: "请输入文章主题" });
    }

    // 根据文章长度设置字数要求
    let wordCount;
    switch (length) {
      case "short":
        wordCount = "500字左右";
        break;
      case "medium":
        wordCount = "1000字左右";
        break;
      case "long":
        wordCount = "2000字左右";
        break;
      default:
        wordCount = "1000字左右";    }

    // 根据文章类型设置风格
    let style = "";
    switch (type) {
      case "tutorial":
        style = "教程风格，步骤清晰，包含代码示例";
        break;
      case "share":
        style = "分享风格，结合个人经验和见解";
        break;
      case "summary":
        style = "总结风格，条理清晰，重点突出";
        break;
      case "analysis":
        style = "分析风格，深入分析，观点明确";
        break;
      default:
        style = "技术文章风格，专业、清晰";
    }

    // 构建文章生成提示词
    let prompt = `请帮我生成一篇关于"${topic}"的${wordCount}的${style}技术文章。`;

    if (requirement && requirement.trim()) {
      prompt += `\n详细要求：${requirement}`;
    }

    prompt += `\n\n请按照以下结构撰写：
1. 文章标题（吸引人的标题）
2. 引言（介绍文章主题和目的）
3. 正文内容（分点详细阐述，包含必要的代码示例和解释）
4. 总结（总结文章要点）
5. 参考资源（如有）

请使用Markdown格式，代码块使用正确的语言标识，确保内容专业、准确、易于理解。`;

    // 构建对话消息
    const messages = [
      {
        role: "system",
        content: `你是一个专业的技术文章作家，擅长撰写高质量的技术博客文章。请根据用户的要求生成一篇结构清晰、内容丰富的技术文章。`,
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const article = await callDeepSeekAPI(messages);

    res.json({ article });
  } catch (error) {
    console.error("文章生成错误:", error.message);
    res.status(500).json({ message: "文章生成失败", error: error.message });
  }
});

// 获取AI模型信息
router.get("/models", (req, res) => {
  res.json({
    models: [
      {
        id: "deepseek-chat",
        name: "DeepSeek Chat",
        description: "DeepSeek大语言模型",
      },
    ],
    apiKeyConfigured: !!DEEPSEEK_API_KEY,
  });
});

module.exports = router;
