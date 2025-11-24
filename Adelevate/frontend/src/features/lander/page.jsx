import React, { useState } from "react";
import { FileText, Sparkles, Repeat, Download, Wand2, Rocket, CheckCircle2, Loader2, ExternalLink } from "lucide-react";

const steps = [
  {
    title: "Collect the Used Lander",
    description:
      "Start with the live or most recently used lander. Gather the URL, assets, copy, and any notes from the latest test so we know the current baseline.",
    accent: "from-violet-500/10 via-fuchsia-500/5 to-pink-500/10",
  },
  {
    title: "Download the Clarity Report",
    description:
      "Export a fresh session/report from Microsoft Clarity. These insights highlight the friction points and successes we'll respond to.",
    accent: "from-sky-500/10 via-cyan-500/5 to-emerald-500/10",
  },
  {
    title: "Fix the Prompt in ChatGPT",
    description:
      "Review the Clarity findings and refine the prompt inside ChatGPT so that it captures the fixes we need to implement on the lander.",
    accent: "from-amber-500/10 via-orange-500/5 to-yellow-500/10",
  },
  {
    title: "Ship to Loveable",
    description:
      "Copy the improved prompt into Loveable. Generate a fresh lander variant that applies the updated copy, layout tweaks, and UX fixes.",
    accent: "from-indigo-500/10 via-blue-500/5 to-purple-500/10",
  },
  {
    title: "Deploy & Test",
    description:
      "Use the new Loveable lander in the upcoming tests. Track the same metrics in Clarity to verify the impact and prep for the next loop.",
    accent: "from-green-500/10 via-lime-500/5 to-emerald-500/10",
  },
];

// Dummy data generators
const generateClarityReport = (url) => ({
  landerUrl: url || "https://lander.adelevate.com/v5/energy-saver",
  reportId: `clarity-rpt-${Date.now().toString().slice(-6)}`,
  api: "GET https://api.clarity.microsoft.com/v1/sessions?siteId=adelevate&date=2024-11-21",
  sessions: 1247,
  bounceRate: "42%",
  avgSessionDuration: "2m 34s",
  topIssues: [
    "High scroll drop-off above hero fold (42%)",
    "CTA button has low contrast (accessibility score: 2.1/4)",
    "Mobile users exit before seeing value proposition",
  ],
  heatmapData: {
    clicks: 892,
    scrolls: 523,
    rageClicks: 12,
  },
  timestamp: new Date().toISOString(),
});

const generatePromptDraft = (clarityData) => {
  if (!clarityData) {
    return `We observed a 42% scroll drop-off above the hero fold.
- Rebuild the hero headline to empathize with energy-bill anxiety.
- Move CTA higher with a contrasting button.
- Add a 3-step explainer under the hero with iconography.

Keep tone confident but friendly.`;
  }
  
  return `Based on Clarity report ${clarityData.reportId}:
- ${clarityData.topIssues[0]} - Address with stronger hero copy
- ${clarityData.topIssues[1]} - Increase button contrast to meet WCAG AA
- ${clarityData.topIssues[2]} - Add mobile-first value proposition above fold

Tone: Confident but friendly. Target audience: Homeowners concerned about winter energy costs.`;
};

const generateLoveableResponse = (prompt) => ({
  projectId: `lvb-lander-${Date.now().toString().slice(-6)}`,
  previewUrl: `https://loveable.ai/preview/lvb-lander-${Date.now().toString().slice(-6)}`,
  notes: [
    "Hero headline rewritten: \"Slash Winter Bills With Smart Heat Sync.\"",
    "CTA moved above the fold, button color swapped to #F97316 (WCAG AA compliant).",
    "Added three-icon explainer using Adelevate's icon set.",
    "Mobile-first layout optimized for viewport < 768px.",
    "Accessibility score improved from 2.1/4 to 3.8/4.",
  ],
  status: "ready",
  timestamp: new Date().toISOString(),
});

