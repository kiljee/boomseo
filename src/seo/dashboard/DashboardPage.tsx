import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  FileSearch,
  Globe,
  Plus,
  Search,
  TrendingUp,
} from "lucide-react";

import { Link, routes } from "wasp/client/router";
import { useQuery, useAction } from "wasp/client/operations";
import {
  getCurrentOrganization,
  leaveOrganization,
} from "wasp/client/operations";
import { useNavigate } from "react-router";

export function DashboardPage() {
  const navigate = useNavigate();

  const { data: organization, isLoading } =
    useQuery(getCurrentOrganization);

  const leaveWorkspace = useAction(leaveOrganization);

  async function handleLeaveWorkspace() {
    if (
      !confirm(
        "Are you sure you want to leave this workspace?"
      )
    ) {
      return;
    }

    await leaveWorkspace({});
    navigate(routes.WorkspacesRoute.to);
    window.location.reload();
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold">
            No organization selected
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Select a workspace to continue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="
          flex flex-col gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        ">
          <div>
            <p className="text-sm text-muted-foreground">
              
            </p>

            <h1 className="
              mt-1
              text-3xl font-bold
              tracking-tight
            ">
              {organization.name} Dashboard
            </h1>

            <p className="
              mt-2
              text-sm
              text-muted-foreground
            ">
              Monitor and improve your website SEO performance.
            </p>
          </div>

        </div>

        {/* Website selector */}
        <div className="
          mt-8
          flex flex-col gap-3
          rounded-2xl
          border border-border
          bg-card
          p-4
          shadow-sm
          sm:flex-row
          sm:items-center
          sm:justify-between
        ">
          <div className="flex items-center gap-3">
            <div className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              bg-primary/10
              text-primary
            ">
              <Globe className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold">
                No website connected
              </p>

              <p className="text-xs text-muted-foreground">
                Add a website to start collecting SEO data.
              </p>
            </div>
          </div>

          <button className="
            rounded-lg
            border border-border
            px-3 py-2
            text-sm
            transition
            hover:bg-muted
          ">
            Add website
          </button>
        </div>

        {/* KPI cards */}
        <div className="
          mt-6
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          lg:grid-cols-4
        ">

          <MetricCard
            title="SEO Health"
            value="-"
            description="Run your first audit"
            icon={<Activity className="h-5 w-5" />}
          />

          <MetricCard
            title="Organic Traffic"
            value="0"
            description="No data available"
            icon={<TrendingUp className="h-5 w-5" />}
          />

          <MetricCard
            title="Tracked Keywords"
            value="0"
            description="No keywords tracked"
            icon={<Search className="h-5 w-5" />}
          />

          <MetricCard
            title="Reports"
            value="0"
            description="No reports generated"
            icon={<BarChart3 className="h-5 w-5" />}
          />

        </div>

        {/* Main section */}
        <div className="
          mt-6
          grid
          grid-cols-1
          gap-6
          lg:grid-cols-3
        ">

          {/* Performance */}
          <div className="
            rounded-2xl
            border border-border
            bg-card
            p-5
            shadow-sm
            lg:col-span-2
          ">
            <div className="
              flex items-start
              justify-between
            ">
              <div>
                <h2 className="font-semibold">
                  Organic Performance
                </h2>

                <p className="
                  mt-1
                  text-xs
                  text-muted-foreground
                ">
                  Organic clicks and impressions
                </p>
              </div>

              <button className="
                text-xs
                font-medium
                text-primary
                hover:underline
              ">
                View report
              </button>
            </div>

            <div className="
              mt-8
              flex h-56
              items-center
              justify-center
              rounded-xl
              border border-dashed
              border-border
              bg-muted/30
            ">
              <div className="text-center">
                <BarChart3 className="
                  mx-auto
                  h-8 w-8
                  text-muted-foreground/50
                " />

                <p className="
                  mt-3
                  text-sm
                  font-medium
                ">
                  No performance data yet
                </p>

                <p className="
                  mt-1
                  text-xs
                  text-muted-foreground
                ">
                  Connect a website to start tracking SEO performance.
                </p>
              </div>
            </div>
          </div>

          {/* SEO Health */}
          <div className="
            rounded-2xl
            border border-border
            bg-card
            p-5
            shadow-sm
          ">
            <div className="
              flex items-start
              justify-between
            ">
              <div>
                <h2 className="font-semibold">
                  SEO Health
                </h2>

                <p className="
                  mt-1
                  text-xs
                  text-muted-foreground
                ">
                  Latest site audit
                </p>
              </div>

              <div className="
                flex h-12 w-12
                items-center justify-center
                rounded-full
                border-4
                border-border
                text-sm font-bold
                text-muted-foreground
              ">
                -
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <HealthRow
                icon={<CheckCircle2 />}
                label="Passed"
                value="—"
              />

              <HealthRow
                icon={<AlertTriangle />}
                label="Warnings"
                value="—"
              />

              <HealthRow
                icon={<AlertTriangle />}
                label="Errors"
                value="—"
              />
            </div>

            <button className="
              mt-6
              flex w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border border-border
              px-4 py-2.5
              text-sm font-medium
              transition
              hover:bg-muted
            ">
              Run first audit
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Lower section */}
        <div className="
          mt-6
          grid
          grid-cols-1
          gap-6
          lg:grid-cols-2
        ">

          {/* Keywords */}
          <div className="
            rounded-2xl
            border border-border
            bg-card
            shadow-sm
          ">
            <div className="
              flex items-center
              justify-between
              border-b border-border
              p-5
            ">
              <div>
                <h2 className="font-semibold">
                  Keyword Rankings
                </h2>

                <p className="
                  mt-1
                  text-xs
                  text-muted-foreground
                ">
                  Track your most important keywords
                </p>
              </div>

              <button className="
                text-xs
                font-medium
                text-primary
                hover:underline
              ">
                View all
              </button>
            </div>

            <div className="
              flex
              h-40
              items-center
              justify-center
              p-5
            ">
              <div className="text-center">
                <Search className="
                  mx-auto
                  h-7 w-7
                  text-muted-foreground/50
                "/>

                <p className="
                  mt-3
                  text-sm font-medium
                ">
                  No keywords tracked
                </p>

                <p className="
                  mt-1
                  text-xs
                  text-muted-foreground
                ">
                  Add keywords to monitor rankings.
                </p>
              </div>
            </div>
          </div>

          {/* Recent audits */}
          <div className="
            rounded-2xl
            border border-border
            bg-card
            shadow-sm
          ">
            <div className="
              flex items-center
              justify-between
              border-b border-border
              p-5
            ">
              <div>
                <h2 className="font-semibold">
                  Recent Audits
                </h2>

                <p className="
                  mt-1
                  text-xs
                  text-muted-foreground
                ">
                  Recently completed website audits
                </p>
              </div>

              <button className="
                text-xs
                font-medium
                text-primary
                hover:underline
              ">
                View all
              </button>
            </div>

            <div className="
              flex
              h-40
              items-center
              justify-center
              p-5
            ">
              <div className="text-center">
                <FileSearch className="
                  mx-auto
                  h-7 w-7
                  text-muted-foreground/50
                "/>

                <p className="
                  mt-3
                  text-sm font-medium
                ">
                  No audits yet
                </p>

                <p className="
                  mt-1
                  text-xs
                  text-muted-foreground
                ">
                  Run your first SEO audit to see results here.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="
          mt-6
          rounded-2xl
          border border-border
          bg-card
          p-5
          shadow-sm
        ">
          <h2 className="font-semibold">
            Quick Actions
          </h2>

          <div className="
            mt-4
            grid
            grid-cols-1
            gap-3
            sm:grid-cols-3
          ">
            <QuickAction
              icon={<FileSearch />}
              title="Run SEO Audit"
              description="Check your website for technical SEO issues."
            />

            <QuickAction
              icon={<Search />}
              title="Track Keywords"
              description="Add keywords and monitor their rankings."
            />

            <QuickAction
              icon={<BarChart3 />}
              title="View Reports"
              description="Analyze your SEO performance over time."
            />
          </div>
        </div>

        {/* Workspace */}
        <div className="
          mt-6
          rounded-2xl
          border border-border
          bg-card
          p-5
          shadow-sm
        ">
          <h2 className="font-semibold">
            Workspace
          </h2>

          <p className="
            mt-1
            text-sm
            text-muted-foreground
          ">
            Manage your team and workspace settings.
          </p>

          <div className="
            mt-4
            flex flex-col gap-3
            sm:flex-row
          ">
            <Link
              to={routes.MembersRoute.to}
              className="
                inline-flex
                items-center
                justify-center
                rounded-xl
                border border-border
                px-4 py-2.5
                text-sm font-medium
                transition
                hover:bg-muted
              "
            >
              Manage Members
            </Link>

            <button
              onClick={handleLeaveWorkspace}
              className="
                inline-flex
                items-center
                justify-center
                rounded-xl
                border border-destructive/30
                px-4 py-2.5
                text-sm font-semibold
                text-destructive
                transition
                hover:bg-destructive/10
              "
            >
              Leave Workspace
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}


