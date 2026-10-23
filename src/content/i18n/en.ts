/** Localized shape of a `GameEventDef`'s player-facing copy. */
export interface LocalizedEventText {
  text: string;
  sub?: string;
}

/** Localized shape of a `TierDef`'s player-facing copy. */
export interface LocalizedTierText {
  name: string;
  headline: string;
  subline: string;
}

/** Localized shape of an `EndingDef`'s player-facing copy. */
export interface LocalizedEndingText {
  title: string;
  blurb: string;
}

/** Localized shape of an `AchievementDef`'s player-facing copy. */
export interface LocalizedAchievementText {
  title: string;
  hint: string;
}

/**
 * English event deck. Rewritten, not translated: deadpan corporate legalese
 * followed by one concrete absurdity. One entry per id in `EVENTS`.
 */
export const EN_EVENTS: Record<string, LocalizedEventText> = {
  "open-consent": {
    text: "Your first confirmation has been received and forwarded to three people who should not know.",
    sub: "This button has passed zero (0) safety certifications.",
  },
  "open-hand": {
    text: "Holding it down does not undo what happened. It undoes your hand.",
    sub: "Disclaimer: the hand is yours. The consequences are Company property.",
  },
  "open-red": {
    text: "The red is sourced from a very expensive hesitation. No returns.",
    sub: "The color has been entered into depreciation.",
  },
  "open-warranty": {
    text: "Friendly reminder: this button cannot be broken by pressing.",
    sub: "Only by being held accountable afterward.",
  },
  "open-archive": {
    text: "This press has been logged, reported, filed, and left with no way back.",
    sub: "The file number begins with your employee ID.",
  },
  "open-payroll": {
    text: "Finance has moved your name from Payroll to Remarks.",
    sub: "Remarks are not eligible for annual raises.",
  },
  "memo-form": {
    text: "This press requires a paper form. The printer only accepts copies.",
    sub: "Copies are made on Floor 3. Floor 3 has been dissolved.",
  },
  "memo-stamp": {
    text: "Approved: your request received seven stamps. Six are identical.",
    sub: "The seventh is round and means something unclear.",
  },
  "memo-meeting": {
    text: "A meeting about this button is now in its fourth hour.",
    sub: "Agenda item one: what color the button is.",
  },
  "memo-kpi": {
    text: "Your KPI has been updated. This month's target: do not press the button.",
    sub: "Current progress: negative.",
  },
  "memo-annual": {
    text: "Raffle results: first prize is continuing to work here.",
    sub: "Second prize is second prize.",
  },
  "memo-hr": {
    text: "HR has reclassified your role as Button-Adjacent.",
    sub: "The role has no headcount and no chair.",
  },
  "svc-ticket": {
    text: "Support has accepted your ticket. Your number is your press duration.",
    sub: "Estimated response time: after you give up.",
  },
  "svc-bot": {
    text: "The support bot understands how you feel. It does not have feelings.",
    sub: "For a human, first prove you are a human.",
  },
  "svc-hold": {
    text: "Please hold. Your call is important to us. Time on hold: three hours.",
    sub: "The music will loop until you give up or fall asleep.",
  },
  "svc-phone": {
    text: "The hotline kept talking after you hung up, in a patient voice.",
    sub: "It is explaining your issue to a disconnected number.",
  },
  "cat-desk": {
    text: "A cat has appeared at your desk. No department claims it.",
    sub: "HR is investigating how it was onboarded.",
  },
  "cat-review": {
    text: "The cat passed this quarter's review on the grounds of non-participation.",
    sub: "Comment: consistently uninvolved.",
  },
  "cat-meeting": {
    text: "Facilities reports the meeting room has been seized by cats, for sun.",
    sub: "The meeting moved to the hallway. The hallway has cats.",
  },
  "cat-badge": {
    text: "A cat took your badge. HR is treating this as a resignation.",
    sub: "The cat will handle offboarding. The cat has left for the day.",
  },
  "tax-cat": {
    text: "Tax office: cats are fixed assets. Three months of cat tax is due.",
    sub: "Cat tax is denominated in cats.",
  },
  "tax-fun": {
    text: "This button has been ruled a recreational expense. Not deductible.",
    sub: "The definition of recreation is interpreted by us alone.",
  },
  "tax-invoice": {
    text: "Invoice issued. Payee: Universe. The tax ID field reads: pending.",
    sub: "Finance says it is compliant, just not very compliant.",
  },
  "legal-read": {
    text: "Legal reviewed this copy and removed every part that was legible.",
    sub: "What remains: the, of, and three commas.",
  },
  "legal-void": {
    text: "WARRANTY VOID. The warranty expired while you were reading this.",
    sub: "Expiry timestamp: now.",
  },
  "legal-terms": {
    text: "Pressing again means you accept a contract not yet drafted.",
    sub: "The drafter has resigned and is not coming back.",
  },
  "legal-liability": {
    text: "The Company accepts no consequences for any consequences of pressing.",
    sub: "This sentence also has no consequences.",
  },
  "phi-exist": {
    text: "A philosophy graduate asks: does the button exist, or only your pressing?",
    sub: "He is currently interning in Support.",
  },
  "phi-script": {
    text: "The philosophy graduate's first Support line was: what is a problem?",
    sub: "The ticketing system built him a category.",
  },
  "phi-hallway": {
    text: "Someone argued for the button's free will in the hallway. Security came.",
    sub: "Security's argument was shorter and worked better.",
  },
  "qm-other": {
    text: "In another universe you did not press. That universe is laughing politely.",
    sub: "The laugh tunneled here. Slight delay.",
  },
  "qm-observe": {
    text: "The button is both pressed and not pressed until Finance observes it.",
    sub: "Observation result: cost.",
  },
  "qm-collapse": {
    text: "The waveform has collapsed. The direction was set by this quarter's budget.",
    sub: "Budget was insufficient. The collapse is perfunctory.",
  },
  "cos-store": {
    text: "At the end of the universe there is a convenience store. It asks for a card.",
    sub: "Your card is not valid in this universe.",
  },
  "cos-id": {
    text: "Cosmically, this button's serial number is small. It still counts as large.",
    sub: "It is in the star chart now. The star chart is expanding.",
  },
  "cos-map": {
    text: "The star chart marks your location as previously pressed.",
    sub: "The marker cannot be deleted or undone.",
  },
  "food-sandwich": {
    text: "Today's cafeteria ham sandwich contains conceptual ham.",
    sub: "Concepts are explained by the cafeteria. Explanations are sold out.",
  },
  "food-vendor": {
    text: "The vending machine dispensed a ham sandwich and a receipt saying sorry.",
    sub: "The sandwich is the sole beneficiary of this event.",
  },
  "food-soup": {
    text: "Today the cafeteria soup tastes like Administrative.",
    sub: "The flavor comes from an unapproved recipe.",
  },
  "print-jam": {
    text: "The printer jammed. What jammed was your press record.",
    sub: "The technician says the paper has words. The words object.",
  },
  "print-night": {
    text: "At 3 a.m. the printer produced one page. It said: do not press.",
    sub: "Unsigned, but the tone is unmistakably Legal.",
  },
  "hr-jd": {
    text: "Hiring: Button Operator. Requires three years of button operations.",
    sub: "New grads welcome. Must bring own button.",
  },
  "hr-jd2": {
    text: "Job description adds one line: must withstand colleagues watching.",
    sub: "Watching is not overtime and is not reimbursable.",
  },
  "ops-clock": {
    text: "The time clock shows 47 consecutive hours worked, 46 of them pressing.",
    sub: "The remaining hour was spent clocking in.",
  },
  "ops-audit": {
    text: "Audit found this department's only output is growth in press count.",
    sub: "Audit recommends counting the growth as output.",
  },
  "ops-insure": {
    text: "The Company insured you. The beneficiary is the button.",
    sub: "Page seven of the policy reads: we had no choice either.",
  },
  "ops-pension": {
    text: "Your pension has been converted into press-count futures.",
    sub: "Currently priced negative, with excellent liquidity.",
  },
  "ops-promo": {
    text: "Congratulations on the promotion: you now own button communications.",
    sub: "Communications are conducted by pressing it.",
  },
  "ops-chat": {
    text: "Someone tagged you in the group chat: was that you just now.",
    sub: "You have not replied. They sent the screenshot to Legal.",
  },
  "ops-exit": {
    text: "Your exit process has started. Reason: disagreement with the button.",
    sub: "The details are in the attachment. The attachment is lost.",
  },
  "ops-fire": {
    text: "Fire drill in progress. Please continue pressing in an orderly manner.",
    sub: "The evacuation route passes the button. Do not linger.",
  },
  "ops-lift": {
    text: "New elevator notice: this floor's button is a hazardous material.",
    sub: "Hazardous materials require two employees present to press.",
  },
  "ops-hall": {
    text: "A sigh came from the end of the hallway. Source unknown. Billed monthly.",
    sub: "Sighs are metered. This month's quota is exceeded.",
  },
  "ops-intern": {
    text: "The intern asked whether the button can be pressed. He was sent to Legal.",
    sub: "Legal is asking the intern the same question.",
  },
  "ops-census": {
    text: "Statistics office calling to verify: how many cats are in your home?",
    sub: "Answering truthfully will change the statistic.",
  },
  "ops-mirror": {
    text: "A note on the restroom mirror reads, in full: are you sure?",
    sub: "Below it someone has added: I am sure.",
  },
  "ops-coffee": {
    text: "One sip of coffee remains, and the button has reserved it.",
    sub: "The button does not drink coffee. It has priority.",
  },
  "ops-receipt": {
    text: "The receipt is 2.3 meters long. Its primary content is blank space.",
    sub: "1,400 blank spaces, all stamped.",
  },
  "ops-notice": {
    text: "Notice: this button will undergo scheduled non-maintenance on Monday.",
    sub: "The button will operate normally throughout. Not a conflict.",
  },
  "ops-badge": {
    text: "Your badge photo has been replaced with a photo of the button.",
    sub: "Security has begun saluting you.",
  },
  "ops-oath": {
    text: "You are asked to swear loyalty to the button. The oath: I pressed.",
    sub: "No witnesses attended. One printer did.",
  },
  "ops-prize": {
    text: "The Company won an internal award for sustained button research.",
    sub: "The prize is the button. Collect it on stage, by pressing.",
  },
  "ops-deadline": {
    text: "The deadline has passed. The deadline did not know it had passed.",
    sub: "It is now a quoted string.",
  },
  "ops-ghost": {
    text: "The log contains a press you never made. It is timestamped earlier.",
    sub: "The employee ID is yours. The start date is next year.",
  },
  "ops-error": {
    text: "System error: button not found. Please press the button to continue.",
    sub: "The error code means do not ask.",
  },
  "ops-clock2": {
    text: "The clock stopped. You are still pressing, so time is still passing.",
    sub: "The passing portion is not counted as work hours.",
  },
  "ops-stairs": {
    text: "The stairwell light needs the button pressed to turn on. It gave up.",
    sub: "The light completed a self-assessment in the dark.",
  },
  "ops-park": {
    text: "The parking gate scanned your face and classified it as button.",
    sub: "The gate then began charging you.",
  },
  "ops-reset": {
    text: "The system grants you a breather: your combo has been reset to zero.",
    sub: "The breather is also counted as work hours.",
  },
  "rare-award": {
    text: "This button once won an international award. The judges were the button.",
    sub: "The ceremony was held inside the button. Seating was limited.",
  },
  "rare-call": {
    text: "An international organization called to say hello, then apologized.",
    sub: "Before hanging up it added: take care.",
  },
  "rare-quake": {
    text: "The button trembled slightly. Magnitude 3.1. Epicenter: Finance.",
    sub: "Finance denies the tremor and denies existing.",
  },
  "rare-fire": {
    text: "The archive caught fire. Everything that burned was about you.",
    sub: "After the fire was out, the ashes were filed.",
  },
  "rare-time": {
    text: "Time slowed half a beat beneath your finger, then charged interest.",
    sub: "Interest is denominated in milliseconds and has been booked.",
  },
  "rare-cat-stage": {
    text: "A cat walked to the podium and declared the meeting closed.",
    sub: "Everyone applauded. The cat dictated the minutes.",
  },
  "req-cats": {
    text: "The number of cats now exceeds this department's coping capacity.",
    sub: "Coping capacity was previously one cat.",
  },
  "req-chaos": {
    text: "Chaos has been added to the financial statements under Other.",
    sub: "Other is 97% of total assets.",
  },
  "req-combo": {
    text: "Combo presses are now classified as labor, without overtime pay.",
    sub: "Labor law here is a PDF that will not open.",
  },
  "req-trust": {
    text: "Trust is low. The system has switched to Polite But Distant mode.",
    sub: "In this mode every reply ends with: suit yourself.",
  },
  "req-coins": {
    text: "The account is negative. The bank called, only to chat.",
    sub: "The chat is about the balance. The tone is concern.",
  },
  "req-cats5": {
    text: "Five cats are looking at you. This is our highest approval level.",
    sub: "Result: approved, with one yawn attached.",
  },
  "req-tier3": {
    text: "This tier no longer offers explanations. It offers outcomes.",
    sub: "The Explanations Department merged into Outcomes last month.",
  },
  "req-slow": {
    text: "You have been here one minute. The Company has requested a memento.",
    sub: "The memento is this button. Please collect it yourself.",
  },
  "once-first": {
    text: "This is your first press. HR has prepared a small gift: this record.",
    sub: "The gift cannot be returned or bragged about.",
  },
  "once-seven": {
    text: "Seventh press. The system suspects a habit, not an accident.",
    sub: "Habits are listed as voluntary in the employee handbook.",
  },
  "once-ten": {
    text: "Tenth press. The system will stop reminding you. Reminders failed.",
    sub: "The Reminders Department was dissolved, same reason.",
  },
  "once-twelve": {
    text: "A cat appeared on camera for the first time. The footage did not save.",
    sub: "The only evidence is one hair, sealed by Legal.",
  },
  "once-25": {
    text: "Twenty-fifth press. The Company formed a task force to sigh.",
    sub: "Five members. All have met their sigh quota.",
  },
  "once-30": {
    text: "A box was placed by your desk. Inside the box is another box.",
    sub: "The second box is labeled spare.",
  },
  "once-50": {
    text: "Fiftieth press. Finance prepared a badge for you. The badge is negative.",
    sub: "Wearing instructions: do not wear.",
  },
  "once-88": {
    text: "Eighty-eighth press. Reception says this number is lucky. Keep going.",
    sub: "Reception has been reassigned for saying that.",
  },
  "once-100": {
    text: "Hundredth press. Your desk has been rebuilt in the shape of the button.",
    sub: "The chair is also a button. Sitting counts as pressing.",
  },
};