const LanderPage = () => {
  const [landerUrl, setLanderUrl] = useState("https://lander.adelevate.com/v5/energy-saver");
  const [clarityData, setClarityData] = useState(null);
  const [isLoadingClarity, setIsLoadingClarity] = useState(false);
  const [claritySuccess, setClaritySuccess] = useState(false);
  
  const [promptText, setPromptText] = useState(generatePromptDraft(null));
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);
  const [promptSuccess, setPromptSuccess] = useState(false);
  
  const [loveableData, setLoveableData] = useState(null);
  const [isGeneratingLander, setIsGeneratingLander] = useState(false);
  const [landerSuccess, setLanderSuccess] = useState(false);

  const handleFetchClarity = async () => {
    setIsLoadingClarity(true);
    setClaritySuccess(false);
    
    // Simulate API call with dummy data
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const report = generateClarityReport(landerUrl);
    setClarityData(report);
    setIsLoadingClarity(false);
    setClaritySuccess(true);
    
    // Auto-populate prompt with clarity insights
    setPromptText(generatePromptDraft(report));
    
    // Clear success message after 3 seconds
    setTimeout(() => setClaritySuccess(false), 3000);
  };

  const handleSavePrompt = async () => {
    setIsSavingPrompt(true);
    setPromptSuccess(false);
    
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSavingPrompt(false);
    setPromptSuccess(true);
    
    setTimeout(() => setPromptSuccess(false), 3000);
  };

  const handleGenerateLander = async () => {
    setIsGeneratingLander(true);
    setLanderSuccess(false);
    
    // Simulate Loveable API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const response = generateLoveableResponse(promptText);
    setLoveableData(response);
    setIsGeneratingLander(false);
    setLanderSuccess(true);
    
    setTimeout(() => setLanderSuccess(false), 3000);
  };
  return (
    <div className="min-h-screen w-full bg-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10 lg:px-10">
        <header className="space-y-4 rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-4 py-1 text-sm font-semibold text-indigo-800">
            <Sparkles className="h-4 w-4" />
            Lander Workflow
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-slate-900">
              Keep the Lander loop tight and traceable
            </h1>
            <p className="text-base text-slate-600">
              Every iteration follows a predictable chain so anyone can jump in,
              see where we are, and contribute. Use the section below to log
              what is ready, what needs review, and what will ship next.
            </p>
          </div>
        </header>

        {/* Section 1: Clarity API */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Step 1
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">
                Download the Clarity Report
              </h2>
              <p className="mt-2 text-slate-600">
                Provide the production lander URL so we can fetch the latest Clarity session packet.
                The API details and dummy payload below show what the call looks like.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
              <Download className="h-5 w-5 text-indigo-500" />
              API: <span className="font-semibold text-slate-900">Clarity v1</span>
            </div>
          </div>
          <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); handleFetchClarity(); }}>
            <label className="text-sm font-semibold text-slate-700">
              Lander URL
              <input
                type="url"
                value={landerUrl}
                onChange={(e) => setLanderUrl(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                placeholder="https://lander.adelevate.com/v5/energy-saver"
              />
            </label>
            
            {clarityData && (
              <div className="rounded-2xl border-2 border-green-200 bg-green-50/50 p-6 space-y-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="font-semibold">Report fetched successfully!</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-600">Report ID</p>
                      <p className="text-sm font-mono text-slate-900">{clarityData.reportId}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600">Sessions Analyzed</p>
                      <p className="text-lg font-bold text-indigo-600">{clarityData.sessions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600">Bounce Rate</p>
                      <p className="text-lg font-bold text-red-600">{clarityData.bounceRate}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-600">Top Issues</p>
                      <ul className="mt-2 space-y-1">
                        {clarityData.topIssues.map((issue, idx) => (
                          <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                            <span className="text-red-500 mt-1">•</span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-900/95 p-4">
                  <p className="text-xs font-semibold text-slate-400 mb-2">Full Report Data</p>
                  <pre className="overflow-auto text-xs text-slate-100">
                    {JSON.stringify(clarityData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            
            {!clarityData && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Dummy payload preview
                </p>
                <pre className="mt-2 overflow-auto rounded-xl bg-slate-900/95 p-4 text-sm text-slate-100">
                  {JSON.stringify({
                    landerUrl: landerUrl,
                    reportId: "clarity-rpt-XXXXXX",
                    api: "GET https://api.clarity.microsoft.com/v1/sessions?siteId=adelevate&date=2024-11-21",
                  }, null, 2)}
                </pre>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoadingClarity}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingClarity ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Fetching report...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Fetch dummy report
                </>
              )}
            </button>
          </form>
        </section>

        {/* Section 2: Prompt correction */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Step 2
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">
                Correct the Prompt in ChatGPT
              </h2>
              <p className="mt-2 text-slate-600">
                Use the Clarity insight to tighten the instruction. The prompt will auto-populate when you fetch the Clarity report.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
              <Wand2 className="h-5 w-5 text-indigo-500" />
              Model: <span className="font-semibold text-slate-900">gpt-4o</span>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {promptSuccess && (
              <div className="rounded-2xl border-2 border-green-200 bg-green-50/50 p-4 flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-semibold">Prompt saved successfully!</p>
              </div>
            )}
            <label className="text-sm font-semibold text-slate-700">
              Corrected Prompt
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="mt-2 min-h-[200px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                placeholder="Enter or edit your ChatGPT prompt here..."
              />
            </label>
            {clarityData && (
              <div className="rounded-xl bg-blue-50/50 border border-blue-200 p-3">
                <p className="text-xs font-semibold text-blue-800 mb-1">💡 Tip</p>
                <p className="text-sm text-blue-700">
                  Prompt auto-populated from Clarity report {clarityData.reportId}. Edit as needed before saving.
                </p>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                Log the prompt so the next editor knows what was shipped.
              </p>
              <button
                type="button"
                onClick={handleSavePrompt}
                disabled={isSavingPrompt || !promptText.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingPrompt ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Save prompt
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Section 3: Loveable build */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Step 3
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">
                Build the Lander in Loveable
              </h2>
              <p className="mt-2 text-slate-600">
                Use the saved prompt to generate a new lander variant in Loveable AI. Click the button below to simulate the generation with dummy data.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
              <Rocket className="h-5 w-5 text-indigo-500" />
              Builder: <span className="font-semibold text-slate-900">Loveable AI</span>
            </div>
          </div>
          
          {!loveableData && (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center">
              <Rocket className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 mb-1">No lander generated yet</p>
              <p className="text-xs text-slate-500">
                Click "Generate Lander" below to create a new lander with the saved prompt
              </p>
            </div>
          )}

          {loveableData && (
            <div className="mt-6 space-y-4">
              {landerSuccess && (
                <div className="rounded-2xl border-2 border-green-200 bg-green-50/50 p-4 flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="font-semibold">Lander generated successfully!</p>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/30 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600 mb-3">
                    Generated Lander
                  </p>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="font-semibold text-slate-600 mb-1">Project ID</dt>
                      <dd className="font-mono text-slate-900 bg-white/50 px-2 py-1 rounded">{loveableData.projectId}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-600 mb-1">Preview URL</dt>
                      <dd>
                        <a
                          href={loveableData.previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 underline font-medium"
                        >
                          {loveableData.previewUrl}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-600 mb-1">Status</dt>
                      <dd>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                          <CheckCircle2 className="h-3 w-3" />
                          {loveableData.status}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/30 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600 mb-3">
                    Change Log
                  </p>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {loveableData.notes.map((note, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-500 mt-1">✓</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {loveableData 
                ? "Review the generated lander above. If it looks good, mark it as ready for testing."
                : "Generate a new lander using the saved prompt from Step 2."
              }
            </p>
            <div className="flex gap-2">
              {!loveableData && (
                <button
                  type="button"
                  onClick={handleGenerateLander}
                  disabled={isGeneratingLander || !promptText.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingLander ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4" />
                      Generate Lander
                    </>
                  )}
                </button>
              )}
              {loveableData && (
                <button
                  type="button"
                  onClick={() => {
                    setLanderSuccess(true);
                    setTimeout(() => setLanderSuccess(false), 3000);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-green-500/30 transition hover:bg-green-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as ready for test
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-indigo-500" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                Process
              </p>
              <h3 className="text-2xl font-semibold text-slate-900">
                From insight to test-ready lander
              </h3>
            </div>
          </div>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className={`rounded-3xl border border-slate-200 bg-gradient-to-r ${step.accent} p-6 backdrop-blur`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-500">
                      Step {index + 1}
                    </p>
                    <h4 className="mt-1 text-xl font-semibold text-slate-900">
                      {step.title}
                    </h4>
                  </div>
                  <span className="text-sm font-medium text-slate-500">
                    Keep deliverables stored in Drive + Clarity folder
                  </span>
                </div>
                <p className="mt-4 text-base text-slate-700">{step.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LanderPage;

