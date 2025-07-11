---
permalink: /
title: "About Me"
excerpt: "About me"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

I am an engineer by nature and a scientist by training. My career interests primarily include machine learning for computer vision and computer graphics with a focus on 3D human body in motion.

Building the future of sports content viewing on the Metaverse is what takes me to work every day as Head of AI at [Sporttotal.tv](https://sporttotal.tv/). Basically we turn human players in images of sport events into motion-accurate, digitized 3D avatar parameters that efficiently enable on-demand immersive 3D viewing of the game and scalable data analysis.

Previously I was an Applied Research Scientist at [Kaia Health GmbH](https://kaiahealth.com/), and before that, I was a Research Engineer at the  [Perceiving Systems Department](https://www.youtube.com/user/BlackAtBrown) of the [Max-Planck Institute for Intelligent Systems](https://www.is.mpg.de/) lead by [Michael Black](https://ps.is.tuebingen.mpg.de/person/black).

I have a BSc. in Electrical Engineering from [Tabriz](https://www.youtube.com/watch?v=OWb1yP-KpMc) Azad University, [Iran](https://www.youtube.com/watch?v=CuITzmlIvbc), and an MSc. in [Neural Information Processing](https://www.neuroschool-tuebingen.de/master/neural-inf-process/) 
from [Eberhard Karls University of Tübingen](https://www.neuroschool-tuebingen.de/), Germany.

<div id="chat-container" style="max-width: 600px; margin-top: 2rem; padding: 1rem; border: 1px solid #ccc; border-radius: 10px; background: #f7f7f7;">
  <h3 style="margin-top: 0;">💬 Let's Chat! </h3>
  <div id="chat-box" style="height: 200px; overflow-y: auto; background: white; padding: 0.5rem; border: 1px solid #ddd;"></div>
  <input type="text" id="user-input" placeholder="Ask me about my career, skills, etc." style="width: 100%; padding: 0.5rem; margin-top: 0.5rem; border: 1px solid #ccc;">
</div>

<script>
  window.addEventListener("DOMContentLoaded", () => {
    import("https://esm.sh/@gradio/client").then(async ({ Client }) => {
      const chatBox = document.getElementById("chat-box");
      const userInput = document.getElementById("user-input");
      let messages = [];

      const client = await Client.connect("nghorbani/linkedin_profile_chatbot");

      function appendMessage(role, content) {
        const el = document.createElement("div");
        el.innerHTML = `<strong>${role === "user" ? "You" : "Nima"}:</strong> ${content}`;
        el.style.margin = "0.5rem 0";
        chatBox.appendChild(el);
        chatBox.scrollTop = chatBox.scrollHeight;
      }

      userInput.addEventListener("keypress", async function (e) {
        if (e.key === "Enter" && userInput.value.trim() !== "") {
          const userMessage = {
            role: "user",
            content: userInput.value.trim()
          };

          appendMessage("user", userMessage.content);
          messages.push(userMessage);
          userInput.value = "";

          try {
            const result = await client.predict("/chat", {
              messages: messages
            });

            const botMessage = result.data;
            messages.push(botMessage);
            appendMessage("assistant", botMessage.content);
          } catch (err) {
            console.error("Chatbot error:", err);
            appendMessage("assistant", "⚠️ Error reaching the chatbot.");
          }
        }
      });
    });
  });
</script>



<p style="font-size: 0.9em; color: #666; text-align: left; margin-top: 0.5rem;">
  💡 Powered by my 
  <a href="https://github.com/nghorbani/linkedin_profile_chatbot/" target="_blank" style="color: #007acc;">
    LinkedIn profile chatbot
  </a>.
</p>