/** English tier names keep the escalation: polite, procedural, cosmic, done. */
export const EN_TIERS: Record<string, LocalizedTierText> = {
  "tier-calm": {
    name: "Tier 1 · Polite Refusal",
    headline: "Please do not press this button.",
    subline: "This notice has passed zero (0) safety certifications. Enjoy.",
  },
  "tier-paper": {
    name: "Tier 2 · Procedural",
    headline: "You are now in a process. No exit is guaranteed.",
    subline: "The relevant forms are printing. The printer is jamming.",
  },
  "tier-panic": {
    name: "Tier 3 · Departmental Unrest",
    headline: "The Company is meeting about you. There is no agenda.",
    subline: "Please remain where you are. Do not leave. Do not explain.",
  },
  "tier-cosmic": {
    name: "Tier 4 · Cosmic Settlement",
    headline: "This button is now on the universe's fixed asset register.",
    subline: "Depreciation method: by you.",
  },
  "tier-void": {
    name: "Tier 5 · Nothing Left To Say",
    headline: "No copy remains. The above is system-generated silence.",
    subline: "Silence is also logged as work hours, unpaid.",
  },
};

/** English ending titles: one to four words, deadpan. */
export const EN_ENDINGS: Record<string, LocalizedEndingText> = {
  "ending-combo": {
    title: "Speed Incident",
    blurb: "Your fingers have been classified as a natural disaster.",
  },
  "ending-lucky": {
    title: "Auspicious",
    blurb: "Eighty-eight. Reception called it lucky, then was reassigned.",
  },
  "ending-broke": {
    title: "Fiscally Adrift",
    blurb: "The company account has entered another dimension.",
  },
  "ending-cats": {
    title: "Under New Management",
    blurb: "The cats took over. First decision: cancel the button.",
  },
  "ending-silent": {
    title: "On Mute",
    blurb: "You turned the sound off. Now it is you and what you did.",
  },
  "ending-speedrun": {
    title: "Any% Speedrun",
    blurb: "An entire career destroyed in under fifteen seconds.",
  },
  "ending-loyal": {
    title: "Employee of the Month",
    blurb: "One hundred presses. The Company is putting that in your file.",
  },
  "ending-abyss": {
    title: "Full Alignment",
    blurb: "Chaos is maxed, trust is floored, and both sides are calm.",
  },
  "ending-overtime": {
    title: "Five More Minutes",
    blurb: "Five minutes elapsed. The Company reads this as enthusiasm.",
  },
  "ending-zero": {
    title: "Zeroed",
    blurb: "Trust is exactly zero, chaos is capped. The system shook your hand.",
  },
};

