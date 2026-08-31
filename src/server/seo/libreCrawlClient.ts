

const LIBRECRAWL_URL =
  process.env.LIBRECRAWL_URL ?? "http://localhost:5000";

let sessionCookie: string | null = null;

function updateSessionCookie(response: Response) {
  const setCookie = response.headers.get("set-cookie");

  if (!setCookie) return;

  sessionCookie = setCookie
    .split(",")
    .map(cookie => cookie.split(";")[0].trim())
    .join("; ");
}

async function getSessionCookie() {
  if (sessionCookie) {
    return sessionCookie;
  }

  const response = await fetch(
    `${LIBRECRAWL_URL}/api/guest-login`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error(
      `LibreCrawl guest login failed: ${response.status}`
    );
  }

  const cookie = response.headers.get("set-cookie");

  if (!cookie) {
    throw new Error("LibreCrawl did not return a session cookie");
  }

  sessionCookie = cookie.split(";")[0];

  console.log("GOT COOKIE!");
  console.log("Cookie: "+sessionCookie);

  return sessionCookie;
}

async function request(
  path: string,
  options: RequestInit = {}
) {
  const cookie = await getSessionCookie();

  const headers = new Headers(options.headers);

  headers.set("Cookie", cookie);

  const response = await fetch(
    `${LIBRECRAWL_URL}${path}`,
    {
      ...options,
      headers,
    }
  );

  updateSessionCookie(response);

  if (response.status === 401 || response.status === 403) {
    sessionCookie = null;

    throw new Error(
      "LibreCrawl session expired"
    );
  }

  if (!response.ok) {
    throw new Error(
      `LibreCrawl ${response.status}: ${await response.text()}`
    );
  }

  const data = await response.json();

  console.log(
    "LOGIN SET-COOKIE:",
    response.headers.get("set-cookie")
  );

  if(path === "/api/start_crawl") {
    console.log("CRAWL STARTED");
    console.log("Cookie: "+cookie);
    console.log(data);
  }


  return data;
}

export async function startCrawl(
  websiteUrl: string
) {

  await saveLibreCrawlSettings();

  return request("/api/start_crawl", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: websiteUrl,
    }),
  });
}

export async function getCrawlStatus() {
  const response = await fetch(
    `${LIBRECRAWL_URL}/api/crawl_status`,
      {
        headers: {
          Cookie: sessionCookie ?? "",
        },
      }
    );

    updateSessionCookie(response);

    console.log("GETTING CRAWL STATUS!")

    if(!response.ok) {
      throw new Error(
        `LibreCrawl status failed: ${response.status}`
      );
    }

    const data = await response.json();

    console.log(data);
    console.log("Cookie: "+sessionCookie)

    return data;
}


export async function saveLibreCrawlSettings() {
  const response = await fetch(
    `${LIBRECRAWL_URL}/api/save_settings`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie ?? "",
      },
      body: JSON.stringify({
        max_depth: 3,
        max_urls: 5000000,

        delay: 0.5,
        follow_redirects: true,
        crawl_external: false,

        enable_pagespeed: true,
        google_api_key: process.env.GOOGLE_PSI_API_KEY ?? "",

        enable_javascript: true,

        concurrency: 5,
        timeout: 10,
        retries: 3,
        respect_robots: true,
        discover_sitemaps: true,
      }),
    }
  );

  updateSessionCookie(response);

  console.log("Google PSI key: "+process.env.GOOGLE_PSI_API_KEY);



  if (!response.ok) {
    throw new Error(
      `LibreCrawl save settings failed: ${response.status}`
    );
  }

  const result = await response.json();

  console.log("LibreCrawl settings saved:", result);

  // Push the settings to the currently active crawler.
  const updateResponse = await fetch(
    `${LIBRECRAWL_URL}/api/update_crawler_settings`,
    {
      method: "POST",
      headers: {
        Cookie: sessionCookie ?? "",
      },
    }
  );

  updateSessionCookie(updateResponse);

  const settingsResponse = await fetch(
  `${LIBRECRAWL_URL}/api/get_settings`,
  {
    headers: {
      Cookie: sessionCookie ?? "",
    },
  }
);

console.log(
  "FINAL SETTINGS:",
  await settingsResponse.json()
);

  updateSessionCookie(settingsResponse);

  if (!updateResponse.ok) {
    throw new Error(
      `LibreCrawl update crawler settings failed: ${updateResponse.status}`
    );
  }

  return result;
}

export function isCrawlRunning(crawl: any): boolean {
  if (!crawl) return false;

  const status = (crawl.status || "").toLowerCase();
  if (status === "running" || status === "in_progress" || status === "crawling" || status === "started") {
    return true;
  }

  if (status === "completed" || status === "finished" || status === "stopped" || status === "failed" || status === "error") {
    return false;
  }

  if (typeof crawl.is_running === "boolean") return crawl.is_running;
  if (typeof crawl.is_crawling === "boolean") return crawl.is_crawling;

  if (typeof crawl.progress === "number" && crawl.progress >= 0 && crawl.progress < 100) {
    return true;
  }

  return false;
}