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
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Resume Match</h1>
          <p className="mt-1 text-sm text-slate-600">
            Compare your resume against a job description and get targeted improvement tips.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>

              <div className="mt-2 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
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

        {result && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Match Score: {result.matchScore}%</h2>
              <SecondaryButton
                type="button"
                onClick={openAddToApplicationModal}
              >
                Add to My Application
              </SecondaryButton>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Matched Skills
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {result.matchedSkills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Missing Skills
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {result.missingSkills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Suggestions
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {result.suggestions.map((suggestion, index) => (
                  <li key={`${suggestion}-${index}`}>{suggestion}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Summary</h3>
              <p className="mt-2 text-sm text-slate-700">{result.summary}</p>
            </div>
          </div>
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