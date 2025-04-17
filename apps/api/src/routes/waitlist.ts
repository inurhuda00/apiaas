import type { ContentfulStatusCode } from "hono/utils/http-status";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { Env } from "@/types";
import { z } from "zod";
import { database } from "@apiaas/db";
import { waitlist } from "@apiaas/db/schema";
import { Resend } from "resend";
import { html } from "hono/html";

const waitlistRoute = new Hono<{ Bindings: Env }>();

const waitlistSchema = z.object({
	email: z.string().email(),
	token: z.string(),
});

waitlistRoute.get("/", (c) => {
	return c.html(
		html`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>AI Backgrounds for Digital Goods - Join Waitlist</title><script src="https://cdn.tailwindcss.com"></script><script src="https://challenges.cloudflare.com/turnstile/v0/api.js" defer></script><style>#message-area{min-height:24px;margin-top:1rem;font-weight:500}</style></head><body class="bg-white flex items-center justify-center min-h-screen p-4"><div class="bg-white p-8 border-2 border-black w-full max-w-md"><h1 class="text-3xl md:text-4xl font-extrabold text-center text-black mb-4 uppercase tracking-wide">Instantly Elevate Your Digital Goods</h1><p class="text-center text-black mb-8">Stop using boring backgrounds. Generate unique, professional AI visuals in seconds. Be the first to access!</p><form id="waitlist-form" class="space-y-6"><div><label for="email" class="flex items-center text-sm font-medium text-black mb-1">Email Address</label><input type="email" id="email" name="email" class="w-full px-3 py-2 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black sm:text-sm placeholder-gray-500" placeholder="you@example.com"></div><div class="cf-turnstile" data-sitekey="${c.env.TURNSTILE_SITE_KEY}" data-theme="light"></div><button type="submit" class="w-full flex items-center justify-center py-3 px-4 border-2 border-black bg-stone-400 text-black text-sm font-bold rounded-none hover:bg-stone-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">Join Waitlist</button></form><div id="message-area" class="mt-4 text-center text-sm"></div></div><script>document.getElementById("waitlist-form").addEventListener("submit",async e=>{e.preventDefault();const msgArea=document.getElementById("message-area");msgArea.textContent="";msgArea.className="mt-4 text-center text-sm font-medium";const email=e.target.email.value;const token=e.target.querySelector('input[name="cf-turnstile-response"]')?.value;if(!token){msgArea.textContent="Verification challenge failed. Please complete the check.";msgArea.classList.add("text-red-600");return}const btn=e.target.querySelector('button[type="submit"]');btn.disabled=true;btn.textContent="Submitting...";btn.classList.add("opacity-75","cursor-not-allowed");try{const res=await fetch("/waitlist",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,token})});const data=await res.json();if(data.success){msgArea.textContent="Success! You're on the list for AI Backgrounds for Digital Goods.";msgArea.classList.add("text-green-600");e.target.reset()}else{msgArea.textContent="Error: "+(data.error||"Submission failed.");msgArea.classList.add("text-red-600")}}catch(err){console.error("Submission error:",err);msgArea.textContent="Network error. Please try again.";msgArea.classList.add("text-red-600")}finally{if(typeof turnstile!=="undefined")turnstile.reset();btn.disabled=false;btn.innerHTML="Join Waitlist";btn.classList.remove("opacity-75","cursor-not-allowed")}});</script></body></html>`,
	);
});

waitlistRoute.post("/", zValidator("json", waitlistSchema), async (c) => {
	const { email, token } = c.req.valid("json");

	const address = c.req.raw.headers.get("CF-Connecting-IP");

	const idempotencyKey = crypto.randomUUID();
	const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
	const firstResult = await fetch(url, {
		body: JSON.stringify({
			secret: c.env.TURNSTILE_SECRET_KEY,
			response: token,
			remoteip: address,
			idempotency_key: idempotencyKey,
		}),
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
	});

	const firstOutcome = (await firstResult.json()) as { success: boolean };

	if (!firstOutcome.success) {
		console.info("Turnstile verification failed", firstOutcome);
		return c.json({ error: "Turnstile verification failed" }, 439 as ContentfulStatusCode);
	}

	const resend = new Resend(c.env.RESEND_API_KEY);

	const db = database(c.env.HYPERDRIVE.connectionString);

	const ip =
		c.req.header("cf-connecting-ip") ||
		`${c.req.raw.cf?.asn}-${c.req.raw.cf?.country}-${c.req.raw.cf?.city}-${c.req.raw.cf?.region}-${c.req.raw.cf?.postalCode}`;

	const { success } = await c.env.EMAIL_LIMITER.limit({ key: ip });

	if (!success) {
		return c.json({ error: "Rate limit exceeded" }, 429);
	}

	const message = `Mondive began as a creative project that quickly captured imaginations.
        <br></br>
        Your incredible response showed me this was something special - far beyond my initial vision.
        <br></br>
        What makes us unique is our focus on designer-quality backgrounds that adapt to your brand instantly - no more generic AI art that everyone else uses.
        <br></br><br></br>
        It's time to evolve. Mondive will become the premier destination for AI-generated backgrounds that transform creative projects.
        `;

	try {
		await db.insert(waitlist).values({ email });
		await resend.emails.send({
			from: "Hanssky From Mondive <waitlist@mondive.xyz>",
			to: email,
			subject: "Welcome to Mondive - Unlock Your Creative Potential",
			html: `<p>Hanssky heree..<br></br> ${message} <br></br><br></br>We're building the ultimate AI background generator for designers and startups. Unique visuals that make your work stand out - instantly.<br></br><br></br>I'll notify you at launch! Questions? Just reply - I'd love to hear from you.<br></br>Find me on X: <a href='https://x.com/hanssky'>@hanssky</a><br></br><br></br>Creatively yours,<br></br>- Hanssky</p>`,
		});
	} catch (e) {
		console.error(e);
		return c.json({ error: "Failed to add to waitlist" }, 400);
	}

	return c.json({ success: true });
});

export default waitlistRoute;