/* ============================================================
   Components
   ============================================================ */

function MetricCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="
      rounded-2xl
      border border-border
      bg-card
      p-5
      shadow-sm
    ">
      <div className="
        flex items-center
        justify-between
      ">
        <span className="
          text-sm
          text-muted-foreground
        ">
          {title}
        </span>

        <div className="
          rounded-lg
          bg-primary/10
          p-2
          text-primary
        ">
          {icon}
        </div>
      </div>

      <p className="
        mt-4
        text-3xl
        font-bold
        tracking-tight
      ">
        {value}
      </p>

      <p className="
        mt-1
        text-xs
        text-muted-foreground
      ">
        {description}
      </p>
    </div>
  );
}


function HealthRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="
      flex items-center
      justify-between
    ">
      <div className="
        flex items-center
        gap-2
        text-sm
      ">
        <span className="
          h-4 w-4
          text-muted-foreground
        ">
          {icon}
        </span>

        <span>{label}</span>
      </div>

      <span className="
        text-sm
        font-semibold
      ">
        {value}
      </span>
    </div>
  );
}


function QuickAction({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button className="
      flex items-start
      gap-3
      rounded-xl
      border border-border
      p-4
      text-left
      transition
      hover:bg-muted
    ">
      <div className="
        shrink-0
        rounded-lg
        bg-primary/10
        p-2
        text-primary
      ">
        {icon}
      </div>

      <div>
        <p className="
          text-sm
          font-semibold
        ">
          {title}
        </p>

        <p className="
          mt-1
          text-xs
          leading-relaxed
          text-muted-foreground
        ">
          {description}
        </p>
      </div>
    </button>
  );
}