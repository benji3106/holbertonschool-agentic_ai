<script>
  import { Folder, Users, Sparkles, User, AtSign, MessageSquare } from "@lucide/svelte";
  import SectionBadge from "../ui/SectionBadge.svelte";
  import SectionTitle from "../ui/SectionTitle.svelte";
  import Button from "../ui/Button.svelte";

  let fullName = $state("");
  let email = $state("");
  let message = $state("");
  let isSending = $state(false);
  let feedbackMessage = $state("Please fill all required fields.");

  let isFullNameValid = $derived(fullName.length >= 2);
  let isEmailValid = $derived(email.includes("@") && email.includes("."));
  let isMessageValid = $derived(message.length >= 10);
  let isFormValid = $derived(isFullNameValid && isEmailValid && isMessageValid);

  async function handleSubmit(e) {
    e.preventDefault();
    isSending = true;
    feedbackMessage = "Sending message...";

    await new Promise((resolve) => setTimeout(resolve, 1500));

    feedbackMessage = "Your message has been sent successfully.";
    fullName = "";
    email = "";
    message = "";
    isSending = false;

    setTimeout(() => {
      feedbackMessage = "Please fill all required fields.";
    }, 3000);
  }
</script>

<section
  id="contact-section"
  class="relative isolate pt-36 pb-24 overflow-hidden bg-slate-950"
>
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center">
      <SectionBadge>Start your AI journey</SectionBadge>

      <div class="mt-8">
        <SectionTitle line1="Ready to Explore" line2="Agentic AI?" />
      </div>
    </div>

    <div class="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
      <Button
        href="https://www.holbertonschool.fr/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Enroll at Holberton School →
      </Button>
      <Button href="#about-section" variant="secondary">
        Need more information?
      </Button>
    </div>

    <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="flex items-center justify-center gap-2 text-sm text-slate-300">
        <Folder class="w-4 h-4 text-violet-300" />
        Project-based learning
      </div>
      <div class="flex items-center justify-center gap-2 text-sm text-slate-300">
        <Users class="w-4 h-4 text-violet-300" />
        Peer learning environment
      </div>
      <div class="flex items-center justify-center gap-2 text-sm text-slate-300">
        <Sparkles class="w-4 h-4 text-violet-300" />
        AI-powered workflows
      </div>
    </div>

    <form
      onsubmit={handleSubmit}
      class="mt-12 max-w-2xl mx-auto p-8 rounded-3xl border border-slate-800 bg-slate-950 shadow-xl shadow-slate-950/40 flex flex-col gap-6"
    >
      <div>
        <label for="fullName" class="text-sm text-slate-50 font-medium mb-2 flex items-center gap-2">
          <User class="w-4 h-4" />
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          bind:value={fullName}
          autocomplete="off"
          placeholder="Your full name..."
          class="w-full px-4 py-2 rounded-md border border-slate-800 bg-black text-slate-50 placeholder:text-slate-500 focus:outline-none {isFullNameValid ? 'focus:border-violet-500' : 'focus:border-red-500'}"
        />
      </div>

      <div>
        <label for="email" class="text-sm text-slate-50 font-medium mb-2 flex items-center gap-2">
          <AtSign class="w-4 h-4" />
          Email
        </label>
        <input
          id="email"
          type="email"
          bind:value={email}
          autocomplete="off"
          placeholder="Your email address..."
          class="w-full px-4 py-2 rounded-md border border-slate-800 bg-black text-slate-50 placeholder:text-slate-500 focus:outline-none {isEmailValid ? 'focus:border-violet-500' : 'focus:border-red-500'}"
        />
      </div>

      <div>
        <label for="message" class="text-sm text-slate-50 font-medium mb-2 flex items-center gap-2">
          <MessageSquare class="w-4 h-4" />
          Message
        </label>
        <textarea
          id="message"
          bind:value={message}
          autocomplete="off"
          placeholder="Your message..."
          class="w-full px-4 py-2 rounded-md border border-slate-800 bg-black text-slate-50 placeholder:text-slate-500 focus:outline-none {isMessageValid ? 'focus:border-violet-500' : 'focus:border-red-500'}"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={!isFormValid || isSending}
        class="w-full px-4 py-2 font-semibold rounded-md bg-violet-500 hover:bg-violet-600 shadow-lg shadow-violet-500/40 text-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-violet-500"
      >
        {isSending ? "Sending..." : "Send Message"}
      </button>
      <p class="text-center text-sm text-slate-400">{feedbackMessage}</p>
    </form>
  </div>
</section>