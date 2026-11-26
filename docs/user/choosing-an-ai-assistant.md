# Choosing an AI assistant

ShapeShft is free. It does not include an AI. You use it with an AI assistant account of your own. This page helps you choose one and explains what costs money.

Plan details change often. The information below was checked on November 26, 2026, on the official pages: claude.com/pricing, chatgpt.com/pricing, and OpenAI's help articles on projects and file uploads. Check those pages again before you pay for anything.

## The short answer

- **Use the assistant you already have.** ShapeShft works with Claude, ChatGPT and most other chat assistants.
- **If you have none, a free Claude account is the easiest start.** Its free plan includes projects, creating files you can download, and skills. A free ChatGPT account also works, with the limits described below.
- **You do not need a paid plan** for the basic method: career discovery, tailored applications, the Resume Workbench, spoken practice and offline guides.

## Recommended setup for beginners

One AI assistant, set up with a **project**, plus the two ShapeShft tools in your web browser:

1. A project in Claude or ChatGPT named "ShapeShft", holding the ShapeShft instructions and your three career files. Every chat in the project starts with them.
2. The **Resume Workbench** (`2-Tools/ShapeShft-Resume-Workbench.html`) for editing and exporting your resume.
3. The **Practice Guide Builder** (`2-Tools/ShapeShft-Practice-Guide-Builder.html`) for offline practice guides.

The two tools run in any web browser on your own device. They do not need an AI account, and they do not send your information anywhere.

Setup guides: [Setting up Claude](setup-claude.md) and [Setting up ChatGPT](setup-chatgpt.md). For any other assistant, see "Other assistants" below.

## Comparing the options

| | Claude (free) | ChatGPT (free) | Paid plans (either) |
|---|---|---|---|
| Projects (instructions and files that stay) | Yes, up to 5 projects | Yes, up to 5 files per project | Yes, more |
| Uploading files | Yes (no daily number is published) | 3 file uploads per day | Higher limits |
| Creating downloadable files (for example an updated `career-profile.md`) | Yes | Not stated on the pricing page. Expect to copy text from a box | Claude: yes. ChatGPT: check the pricing page |
| ShapeShft skills (optional) | Yes | Not used. Use the project setup | Claude: yes |
| How much text it can work with at once (context window) | Large (varies by model) | About 27,000 tokens on the free model | Larger |
| Usage limits | Limited, reset every 5 hours and weekly | Limited, may be lower at busy times | Much higher |

ShapeShft has been designed so the free limits are workable:

- You keep only four files in a project: the instructions and your three career files. That fits ChatGPT's free limit of 5 project files.
- ChatGPT Free allows 3 uploads a day, so on the first day upload the instructions file and your Career Profile. Add the other two the next day, or paste their text into the chat.
- If you reach an upload limit, you can paste the text of a file into the chat instead of uploading it.
- **ChatGPT Free and long files:** the ShapeShft instructions file is about 21,000 tokens, close to ChatGPT Free's 27,000-token limit. ChatGPT reads project files in parts, so it can still use them, but in long chats it may miss instructions. Start a new chat for each task (for example one chat per application), and if it skips a step, tell it: "Please check the ShapeShft instructions for this step."
- If you reach a message limit, ask for your updated files and a "where we left off" note (prompt 16 in the Starter Prompts), and continue later or in another assistant.

## The two-assistant workflow

Some people do their career thinking in one assistant (for example ChatGPT) and use the other (for example Claude) for other tasks. ShapeShft supports this because everything is plain text:

- The career files are Markdown text. Any assistant can read them.
- The Workbench JSON is plain text. Any assistant can write it, and the Workbench runs in your browser either way.

You do not need two assistants. One is simpler, and it is the recommended setup for beginners.

## Inside Claude only: AI buttons in the Workbench

The Workbench has buttons that ask an AI about one line of your resume (the Discuss tab). They send the request directly only when the Workbench runs as a Claude artifact. When you open the Workbench file in your browser (the normal way), those buttons give you the request as text to copy into your assistant. Everything else in the Workbench works the same either way.

## Other assistants

Any chat assistant that can read a long instruction file should work. Without projects:

1. Start a new chat.
2. Attach `1-AI-Setup/ShapeShft-AI-Instructions.md` and your career files, or paste their text.
3. Send: "Please follow these ShapeShft instructions for this conversation."

Results depend on the model. Smaller or older models may forget instructions in long chats, write JSON with errors, or invent details. Check every fact in anything you send to an employer.

## Things to know about any AI

- AI assistants make mistakes, including confident ones. You are the authority on your own experience. Check every resume line before you send it.
- AI opinions about your resume are not an employer's applicant tracking system (ATS) result, and nobody can promise an interview.
- Read [Privacy](privacy.md) before sharing personal information with any AI provider.
