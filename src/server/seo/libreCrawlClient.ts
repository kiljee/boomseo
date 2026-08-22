

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