/** Professional spoken welcome used after login / registration. */
export const speak = (text: string) => {
  try {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.volume = 1;
    utter.lang = "en-IN";

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find((v) => /en-IN/i.test(v.lang) && /female|google|natural/i.test(v.name)) ||
        voices.find((v) => /en-IN/i.test(v.lang)) ||
        voices.find((v) => /en-GB/i.test(v.lang)) ||
        voices.find((v) => /^en/i.test(v.lang));
      if (preferred) utter.voice = preferred;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    };

    if (window.speechSynthesis.getVoices().length) pickVoice();
    else window.speechSynthesis.addEventListener("voiceschanged", pickVoice, { once: true });
  } catch {
    /* speech is a nicety — never break the flow */
  }
};

export const welcomeCustomer = (name: string) =>
  speak(`Welcome ${name}. Thank you for visiting Astro With Hrishi.`);

export const welcomeAdmin = () => speak("Welcome Admin. You have successfully logged in.");