/** English achievement wall: half explicit, half secret. */
export const EN_ACHIEVEMENTS: Record<string, LocalizedAchievementText> = {
  "ach-first": {
    title: "Commenced",
    hint: "The button is right there. It will not press itself.",
  },
  "ach-ten": {
    title: "Proficient",
    hint: "After ten, your finger is registered as equipment.",
  },
  "ach-combo5": {
    title: "Combo Basics",
    hint: "Do not breathe between presses. The Company reads that as overtime.",
  },
  "ach-cat1": {
    title: "First Colleague",
    hint: "Press until a cat appears. Cats onboard faster than you.",
  },
  "ach-broke": {
    title: "In the Red",
    hint: "Press the account negative. Finance will applaud, then book it.",
  },
  "ach-chaos80": {
    title: "Minister of Chaos",
    hint: "Chaos at 80. Your job description voids itself automatically.",
  },
  "ach-loyal50": {
    title: "Long-Term Thinking",
    hint: "Fifty presses. The Company calls that loyalty, not something else.",
  },
  "ach-combo15": {
    title: "Unnatural Speed",
    hint: "Fifteen in a row. Human hands should not. Nobody will stop you.",
  },
  "ach-cat10": {
    title: "Unit of Cat",
    hint: "When the cats qualify as a department, the tax office arrives first.",
  },
  "ach-debt": {
    title: "Deeply Negative",
    hint: "Five thousand in debt. Your bank will switch to a gentler voice.",
  },
  "ach-muted": {
    title: "The Muted One",
    hint: "Mute it, then press. The world goes quiet. The situation does not.",
  },
  "ach-fast": {
    title: "Two Hundred Milliseconds",
    hint: "Under 200ms between presses. Do not try near the water cooler.",
  },
  "ach-slow": {
    title: "Two Minutes",
    hint: "Stay in one run for two minutes. Harder than it sounds. As pointless.",
  },
  "ach-trust0": {
    title: "Zero Trust",
    hint: "Press trust down to zero. Not an architecture. Literally.",
  },
};
