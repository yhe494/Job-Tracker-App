import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postResumeMatch, postResumeMatchWithFile } from "../ai/aiApi";
import type { ResumeMatchResult } from "../ai/aiApi";
import { useAuth } from "../auth/useAuth";
import { createApplication, type ApplicationStatus } from "../applications/applicationsApi";
import { AppHeader } from "../components/AppHeader";
import { PageContainer } from "../components/ui/PageContainer";
import { AlertMessage } from "../components/ui/AlertMessage";
import { FieldLabel, TextAreaInput, TextInput, SelectInput } from "../components/ui/FormControls";
import { PrimaryButton, SecondaryButton } from "../components/ui/Buttons";

export default function ResumeMatchPage() {
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const displayName = user?.name || user?.email || "there";

  const [resumeMode, setResumeMode] = useState<"text" | "upload">("text");
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResumeMatchResult | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const [applicationCompany, setApplicationCompany] = useState("");
  const [applicationRoleTitle, setApplicationRoleTitle] = useState("");
  const [applicationLocation, setApplicationLocation] = useState("");
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | "">("");
  const [applicationJobUrl, setApplicationJobUrl] = useState("");

  const handleResumeModeChange = (mode: "text" | "upload") => {
    setResumeMode(mode);
    setError("");
    setResult(null);

    if (mode === "text") {
      setResumeFile(null);
      return;
    }

    setResumeText("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      setError("Job description is required.");
      return;
    }

    if (resumeMode === "text" && !resumeText.trim()) {
      setError("Resume text is required.");
      return;
    }

    if (resumeMode === "upload" && !resumeFile) {
      setError("Please upload a PDF resume file.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      if (resumeMode === "text") {
        const response = await postResumeMatch({
          resumeText,
          jobDescription,
        });
        setResult(response.data);
      } else {
        const response = await postResumeMatchWithFile(resumeFile!, jobDescription);
        setResult(response.data.matchResult);
      }
    } catch (err) {
      console.error("Error matching resume:", err);
      setError("Failed to get match result. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openAddToApplicationModal = () => {
    setAddError("");
    setApplicationCompany("");
    setApplicationRoleTitle("");
    setApplicationLocation("");
    setApplicationStatus("");
    setApplicationJobUrl("");
    setShowAddModal(true);
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");

    if (!applicationCompany.trim() || !applicationRoleTitle.trim()) {
      setAddError("Company and Position Name are required.");
      return;
    }

    if (!applicationStatus) {
      setAddError("Status is required.");
      return;
    }

    setAdding(true);
    try {
      await createApplication({
        company: applicationCompany.trim(),
        roleTitle: applicationRoleTitle.trim(),
        location: applicationLocation.trim() || undefined,
        status: applicationStatus,
        jobUrl: applicationJobUrl.trim() || undefined,
        description: jobDescription.trim() || undefined,
      });

      setShowAddModal(false);
      nav("/applications");
    } catch (err) {
      console.error("Error creating application:", err);
      setAddError("Failed to add application. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader activeTab="resume-match" displayName={displayName} onLogout={logout} />

      <PageContainer className="space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
            <div className="border-b border-slate-200 px-6 py-7 sm:px-8 lg:border-b-0 lg:border-r">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0B4B4A]">
                Resume match
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                Compare your resume against a role
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                Paste a resume or upload a PDF, then review the match score, missing skills, and
                improvement ideas in a cleaner results layout.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                    <button
                      type="button"
                      onClick={() => handleResumeModeChange("text")}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                        resumeMode === "text"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Input Resume
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResumeModeChange("upload")}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                        resumeMode === "upload"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Upload Resume
                    </button>
                  </div>
                </div>

                {resumeMode === "text" ? (
                  <div>
                    <FieldLabel>Resume</FieldLabel>
                    <TextAreaInput
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      rows={10}
                      className="mt-2"
                      placeholder="Paste your resume content"
                    />
                  </div>
                ) : (
                  <div>
                    <FieldLabel>Resume PDF</FieldLabel>
                    <TextInput
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setResumeFile(file);
                      }}
                      className="mt-2 block file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                    />
                    {resumeFile && <p className="mt-2 text-sm text-slate-600">Selected: {resumeFile.name}</p>}
                  </div>
                )}

                <div>
                  <FieldLabel>Job Description</FieldLabel>
                  <TextAreaInput
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={10}
                    className="mt-2"
                    placeholder="Paste the role description"
                  />
                </div>

                <PrimaryButton
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Analyzing..." : "Analyze"}
                </PrimaryButton>
              </form>

              {error && (
                <AlertMessage className="mt-4">
                  {error}
                </AlertMessage>
              )}
            </div>

            <aside className="bg-slate-50/80 px-6 py-7 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                What you get
              </p>
              <div className="mt-5 space-y-5">
                <div className="border-l-2 border-[#0B4B4A] pl-4">
                  <div className="text-sm font-medium text-slate-900">A quick score</div>
                  <p className="mt-1 text-sm text-slate-600">
                    See how closely your resume aligns with the role before you apply.
                  </p>
                </div>
                <div className="border-l-2 border-slate-300 pl-4">
                  <div className="text-sm font-medium text-slate-900">Missing skills</div>
                  <p className="mt-1 text-sm text-slate-600">
                    Surface likely gaps so you can strengthen the resume or prepare talking points.
                  </p>
                </div>
                <div className="border-l-2 border-slate-300 pl-4">
                  <div className="text-sm font-medium text-slate-900">Next action</div>
                  <p className="mt-1 text-sm text-slate-600">
                    Save the job directly to your tracker when the role looks promising.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {result && (
          <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0B4B4A]">
                  Result
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Match Score: {result.matchScore}%</h2>
              </div>
              <SecondaryButton
                type="button"
                onClick={openAddToApplicationModal}
              >
                Add to My Application
              </SecondaryButton>
            </div>

            <div className="grid gap-0 lg:grid-cols-2">
              <div className="border-b border-slate-200 px-6 py-6 sm:px-8 lg:border-b-0 lg:border-r">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Matched Skills
                </h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                  {result.matchedSkills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>

                <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Missing Skills
                </h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                  {result.missingSkills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </div>

              <div className="px-6 py-6 sm:px-8">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Suggestions</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={`${suggestion}-${index}`}>{suggestion}</li>
                  ))}
                </ul>

                <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Summary</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{result.summary}</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </PageContainer>

      {showAddModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Add to My Application</h2>
              <p className="mt-1 text-sm text-slate-600">
                Review and complete the fields before saving to your application tracker.
              </p>
            </div>

            <form onSubmit={handleCreateApplication} className="space-y-4">
              <div>
                <FieldLabel>Company</FieldLabel>
                <TextInput
                  value={applicationCompany}
                  onChange={(e) => setApplicationCompany(e.target.value)}
                  className="mt-2"
                  placeholder="e.g. Stripe"
                />
              </div>

              <div>
                <FieldLabel>Position Name</FieldLabel>
                <TextInput
                  value={applicationRoleTitle}
                  onChange={(e) => setApplicationRoleTitle(e.target.value)}
                  className="mt-2"
                  placeholder="e.g. Software Engineer"
                />
              </div>

              <div>
                <FieldLabel>Location</FieldLabel>
                <TextInput
                  value={applicationLocation}
                  onChange={(e) => setApplicationLocation(e.target.value)}
                  className="mt-2"
                  placeholder="e.g. Toronto, ON"
                />
              </div>

              <div>
                <FieldLabel>Job URL</FieldLabel>
                <TextInput
                  value={applicationJobUrl}
                  onChange={(e) => setApplicationJobUrl(e.target.value)}
                  className="mt-2"
                  placeholder="https://..."
                />
              </div>

              <div>
                <FieldLabel>Status</FieldLabel>
                <SelectInput
                  value={applicationStatus}
                  onChange={(e) => setApplicationStatus(e.target.value as ApplicationStatus)}
                  className="mt-2"
                >
                  <option value="" disabled>
                    Select status
                  </option>
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </SelectInput>
              </div>

              {addError && (
                <AlertMessage>
                  {addError}
                </AlertMessage>
              )}

              <div className="flex items-center justify-end gap-3 pt-1">
                <SecondaryButton
                  type="button"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  type="submit"
                  disabled={adding}
                  className="px-4 py-2.5"
                >
                  {adding ? "Adding..." : "Save Application"}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
