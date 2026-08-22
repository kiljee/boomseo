import { useState } from "react";
import { useNavigate } from "react-router";
import { useAction } from "wasp/client/operations";
import { createOrganization } from "wasp/client/operations";
import { routes } from "wasp/client/router";
import { Props } from "../../onboarding/types"



type TeamRole = "ADMIN" | "MEMBER";

type Invite = {
  id: number;
  email: string;
  role: TeamRole;
};

const WORKSPACE_ICONS = [
  "🔎",
  "🚀",
  "📈",
  "🌐",
  "💡",
  "⚡",
  "🎯",
  "🛠️",
];

const INDUSTRIES = [
  "Technology",
  "E-commerce",
  "Finance",
  "Healthcare",
  "Education",
  "Marketing",
  "Real Estate",
  "Travel",
  "Other",
];

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Greece",
  "Serbia",
  "Other"
];

const LANGUAGES = [
  "English",
  "German",
  "French",
  "Spanish",
  "Italian",
  "Greek",
  "Serbian"
];

export function CreateOrganizationPage({
  onContinue,
  onBack
}: Props) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("🔎");
  const [description, setDescription] = useState("");

  const [websiteUrl, setWebsiteUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("English");

  const [invites, setInvites] = useState<Invite[]>([]);

  const create = useAction(createOrganization);
  const navigate = useNavigate();

  function handleNameChange(value: string) {
    setName(value);

    const generatedSlug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setSlug(generatedSlug);
  }

  function addInvite() {
    setInvites((current) => [
      ...current,
      {
        id: Date.now(),
        email: "",
        role: "MEMBER",
      },
    ]);
  }

  function updateInvite(
    id: number,
    field: "email" | "role",
    value: string
  ) {
    setInvites((current) =>
      current.map((invite) =>
        invite.id === id
          ? { ...invite, [field]: value }
          : invite
      )
    );
  }

  function removeInvite(id: number) {
    setInvites((current) =>
      current.filter((invite) => invite.id !== id)
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await create({
      name,
      slug,
      icon,
      description,

      websiteUrl,
      industry,
      country,
      language,

      invites: invites
        .filter((invite) => invite.email.trim())
        .map((invite) => ({
          email: invite.email.trim(),
          role: invite.role,
        })),
    });

    navigate(routes.DashboardRoute.to);
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="
            text-3xl font-bold
            tracking-tight text-foreground
          ">
            Create your workspace
          </h1>

          <p className="
            mt-2 text-sm leading-6
            text-muted-foreground
          ">
            Set up your workspace so we can analyze
            your website and generate SEO content.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="
            rounded-2xl
            border border-border
            bg-card
            p-6
            shadow-sm
            sm:p-8
          "
        >

          {/* Workspace Details */}
          <div>
            <h2 className="
              text-lg font-semibold
              text-foreground
            ">
              Workspace details
            </h2>

            <p className="
              mt-1 text-xs
              text-muted-foreground
            ">
              Give your SEO workspace an identity.
            </p>
          </div>

          <div className="
            mt-6 grid grid-cols-1
            gap-5 sm:grid-cols-2
          ">

            {/* Name */}
            <div>
              <label className="
                mb-2 block text-sm
                font-medium text-foreground
              ">
                Workspace name
                <span className="ml-1 text-destructive">*</span>
              </label>

              <input
                required
                value={name}
                onChange={(e) =>
                  handleNameChange(e.target.value)
                }
                placeholder="e.g. Acme SEO"
                className="
                  w-full rounded-xl
                  border border-input
                  bg-background
                  px-4 py-2.5
                  text-sm text-foreground
                  outline-none
                  placeholder:text-muted-foreground
                  focus:border-primary
                  focus:ring-1 focus:ring-primary
                "
              />
            </div>

            {/* Slug */}
            <div>
              <label className="
                mb-2 block text-sm
                font-medium text-foreground
              ">
                Workspace slug
              </label>

              <div className="
                flex overflow-hidden
                rounded-xl border border-input
                bg-background
              ">
                <span className="
                  flex items-center
                  border-r border-input
                  bg-muted/50
                  px-3 text-xs
                  text-muted-foreground
                ">
                  /workspace/
                </span>

                <input
                  required
                  value={slug}
                  onChange={(e) =>
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "-")
                    )
                  }
                  className="
                    min-w-0 flex-1
                    bg-transparent
                    px-3 py-2.5
                    text-sm text-foreground
                    outline-none
                  "
                  placeholder="acme-seo"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-5">
            <label className="
              mb-2 block text-sm
              font-medium text-foreground
            ">
              Workspace description
              <span className="
                ml-2 text-xs font-normal
                text-muted-foreground
              ">
                Optional
              </span>
            </label>

            <textarea
              rows={3}
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Briefly describe your company or SEO project."
              className="
                w-full resize-none
                rounded-xl border border-input
                bg-background
                px-4 py-3
                text-sm text-foreground
                outline-none
                placeholder:text-muted-foreground
                focus:border-primary
                focus:ring-1 focus:ring-primary
              "
            />
          </div>

          {/* Icon */}
          <div className="
            mt-8 border-t border-border pt-6
          ">
            <label className="
              block text-sm font-medium
              text-foreground
            ">
              Workspace icon
            </label>

            <div className="
              mt-3 flex flex-wrap gap-2
            ">
              {WORKSPACE_ICONS.map((workspaceIcon) => (
                <button
                  key={workspaceIcon}
                  type="button"
                  onClick={() => setIcon(workspaceIcon)}
                  className={`
                    flex h-10 w-10
                    items-center justify-center
                    rounded-xl border text-lg
                    transition
                    ${
                      icon === workspaceIcon
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                        : "border-border bg-background hover:bg-muted"
                    }
                  `}
                >
                  {workspaceIcon}
                </button>
              ))}
            </div>
          </div>

          {/* Website / SEO Information */}
          <div className="
            mt-8 border-t border-border pt-6
          ">
            <h2 className="
              text-lg font-semibold
              text-foreground
            ">
              Website information
            </h2>

            <p className="
              mt-1 text-xs
              text-muted-foreground
            ">
              This information will be used for your initial
              SEO analysis.
            </p>

            <div className="
              mt-5 grid grid-cols-1
              gap-5 sm:grid-cols-2
            ">

              {/* Website URL */}
              <div className="sm:col-span-2">
                <label className="
                  mb-2 block text-sm
                  font-medium text-foreground
                ">
                  Website URL
                  <span className="ml-1 text-destructive">
                    *
                  </span>
                </label>

                <input
                  required
                  type="url"
                  value={websiteUrl}
                  onChange={(e) =>
                    setWebsiteUrl(e.target.value)
                  }
                  placeholder="https://example.com"
                  className="
                    w-full rounded-xl
                    border border-input
                    bg-background
                    px-4 py-2.5
                    text-sm text-foreground
                    outline-none
                    placeholder:text-muted-foreground
                    focus:border-primary
                    focus:ring-1 focus:ring-primary
                  "
                />
              </div>

              {/* Industry */}
              <div>
                <label className="
                  mb-2 block text-sm
                  font-medium text-foreground
                ">
                  Industry
                  <span className="ml-1 text-destructive">
                    *
                  </span>
                </label>

                <select
                  required
                  value={industry}
                  onChange={(e) =>
                    setIndustry(e.target.value)
                  }
                  className="
                    w-full rounded-xl
                    border border-input
                    bg-background
                    px-3 py-2.5
                    text-sm text-foreground
                    outline-none
                    focus:border-primary
                  "
                >
                  <option value="">
                    Select industry
                  </option>

                  {INDUSTRIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Country */}
              <div>
                <label className="
                  mb-2 block text-sm
                  font-medium text-foreground
                ">
                  Country
                  <span className="ml-1 text-destructive">
                    *
                  </span>
                </label>

                <select
                  required
                  value={country}
                  onChange={(e) =>
                    setCountry(e.target.value)
                  }
                  className="
                    w-full rounded-xl
                    border border-input
                    bg-background
                    px-3 py-2.5
                    text-sm text-foreground
                    outline-none
                    focus:border-primary
                  "
                >
                  <option value="">
                    Select country
                  </option>

                  {COUNTRIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div className="sm:col-span-2">
                <label className="
                  mb-2 block text-sm
                  font-medium text-foreground
                ">
                  Website language
                  <span className="ml-1 text-destructive">
                    *
                  </span>
                </label>

                <select
                  required
                  value={language}
                  onChange={(e) =>
                    setLanguage(e.target.value)
                  }
                  className="
                    w-full rounded-xl
                    border border-input
                    bg-background
                    px-3 py-2.5
                    text-sm text-foreground
                    outline-none
                    focus:border-primary
                  "
                >
                  {LANGUAGES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="
            mt-8 border-t border-border pt-6
          ">
            <div className="
              flex flex-col gap-3
              sm:flex-row sm:items-center
              sm:justify-between
            ">
              <div>
                <h2 className="
                  text-lg font-semibold
                  text-foreground
                ">
                  Invite team members
                </h2>

                <p className="
                  mt-1 text-xs
                  text-muted-foreground
                ">
                  Optional. You can invite team members now
                  or later.
                </p>
              </div>

              <button
                type="button"
                onClick={addInvite}
                className="
                  w-full rounded-lg
                  border border-border
                  bg-background
                  px-3 py-2
                  text-xs font-medium
                  text-foreground
                  transition hover:bg-muted
                  sm:w-auto
                "
              >
                + Add member
              </button>
            </div>

            {invites.length > 0 && (
              <div className="mt-4 space-y-3">
                {invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="
                      flex flex-col gap-2
                      sm:flex-row
                    "
                  >
                    <input
                      type="email"
                      value={invite.email}
                      onChange={(e) =>
                        updateInvite(
                          invite.id,
                          "email",
                          e.target.value
                        )
                      }
                      placeholder="colleague@company.com"
                      className="
                        min-w-0 flex-1
                        rounded-xl
                        border border-input
                        bg-background
                        px-4 py-2.5
                        text-sm text-foreground
                        outline-none
                        placeholder:text-muted-foreground
                        focus:border-primary
                        focus:ring-1 focus:ring-primary
                      "
                    />

                    <select
                      value={invite.role}
                      onChange={(e) =>
                        updateInvite(
                          invite.id,
                          "role",
                          e.target.value
                        )
                      }
                      className="
                        rounded-xl
                        border border-input
                        bg-background
                        px-3 py-2.5
                        text-sm text-foreground
                        outline-none
                        focus:border-primary
                      "
                    >
                      <option value="MEMBER">
                        MEMBER
                      </option>
                      <option value="ADMIN">
                        ADMIN
                      </option>
                    </select>

                    <button
                      type="button"
                      onClick={() =>
                        removeInvite(invite.id)
                      }
                      className="
                        rounded-xl
                        border border-border
                        px-3
                        text-sm
                        text-muted-foreground
                        transition
                        hover:bg-muted
                        hover:text-destructive
                      "
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Owner Notice */}
          <div className="
            mt-8 rounded-xl
            border border-amber-500/30
            bg-amber-500/10
            p-4
          ">
            <p className="
              text-xs leading-5
              text-amber-700
              dark:text-amber-300
            ">
              As workspace{" "}
              <span className="font-bold underline">
                OWNER
              </span>
              , you will have billing rights, role
              assignment permissions, and workspace
              management control.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={
              !name.trim() ||
              !websiteUrl.trim() ||
              !industry ||
              !country ||
              !language
            }
            className="
              mt-6 w-full
              rounded-xl
              bg-primary
              px-4 py-3.5
              text-sm font-semibold
              text-primary-foreground
              shadow-sm
              transition
              hover:opacity-90
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Create Workspace
          </button>

        </form>
      </div>
    </div>
  );
}