import { Folder, Users, Sparkles, User, AtSign, MessageSquare } from "lucide-react";
import { useState } from "react";
import SectionBadge from "../ui/SectionBadge";
import SectionTitle from "../ui/SectionTitle";
import Button from "../ui/Button";

function Contact() {
  const [formData, setFormData] = useState({ fullName: "", email: "", message: "" });
  const [isSending, setIsSending] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("Please fill all required fields.");
  const isFullNameValid = formData.fullName.length >= 2;
  const isEmailValid = formData.email.includes("@") && formData.email.includes(".");
  const isMessageValid = formData.message.length >= 10;
  const isFormValid = isFullNameValid && isEmailValid && isMessageValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setFeedbackMessage("Sending message...");

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setFeedbackMessage("Your message has been sent successfully.");
    setFormData({ fullName: "", email: "", message: "" });
    setIsSending(false);

    setTimeout(() => {
      setFeedbackMessage("Please fill all required fields.");
    }, 3000);
  };

  return (
    <section id="contact-section" className="py-24 bg-black">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center">
          <SectionBadge>Start your AI journey</SectionBadge>

          <div className="mt-8">
            <SectionTitle line1="Ready to Explore" line2="Agentic AI?" />
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
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

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
            <Folder className="w-4 h-4 text-violet-300" />
            Project-based learning
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
            <Users className="w-4 h-4 text-violet-300" />
            Peer learning environment
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
            <Sparkles className="w-4 h-4 text-violet-300" />
            AI-powered workflows
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-12 max-w-2xl mx-auto p-8 rounded-3xl border border-slate-800 bg-slate-950 shadow-xl shadow-slate-950/40 flex flex-col gap-6">
          <div>
            <label htmlFor="fullName" className="text-sm text-slate-50 font-medium mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              autoComplete="off"
              placeholder="Your full name..."
              className={`w-full px-4 py-2 rounded-md border border-slate-800 bg-black text-slate-50 placeholder:text-slate-500 focus:outline-none ${isFullNameValid ? "focus:border-violet-500" : "focus:border-red-500"}`}
            />
          </div>

          <div>
            <label htmlFor="email" className="text-sm text-slate-50 font-medium mb-2 flex items-center gap-2">
              <AtSign className="w-4 h-4" />
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              autoComplete="off"
              placeholder="Your email address..."
              className={`w-full px-4 py-2 rounded-md border border-slate-800 bg-black text-slate-50 placeholder:text-slate-500 focus:outline-none ${isEmailValid ? "focus:border-violet-500" : "focus:border-red-500"}`}
            />
          </div>

          <div>
            <label htmlFor="message" className="text-sm text-slate-50 font-medium mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Message
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              autoComplete="off"
              placeholder="Your message..."
              className={`w-full px-4 py-2 rounded-md border border-slate-800 bg-black text-slate-50 placeholder:text-slate-500 focus:outline-none ${isMessageValid ? "focus:border-violet-500" : "focus:border-red-500"}`}
            />
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isSending}
            className="w-full px-4 py-2 font-semibold rounded-md bg-violet-500 hover:bg-violet-600 shadow-lg shadow-violet-500/40 text-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-violet-500"
          >
            {isSending ? "Sending..." : "Send Message"}
          </button>
          <p className="text-center text-sm text-slate-400">{feedbackMessage}</p>
        </form>
      </div>
    </section>
  );
}

export default Contact;